// scripts/deploy.js — Deploy MeetingRegistry + MeetingNFT and save ABIs to frontend
const { ethers } = require("hardhat");
const fs   = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance    = await ethers.provider.getBalance(deployer.address);

  console.log("──────────────────────────────────────────");
  console.log("  EtherXMeet Contract Deployment");
  console.log("──────────────────────────────────────────");
  console.log(`  Deployer : ${deployer.address}`);
  console.log(`  Balance  : ${ethers.formatEther(balance)} MATIC\n`);

  const outputDir = path.join(__dirname, "../frontend/src/contracts");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  // ── 1. Deploy MeetingRegistry ─────────────────────────────────────────────
  console.log("  Deploying MeetingRegistry...");
  const RegistryFactory = await ethers.getContractFactory("MeetingRegistry");
  const registry        = await RegistryFactory.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log(`  ✔ MeetingRegistry : ${registryAddress}`);

  const registryArtifact = JSON.parse(fs.readFileSync(
    path.join(__dirname, "../artifacts/contracts/MeetingRegistry.sol/MeetingRegistry.json"), "utf8"
  ));
  fs.writeFileSync(
    path.join(outputDir, "MeetingRegistry.json"),
    JSON.stringify({ address: registryAddress, abi: registryArtifact.abi }, null, 2)
  );

  // ── 2. Deploy MeetingNFT (depends on registry address) ───────────────────
  console.log("  Deploying MeetingNFT...");
  const NFTFactory = await ethers.getContractFactory("MeetingNFT");
  const nft        = await NFTFactory.deploy(registryAddress);
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log(`  ✔ MeetingNFT      : ${nftAddress}`);

  const nftArtifact = JSON.parse(fs.readFileSync(
    path.join(__dirname, "../artifacts/contracts/MeetingNFT.sol/MeetingNFT.json"), "utf8"
  ));
  fs.writeFileSync(
    path.join(outputDir, "MeetingNFT.json"),
    JSON.stringify({ address: nftAddress, abi: nftArtifact.abi }, null, 2)
  );

  console.log(`\n  ✔ ABIs saved to ${outputDir}`);

  // ── 3. Next steps ─────────────────────────────────────────────────────────
  console.log("\n──────────────────────────────────────────");
  console.log("  To deploy to Amoy testnet:");
  console.log("    npx hardhat run scripts/deploy.js --network amoy");
  console.log("  To verify on Polygonscan:");
  console.log(`    npx hardhat verify --network amoy ${registryAddress}`);
  console.log(`    npx hardhat verify --network amoy ${nftAddress} ${registryAddress}`);
  console.log("──────────────────────────────────────────\n");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
