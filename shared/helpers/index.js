import eos from './eos'
import btc from './btc'
import eth from './eth'
import ethToken from './ethToken'
import bcash from './bcash'
import ltc from './ltc'
// import xlm from './xlm'
import user from './user'
import web3 from './web3'
import links from './links'
import request from './request'
import constants from './constants'
import localStorage from './localStorage'
import swapsExplorer from './swapsExplorer'
import api from './api'
import tips from './tips'
import * as utils from './utils'
// Methods
import ignoreProps from './ignoreProps'
import handleGoTrade from './handleGoTrade'
import firebase from './firebase'
// Getters
import getPageOffset from './getPageOffset'
import getScrollBarWidth from './getScrollBarWidth'
import paddingForSwapList from './paddingForSwapList'
import estimateFeeValue from './estimateFeeValue'

import { migrate } from './migrations/'

import getUnixTimeStamp from './getUnixTimeStamp'
import { cacheStorageGet, cacheStorageSet } from './cache'


export default {
  eos,
  // xlm,
  bcash,
  btc,
  eth,
  ethToken,
  ltc,
  handleGoTrade,
  estimateFeeValue,
}

export {
  eos,
  // xlm,
  bcash,
  tips,
  btc,
  eth,
  ethToken,
  ltc,
  user,
  web3,
  utils,
  links,
  request,
  constants,
  localStorage,
  swapsExplorer,
  api,
  migrate,
  // Methods
  ignoreProps,
  handleGoTrade,
  firebase,

  // Getters
  getPageOffset,
  getScrollBarWidth,
  paddingForSwapList,

  getUnixTimeStamp,
  cacheStorageGet,
  cacheStorageSet,
}
