const bitcoin = require('../instances/bitcoin').mainnet()
const ethereum = require('../instances/ethereum').mainnet()
const tokenSwap = require('./tokenSwap')

const id = parseInt(process.argv[2])
        || process.env.SERVER_ID
        || process.env.ACCOUNT
        || Math.random().toString().slice(2)

const offset = process.env.OFFSET || process.argv[1]
const ROOT_DIR = process.env.ROOT_DIR || '.'

module.exports = {
  id,
  network: 'mainnet',
  storageDir: `${ROOT_DIR}/.storage/${id}`,
  swapRoom: {
    roomName: 'swap.online',
    repo: `${ROOT_DIR}/.ipfs/__mainnet__${id}__/${offset}`,
  },
  ethSwap: () => ({
    gasLimit: 2e5,
    address: '0xC4D43AF0518C4AC875B01848F1087c435C42659B',
    abi: [{"constant":false,"inputs":[{"name":"_secret","type":"bytes32"},{"name":"_ownerAddress","type":"address"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_participantAddress","type":"address"}],"name":"getSecret","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"participantSigns","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_secret","type":"bytes32"},{"name":"participantAddress","type":"address"}],"name":"withdrawNoMoney","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_secretHash","type":"bytes20"},{"name":"_participantAddress","type":"address"},{"name":"_targetWallet","type":"address"}],"name":"createSwapTarget","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"swaps","outputs":[{"name":"targetWallet","type":"address"},{"name":"secret","type":"bytes32"},{"name":"secretHash","type":"bytes20"},{"name":"createdAt","type":"uint256"},{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_secretHash","type":"bytes20"},{"name":"_participantAddress","type":"address"}],"name":"createSwap","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"_secret","type":"bytes32"},{"name":"_ownerAddress","type":"address"},{"name":"participantAddress","type":"address"}],"name":"withdrawOther","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"ratingContractAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_ownerAddress","type":"address"}],"name":"getTargetWallet","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_ownerAddress","type":"address"}],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_participantAddress","type":"address"}],"name":"refund","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_buyer","type":"address"},{"indexed":false,"name":"_seller","type":"address"},{"indexed":false,"name":"_value","type":"uint256"},{"indexed":false,"name":"_secretHash","type":"bytes20"},{"indexed":false,"name":"createdAt","type":"uint256"}],"name":"CreateSwap","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_buyer","type":"address"},{"indexed":false,"name":"_seller","type":"address"},{"indexed":false,"name":"_secretHash","type":"bytes20"},{"indexed":false,"name":"withdrawnAt","type":"uint256"}],"name":"Withdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_buyer","type":"address"},{"indexed":false,"name":"_seller","type":"address"}],"name":"Close","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_buyer","type":"address"},{"indexed":false,"name":"_seller","type":"address"},{"indexed":false,"name":"_secretHash","type":"bytes20"}],"name":"Refund","type":"event"}],
    fetchBalance: (address) => ethereum.fetchBalance(address),
    estimateGasPrice: ({ speed } = {}) => ethereum.estimateGasPrice({ speed }),
  }),
  btcSwap: () => ({
    fetchBalance: (address) => bitcoin.fetchBalance(address),
    fetchUnspents: (scriptAddress) => bitcoin.fetchUnspents(scriptAddress),
    broadcastTx: (txRaw) => bitcoin.broadcastTx(txRaw),
    fetchTxInfo: txid => bitcoin.fetchTxInfo(txid),
    estimateFeeValue: ({ inSatoshis, speed, address, txSize } = {}) => bitcoin.estimateFeeValue({ inSatoshis, speed, address, txSize }),
  }),
  usdtSwap: () => ({
    fetchBalance: (address) => bitcoin.fetchOmniBalance(address, 31),
    fetchUnspents: (scriptAddress) => bitcoin.fetchUnspents(scriptAddress),
    broadcastTx: (txRaw) => bitcoin.broadcastTx(txRaw),
    fetchTx: hash => bitcoin.fetchTx(hash),
  }),
  noxonTokenSwap: tokenSwap({
    network: 'mainnet',
    name: 'NOXON',
    decimals: 0,
    tokenAddress: '0x9e4ad79049282f942c1b4c9b418f0357a0637017',
  }),
  swapTokenSwap: tokenSwap({
    network: 'mainnet',
    name: 'SWAP',
    decimals: 18,
    tokenAddress: '0x14a52cf6B4F68431bd5D9524E4fcD6F41ce4ADe9',
  })
}
