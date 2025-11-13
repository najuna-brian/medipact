const hre = require("hardhat");

async function main() {
  console.log("=== MediPact Smart Contract Deployment ===\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString(), "\n");

  // For RevenueSplitter constructor, we need recipient addresses
  // Note: These are used for the fixed constructor values and the old distributeRevenue() function
  // The new distributeRevenueTo() function uses dynamic addresses per transaction
  // PATIENT_WALLET and HOSPITAL_WALLET are optional (only used for backward compatibility)
  // MEDIPACT_WALLET is required (fixed platform wallet)
  const patientWallet = process.env.PATIENT_WALLET || deployer.address; // Optional: only for backward compatibility
  const hospitalWallet = process.env.HOSPITAL_WALLET || deployer.address; // Optional: only for backward compatibility
  const medipactWallet = process.env.MEDIPACT_WALLET || deployer.address; // Required: fixed platform wallet

  console.log("Recipient Addresses:");
  console.log("  Patient Wallet:", patientWallet);
  console.log("  Hospital Wallet:", hospitalWallet);
  console.log("  MediPact Wallet:", medipactWallet);
  console.log("");

  // Get current gas price from network
  const feeData = await hre.ethers.provider.getFeeData();
  console.log("Current gas price:", feeData.gasPrice?.toString(), "wei");
  console.log("");

  // Determine network path for HashScan links
  const network = hre.network.name === 'hederaMainnet' ? '' : `${hre.network.name.replace('hedera', '')}.`;

  // Deploy ConsentManager (no constructor parameters)
  console.log("1. Deploying ConsentManager...");
  const ConsentManager = await hre.ethers.getContractFactory("ConsentManager");
  const consentManager = await ConsentManager.deploy({
    gasPrice: feeData.gasPrice || undefined, // Use network gas price
  });
  await consentManager.waitForDeployment();
  const consentManagerAddress = await consentManager.getAddress();
  console.log("   ✓ ConsentManager deployed to:", consentManagerAddress);
  console.log("   ✓ HashScan: https://hashscan.io/" + network + "contract/" + consentManagerAddress + "\n");

  // Deploy RevenueSplitter
  console.log("2. Deploying RevenueSplitter...");
  const RevenueSplitter = await hre.ethers.getContractFactory("RevenueSplitter");
  const revenueSplitter = await RevenueSplitter.deploy(
    patientWallet,
    hospitalWallet,
    medipactWallet,
    {
      gasPrice: feeData.gasPrice || undefined, // Use network gas price
    }
  );
  await revenueSplitter.waitForDeployment();
  const revenueSplitterAddress = await revenueSplitter.getAddress();
  console.log("   ✓ RevenueSplitter deployed to:", revenueSplitterAddress);
  console.log("   ✓ HashScan: https://hashscan.io/" + network + "contract/" + revenueSplitterAddress + "\n");

  // Verify contract ownership
  console.log("3. Verifying contract ownership...");
  const consentManagerOwner = await consentManager.owner();
  const revenueSplitterOwner = await revenueSplitter.owner();
  console.log("   ✓ ConsentManager owner:", consentManagerOwner);
  console.log("   ✓ RevenueSplitter owner:", revenueSplitterOwner);
  console.log("   ✓ Deployer address:", deployer.address);
  console.log("");

  // Verify RevenueSplitter recipients
  console.log("4. Verifying RevenueSplitter recipients...");
  const patientWalletSet = await revenueSplitter.patientWallet();
  const hospitalWalletSet = await revenueSplitter.hospitalWallet();
  const medipactWalletSet = await revenueSplitter.medipactWallet();
  console.log("   ✓ Patient Wallet:", patientWalletSet);
  console.log("   ✓ Hospital Wallet:", hospitalWalletSet);
  console.log("   ✓ MediPact Wallet:", medipactWalletSet);
  console.log("");

  // Get split percentages (values are in basis points, e.g., 6000 = 60%)
  const [patientShare, hospitalShare, medipactShare] = await revenueSplitter.getSplitPercentages();
  console.log("5. Revenue Split Configuration:");
  console.log(`   ✓ Patient Share: ${Number(patientShare) / 100}%`);
  console.log(`   ✓ Hospital Share: ${Number(hospitalShare) / 100}%`);
  console.log(`   ✓ MediPact Share: ${Number(medipactShare) / 100}%`);
  console.log("");

  console.log("=== Deployment Complete ===\n");
  console.log("Contract Addresses:");
  console.log(`  ConsentManager: ${consentManagerAddress}`);
  console.log(`  RevenueSplitter: ${revenueSplitterAddress}\n`);

  console.log("Next Steps:");
  console.log("1. Save these addresses in your .env file:");
  console.log(`   CONSENT_MANAGER_ADDRESS="${consentManagerAddress}"`);
  console.log(`   REVENUE_SPLITTER_ADDRESS="${revenueSplitterAddress}"`);
  console.log("2. Update your adapter to use these contract addresses");
  console.log("3. Test contract interactions");
  console.log("");

  // Save addresses to a file for easy reference
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      ConsentManager: consentManagerAddress,
      RevenueSplitter: revenueSplitterAddress,
    },
    recipients: {
      patientWallet: patientWalletSet,
      hospitalWallet: hospitalWalletSet,
      medipactWallet: medipactWalletSet,
    },
    split: {
      patient: `${Number(patientShare) / 100}%`,
      hospital: `${Number(hospitalShare) / 100}%`,
      medipact: `${Number(medipactShare) / 100}%`,
    },
  };

  fs.writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("✓ Deployment info saved to deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

