require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hederaTestnet: {
      url: process.env.HEDERA_RPC_URL || "https://testnet.hashio.io/api",
      chainId: 296,
      accounts: process.env.OPERATOR_KEY_HEX ? [process.env.OPERATOR_KEY_HEX] : [],
      // Minimum gas price on Hedera JSON-RPC Relay is 500 gwei (500000000000)
      gasPrice: 500000000000,
    },
    hederaPreviewnet: {
      url: process.env.HEDERA_PREVIEWNET_RPC_URL || "https://previewnet.hashio.io/api",
      chainId: 297,
      accounts: process.env.PREVIEWNET_OPERATOR_KEY_HEX ? [process.env.PREVIEWNET_OPERATOR_KEY_HEX] : [],
      // Minimum gas price on Hedera JSON-RPC Relay is 500 gwei (500000000000)
      gasPrice: 500000000000,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

