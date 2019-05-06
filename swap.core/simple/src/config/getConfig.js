const { constants } = require('swap.app')

const SwapAuth = require('swap.auth')
const SwapRoom = require('swap.room')
const SwapOrders = require('swap.orders')

const { EthSwap, EthTokenSwap, BtcSwap, UsdtSwap, BchSwap, } = require('swap.swaps')
const {
  ETH2BTC, BTC2ETH,
  ETH2BCH, BCH2ETH,
  ETHTOKEN2BTC, BTC2ETHTOKEN,
  USDT2ETHTOKEN, ETHTOKEN2USDT } = require('swap.flows')

const eth = require('../instances/ethereum')
const btc = require('../instances/bitcoin')

const Ipfs = require('ipfs')
const IpfsRoom = require('ipfs-pubsub-room')

const common = require('./common')

const tokenSwap = require('./tokenSwap')

const setupLocalStorage = require('./setupLocalStorage')
const { LocalStorage } = require('node-localstorage')
const sessionStorage = require('node-sessionstorage')

module.exports = (config) => ({ account, contracts: { ETH, TOKEN }, ...custom }) => {
  config = {
    ...common,
    ...config,
    ...custom,

    swapAuth: {
      ...common.swapAuth,
      ...config.swapAuth,
      ...custom.swapAuth,
    },

    swapRoom: {
      ...common.swapRoom,
      ...config.swapRoom,
      ...custom.swapRoom,
    },
  }

  setupLocalStorage()

  const storage = new LocalStorage(config.storageDir)

  const web3    = eth[config.network]().core
  const bitcoin = btc[config.network]().core

  const tokens = (config.ERC20TOKENS || [])
    .map(_token => ({ network: config.network, ..._token }))
    .filter(_token => _token.network === config.network)

  return {
    network: config.network,
    constants,
    env: {
      web3,
      bitcoin,
      // bcash,
      Ipfs,
      IpfsRoom,
      storage,
      sessionStorage,
      ...config.env,
    },
    services: [
      new SwapAuth({
        eth: account,
        btc: null,
        ...config.swapAuth
      }),
      new SwapRoom(config.swapRoom),
      new SwapOrders(),
    ],

    swaps: [
      new EthSwap(config.ethSwap(ETH)),
      new BtcSwap(config.btcSwap()),
      config.network === 'mainnet'
        ? new UsdtSwap(config.usdtSwap())
        : null,
      new EthTokenSwap(config.noxonTokenSwap(TOKEN)),
      new EthTokenSwap(config.swapTokenSwap(TOKEN)),
      ...(
        (config.swaps || [])
      ),
      ...(
        tokens.map(_token => new EthTokenSwap(tokenSwap(_token)()))
      )
    ]
    .filter(a=>!!a),

    flows: [
      ETH2BTC,
      BTC2ETH,
      ETHTOKEN2BTC(constants.COINS.noxon),
      BTC2ETHTOKEN(constants.COINS.noxon),
      ETHTOKEN2BTC(constants.COINS.swap),
      BTC2ETHTOKEN(constants.COINS.swap),
      ETHTOKEN2USDT(constants.COINS.noxon),
      USDT2ETHTOKEN(constants.COINS.noxon),
      ETHTOKEN2USDT(constants.COINS.swap),
      USDT2ETHTOKEN(constants.COINS.swap),
      ...(config.flows || []),
      ...((
          [].concat.apply([],
            tokens.map(({ name }) => ([
              ETHTOKEN2USDT(name),
              USDT2ETHTOKEN(name),
              ETHTOKEN2BTC(name),
              BTC2ETHTOKEN(name),
            ]))
          )
        ) || []
      )
      // ETH2BCH,
      // BCH2ETH,
    ],
  }
}
