
var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = require('fs').readFileSync('./pass').toString();
var infuraKey = "kt4dd4NLAwM43QWBU7Qg";
const defaultGas = 4e6;
const defaultGasPrice = 5e9;

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      gas: defaultGas,
      gasPrice: defaultGasPrice,
      network_id: "*"
    },
    ropsten:{
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/" + infuraKey)
      },
      network_id: 3,
      gas: defaultGas,
      gasPrice: defaultGasPrice
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/" + infuraKey)
      },
      network_id: 4,
      gas: defaultGas,
      gasPrice: defaultGasPrice
    },
    main: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://mainnet.infura.io/" + infuraKey)
      },
      network_id: 1,
      gas: defaultGas,
      gasPrice: defaultGasPrice
    }   
  },  
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
};