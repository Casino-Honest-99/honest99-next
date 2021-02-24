import hre from 'hardhat';
import {Greeter__factory} from '../typechain';


async function main() {
  const Greeter = await hre.ethers.getContractFactory("Greeter") as Greeter__factory;
  const greeter = await Greeter.deploy("Hello, Hardhat!");

  await greeter.deployed();

  console.log("Greeter deployed to:", greeter.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
