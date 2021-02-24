import {task} from 'hardhat/config';
import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-solhint';
import 'hardhat-typechain';
import 'solidity-coverage';
import 'hardhat-gas-reporter';


task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

export default {
  solidity: "0.8.1",
  gasReporter: {
    currency: 'USD',
    coinmarketcap: '444a3769-9b78-483a-ab0f-b0629f79f969'
  }
};

