const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ConsentManager", function () {
  let consentManager;
  let owner;
  let otherAccount;

  beforeEach(async function () {
    [owner, otherAccount] = await ethers.getSigners();

    const ConsentManager = await ethers.getContractFactory("ConsentManager");
    consentManager = await ConsentManager.deploy();
    await consentManager.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the deployer as owner", async function () {
      expect(await consentManager.owner()).to.equal(owner.address);
    });

    it("Should start with zero consent records", async function () {
      expect(await consentManager.getConsentCount()).to.equal(0);
    });
  });

  describe("Recording Consent", function () {
    const patientId = "ID-12345";
    const anonymousPatientId = "PID-001";
    const hcsTopicId = "0.0.123456";
    const consentHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

    it("Should record a new consent", async function () {
      await expect(
        consentManager.recordConsent(
          patientId,
          anonymousPatientId,
          hcsTopicId,
          consentHash
        )
      )
        .to.emit(consentManager, "ConsentRecorded")
        .withArgs(patientId, anonymousPatientId, hcsTopicId, consentHash);

      const consent = await consentManager.getConsent(patientId);
      expect(consent.patientId).to.equal(patientId);
      expect(consent.anonymousPatientId).to.equal(anonymousPatientId);
      expect(consent.hcsTopicId).to.equal(hcsTopicId);
      expect(consent.consentHash).to.equal(consentHash);
      expect(consent.isValid).to.equal(true);
    });

    it("Should create mapping from anonymous ID to patient ID", async function () {
      await consentManager.recordConsent(
        patientId,
        anonymousPatientId,
        hcsTopicId,
        consentHash
      );

      const consent = await consentManager.getConsentByAnonymousId(anonymousPatientId);
      expect(consent.patientId).to.equal(patientId);
    });

    it("Should increment consent count", async function () {
      expect(await consentManager.getConsentCount()).to.equal(0);
      
      await consentManager.recordConsent(
        patientId,
        anonymousPatientId,
        hcsTopicId,
        consentHash
      );

      expect(await consentManager.getConsentCount()).to.equal(1);
    });

    it("Should not allow duplicate consent records", async function () {
      await consentManager.recordConsent(
        patientId,
        anonymousPatientId,
        hcsTopicId,
        consentHash
      );

      await expect(
        consentManager.recordConsent(
          patientId,
          "PID-002",
          hcsTopicId,
          consentHash
        )
      ).to.be.reverted;
    });

    it("Should not allow non-owner to record consent", async function () {
      await expect(
        consentManager.connect(otherAccount).recordConsent(
          patientId,
          anonymousPatientId,
          hcsTopicId,
          consentHash
        )
      ).to.be.reverted;
    });
  });

  describe("Consent Validity", function () {
    const patientId = "ID-12345";
    const anonymousPatientId = "PID-001";
    const hcsTopicId = "0.0.123456";
    const consentHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

    beforeEach(async function () {
      await consentManager.recordConsent(
        patientId,
        anonymousPatientId,
        hcsTopicId,
        consentHash
      );
    });

    it("Should return true for valid consent", async function () {
      expect(await consentManager.isConsentValid(patientId)).to.equal(true);
    });

    it("Should revoke consent", async function () {
      await expect(consentManager.revokeConsent(patientId))
        .to.emit(consentManager, "ConsentRevoked")
        .withArgs(patientId);

      expect(await consentManager.isConsentValid(patientId)).to.equal(false);
    });

    it("Should reinstate revoked consent", async function () {
      await consentManager.revokeConsent(patientId);
      expect(await consentManager.isConsentValid(patientId)).to.equal(false);

      await expect(consentManager.reinstateConsent(patientId))
        .to.emit(consentManager, "ConsentReinstated")
        .withArgs(patientId);

      expect(await consentManager.isConsentValid(patientId)).to.equal(true);
    });
  });

  describe("Access Control", function () {
    it("Should allow owner to transfer ownership", async function () {
      await expect(consentManager.transferOwnership(otherAccount.address))
        .to.emit(consentManager, "OwnershipTransferred")
        .withArgs(owner.address, otherAccount.address);

      expect(await consentManager.owner()).to.equal(otherAccount.address);
    });
  });

  describe("Error Handling", function () {
    it("Should revert when getting non-existent consent", async function () {
      await expect(consentManager.getConsent("NON-EXISTENT")).to.be.reverted;
    });

    it("Should revert when revoking non-existent consent", async function () {
      await expect(consentManager.revokeConsent("NON-EXISTENT")).to.be.reverted;
    });
  });
});

