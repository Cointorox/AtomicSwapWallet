import config from 'app-config'

import BtcToEth from '../BtcToEth'
import EthToBtc from '../EthToBtc'

import LtcToEth from '../LtcToEth'
import EthToLtc from '../EthToLtc'

import BtcToLtc from '../BtcToLtc'
import LtcToBtc from '../LtcToBtc'

import BtcToEos from '../BtcToEos'
import EosToBtc from '../EosToBtc'

import EthTokenToBtc from '../EthTokenToBtc'
import BtcToEthToken from '../BtcToEthToken'

import EthTokenToUsdt from '../EthTokenToUsdt'
import UsdtToEthToken from '../UsdtToEthToken'


const swapComponents = {
  'BTC2ETH': BtcToEth,
  'ETH2BTC': EthToBtc,

  'LTC2ETH': LtcToEth,
  'ETH2LTC': EthToLtc,

  'BTC2LTC': BtcToLtc,
  'LTC2BTC': LtcToBtc,

  'BTC2EOS': BtcToEos,
  'EOS2BTC': EosToBtc,

  'SWAP2BTC': EthTokenToBtc,
  'BTC2SWAP': BtcToEthToken,

  'SWAP2USDT': EthTokenToUsdt,
  'USDT2SWAP': UsdtToEthToken,
}


Object.keys(config.erc20)
  .forEach(key => {
    swapComponents[`${key.toUpperCase()}2BTC`] = EthTokenToBtc
    swapComponents[`BTC2${key.toUpperCase()}`] = BtcToEthToken

    swapComponents[`${key.toUpperCase()}2USDT`] = EthTokenToUsdt
    swapComponents[`USDT2${key.toUpperCase()}`] = UsdtToEthToken
  })

export {
  swapComponents,
}
