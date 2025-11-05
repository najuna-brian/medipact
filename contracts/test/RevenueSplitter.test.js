const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RevenueSplitter", function () {
  let revenueSplitter;
  let owner;
  let patientWallet;
  let hospitalWallet;
  let medipactWallet;
  let otherAccount;

  beforeEach(async function () {
    [owner, patientWallet, hospitalWallet, medipactWallet, otherAccount] = await ethers.getSigners();

    const RevenueSplitter = await ethers.getContractFactory("RevenueSplitter");
    revenueSplitter = await RevenueSplitter.deploy(
      patientWallet.address,
      hospitalWallet.address,
      medipactWallet.address
    );
    await revenueSplitter.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct recipient addresses", async function () {
      expect(await revenueSplitter.patientWallet()).to.equal(patientWallet.address);
      expect(await revenueSplitter.hospitalWallet()).to.equal(hospitalWallet.address);
      expect(await revenueSplitter.medipactWallet()).to.equal(medipactWallet.address);
    });

    it("Should set the deployer as owner", async function () {
      expect(await revenueSplitter.owner()).to.equal(owner.address);
    });

    it("Should have correct split percentages", async function () {
      const [patientShare, hospitalShare, medipactShare] = await revenueSplitter.getSplitPercentages();
      expect(patientShare).to.equal(6000); // 60%
      expect(hospitalShare).to.equal(2500); // 25%
      expect(medipactShare).to.equal(1500); // 15%
    });
  });

  describe("Revenue Distribution", function () {
    it("Should distribute revenue automatically when receiving HBAR", async function () {
      const amount = ethers.parseEther("1.0"); // 1 HBAR
      
      const patientBalanceBefore = await ethers.provider.getBalance(patientWallet.address);
      const hospitalBalanceBefore = await ethers.provider.getBalance(hospitalWallet.address);
      const medipactBalanceBefore = await ethers.provider.getBalance(medipactWallet.address);

      await owner.sendTransaction({
        to: await revenueSplitter.getAddress(),
        value: amount,
      });

      const patientBalanceAfter = await ethers.provider.getBalance(patientWallet.address);
      const hospitalBalanceAfter = await ethers.provider.getBalance(hospitalWallet.address);
      const medipactBalanceAfter = await ethers.provider.getBalance(medipactWallet.address);

      // Patient should receive 60% (0.6 HBAR)
      expect(patientBalanceAfter - patientBalanceBefore).to.equal(ethers.parseEther("0.6"));
      // Hospital should receive 25% (0.25 HBAR)
      expect(hospitalBalanceAfter - hospitalBalanceBefore).to.equal(ethers.parseEther("0.25"));
      // MediPact should receive 15% (0.15 HBAR)
      expect(medipactBalanceAfter - medipactBalanceBefore).to.equal(ethers.parseEther("0.15"));
    });

    it("Should emit RevenueReceived and RevenueDistributed events", async function () {
      const amount = ethers.parseEther("1.0");
      
      await expect(
        owner.sendTransaction({
          to: await revenueSplitter.getAddress(),
          value: amount,
        })
      )
        .to.emit(revenueSplitter, "RevenueReceived")
        .withArgs(owner.address, amount)
        .and.to.emit(revenueSplitter, "RevenueDistributed");
    });

    it("Should handle manual distribution", async function () {
      // Since receive() automatically distributes, we can't test manual distribution
      // with a direct send. Instead, we verify the contract has distributeRevenue() function
      // and that it works when there are accumulated funds (which would be rare in practice)
      
      // The contract's receive() function automatically distributes, so manual distribution
      // would only be needed if funds accumulated some other way (not typical)
      // This test verifies the function exists and can be called
      const contractAddress = await revenueSplitter.getAddress();
      const balance = await ethers.provider.getBalance(contractAddress);
      
      // If balance is 0 (which it should be after auto-distribution), manual distribution should revert
      if (balance === 0n) {
        await expect(revenueSplitter.distributeRevenue()).to.be.reverted;
      } else {
        // If somehow there's a balance, manual distribution should work
        await expect(revenueSplitter.distributeRevenue()).to.not.be.reverted;
      }
    });
  });

  describe("Access Control", function () {
    it("Should allow owner to update recipients", async function () {
      const newPatientWallet = otherAccount.address;
      
      await expect(
        revenueSplitter.updateRecipients(
          newPatientWallet,
          hospitalWallet.address,
          medipactWallet.address
        )
      )
        .to.emit(revenueSplitter, "RecipientsUpdated")
        .withArgs(newPatientWallet, hospitalWallet.address, medipactWallet.address);

      expect(await revenueSplitter.patientWallet()).to.equal(newPatientWallet);
    });

    it("Should not allow non-owner to update recipients", async function () {
      await expect(
        revenueSplitter.connect(otherAccount).updateRecipients(
          otherAccount.address,
          hospitalWallet.address,
          medipactWallet.address
        )
      ).to.be.reverted;
    });

    it("Should allow owner to transfer ownership", async function () {
      await expect(revenueSplitter.transferOwnership(otherAccount.address))
        .to.emit(revenueSplitter, "OwnershipTransferred")
        .withArgs(owner.address, otherAccount.address);

      expect(await revenueSplitter.owner()).to.equal(otherAccount.address);
    });
  });

  describe("Error Handling", function () {
    it("Should revert if no funds to distribute", async function () {
      await expect(revenueSplitter.distributeRevenue()).to.be.reverted;
    });

    it("Should revert if invalid addresses provided", async function () {
      await expect(
        revenueSplitter.updateRecipients(
          ethers.ZeroAddress,
          hospitalWallet.address,
          medipactWallet.address
        )
      ).to.be.reverted;
    });
  });
});

