import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("==================================================");
  console.log("   DEPLOYING ON-CHAIN TIP JAR SMART CONTRACT      ");
  console.log("==================================================");

  const [deployer] = await hre.ethers.getSigners();
  console.log(`[SYS] Deploying with account: ${deployer.address}`);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`[SYS] Account Balance: ${hre.ethers.formatEther(balance)} ETH`);

  const TipJar = await hre.ethers.getContractFactory("TipJar");
  const tipJar = await TipJar.deploy();
  await tipJar.waitForDeployment();

  const tipJarAddress = await tipJar.getAddress();
  console.log(`[SUCCESS] TipJar contract deployed at address: ${tipJarAddress}`);

  // Save deployed address to config for frontend to consume automatically
  const deployedConfig = {
    address: tipJarAddress,
    network: hre.network.name,
    chainId: hre.network.config.chainId || 31337,
    owner: deployer.address,
    deployedAt: new Date().toISOString()
  };

  const configPath = path.join(__dirname, "../src/contract-config.json");
  fs.writeFileSync(configPath, JSON.stringify(deployedConfig, null, 2));
  console.log(`[CONFIG] Saved contract address to ${configPath}`);
  console.log("==================================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
