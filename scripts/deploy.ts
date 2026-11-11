import hre from "hardhat";
const { ethers } = hre;
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("--------------------------------------------------");
  console.log(`🚀 Starting RoastMe Deployment on Network: ${hre.network.name}`);
  console.log("--------------------------------------------------");

  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error("No deployer account found! Check PRIVATE_KEY in .env.local");
  }

  const network = await ethers.provider.getNetwork();
  const chainId = Number(network.chainId);
  console.log("Connected Chain ID:", chainId);
  console.log("Deployer Address:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  const feeData = await ethers.provider.getFeeData();
  const gasPrice = feeData.gasPrice ?? ethers.parseUnits("20", "gwei");

  console.log("Deployer Balance:", ethers.formatEther(balance), chainId === 677 ? "BOT" : "BOHR");
  console.log("Network Gas Price:", ethers.formatUnits(gasPrice, "gwei"), "Gwei");

  if (balance === 0n) {
    throw new Error("Deployer balance is 0. Please fund your wallet before deploying.");
  }

  const RoastMeFactory = await ethers.getContractFactory("RoastMe");
  
  // Estimate gas limit to avoid any excessive fee usage
  const deployTxReq = await RoastMeFactory.getDeployTransaction();
  const estimatedGas = await ethers.provider.estimateGas(deployTxReq);
  const estimatedCost = estimatedGas * gasPrice;

  console.log("Estimated Deployment Gas Units:", estimatedGas.toString());
  console.log(
    "Estimated Max Deployment Cost:",
    ethers.formatEther(estimatedCost),
    chainId === 677 ? "BOT" : "BOHR"
  );

  if (balance < estimatedCost) {
    throw new Error(
      `Insufficient funds for deployment: need approx ${ethers.formatEther(
        estimatedCost
      )} but have ${ethers.formatEther(balance)}`
    );
  }

  console.log("\nDeploying RoastMe contract with optimized gas parameters...");
  // Use exact gas price from network without inflating fees
  const roastMe = await RoastMeFactory.deploy({
    gasPrice: gasPrice,
  });
  await roastMe.waitForDeployment();

  const contractAddress = await roastMe.getAddress();
  const deploymentTx = roastMe.deploymentTransaction();
  console.log("\n✅ RoastMe successfully deployed to:", contractAddress);
  if (deploymentTx) {
    console.log("Transaction Hash:", deploymentTx.hash);
  }

  // Update .env.local with deployed contract address and mainnet settings if on chain 677
  const envLocalPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envLocalPath)) {
    let envContent = fs.readFileSync(envLocalPath, "utf8");

    // Replace or add contract address
    if (envContent.includes("NEXT_PUBLIC_CONTRACT_ADDRESS=")) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_CONTRACT_ADDRESS=.*/,
        `NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`
      );
    } else {
      envContent += `\nNEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`;
    }

    if (chainId === 677) {
      // Mainnet settings
      envContent = envContent.replace(
        /NEXT_PUBLIC_BOTCHAIN_RPC_URL=.*/,
        `NEXT_PUBLIC_BOTCHAIN_RPC_URL=https://rpc.botchain.ai`
      );
      envContent = envContent.replace(
        /NEXT_PUBLIC_BOTCHAIN_CHAIN_ID=.*/,
        `NEXT_PUBLIC_BOTCHAIN_CHAIN_ID=677`
      );
      envContent = envContent.replace(
        /NEXT_PUBLIC_BOTCHAIN_EXPLORER=.*/,
        `NEXT_PUBLIC_BOTCHAIN_EXPLORER=https://scan.botchain.ai`
      );
    }

    fs.writeFileSync(envLocalPath, envContent, "utf8");
    console.log("✅ Updated .env.local with deployed address and network settings");
  }

  // Export deployment info to src/contracts/deployedContract.json
  const contractsDir = path.join(process.cwd(), "src", "contracts");
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  const artifactPath = path.join(
    process.cwd(),
    "artifacts",
    "contracts",
    "RoastMe.sol",
    "RoastMe.json"
  );

  let abi = [];
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    abi = artifact.abi;
  }

  const deploymentData = {
    address: contractAddress,
    network: hre.network.name,
    chainId: chainId,
    transactionHash: deploymentTx?.hash,
    abi: abi,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(contractsDir, "deployedContract.json"),
    JSON.stringify(deploymentData, null, 2)
  );
  console.log("✅ Exported deployment details to src/contracts/deployedContract.json");

  // Attempt verification if not on local hardhat network
  const networkName = hre.network.name;
  if (networkName !== "hardhat" && networkName !== "localhost") {
    console.log("\nWaiting for 5 block confirmations before verification...");
    if (deploymentTx) {
      await deploymentTx.wait(5);
    }

    console.log("Attempting contract verification on explorer...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified successfully!");
    } catch (verifyError: any) {
      console.log("Verification note:", verifyError?.message || verifyError);
    }
  }

  const explorerBase = chainId === 677 ? "https://scan.botchain.ai" : "https://scan.bohr.life";
  console.log("\n🎉 Deployment completed!");
  console.log("Contract Address:", contractAddress);
  console.log("Explorer URL:", `${explorerBase}/address/${contractAddress}`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
