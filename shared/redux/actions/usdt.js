import BigInteger from 'bigi'
import { BigNumber } from 'bignumber.js'
import config from 'app-config'
import { getState } from 'redux/core'
import reducers from 'redux/core/reducers'
import bitcoin from 'bitcoinjs-lib'
import { btc, request, constants, api } from 'helpers'


const login = (privateKey) => {
  let keyPair

  if (privateKey) {
    const hash  = bitcoin.crypto.sha256(privateKey)
    const d     = BigInteger.fromBuffer(hash)

    keyPair     = new bitcoin.ECPair(d, null, { network: btc.network })
  }
  else {
    console.info('Created account Bitcoin ...')
    keyPair     = bitcoin.ECPair.makeRandom({ network: btc.network })
    privateKey  = keyPair.toWIF()
  }

  const account     = new bitcoin.ECPair.fromWIF(privateKey, btc.network) // eslint-disable-line
  const address     = account.getAddress()
  const publicKey   = account.getPublicKeyBuffer().toString('hex')

  const data = {
    account,
    keyPair,
    address,
    privateKey,
    publicKey,
  }

  console.info('Logged in with USDT', data)
  reducers.user.setAuthData({ name: 'usdtData', data })
}

const getBalance = async () => {
  const { user: { usdtData: { address } } } = getState()
  try {
    const result = await fetchBalance(address)
    console.log('result', result)
    const { balance, unconfirmed } = result
    reducers.user.setBalance({ name: 'usdtData', amount: balance, unconfirmedBalance: unconfirmed || 0 })
    return balance
  } catch (e) {
    reducers.user.setBalanceError({ name: 'usdtData' })
  }
}

const fetchBalance = (address, assetId = 31) =>
  request.post(`${config.api.usdt}v1/address/addr/`, {
    body: `addr=${address}`,
  })
    .then(response => {
      console.log('responce', response)
      const { error, balance } = response

      if (error) throw new Error(`Omni Balance: ${error} at ${address}`)

      const findById = balance
        .filter(asset => parseInt(asset.id) === assetId || asset.id === assetId)

      if (!findById.length) {
        return {
          balance: 0,
        }
      }

      console.log('Omni Balance:', findById[0].value)
      console.log('Omni Balance pending:', findById[0].pendingpos)
      console.log('Omni Balance pending:', findById[0].pendingneg)

      const usdsatoshis = BigNumber(findById[0].value)
      const usdtUnconfirmed = BigNumber(findById[0].pendingneg)

      if (usdsatoshis) {
        return {
          unconfirmed: usdtUnconfirmed.dividedBy(1e8).toNumber(),
          balance: usdsatoshis.dividedBy(1e8).toNumber(),
        }
      }
      return {
        balance: 0,
      }

    })
    .catch(error => console.error(error))


const getTransaction = () => {
  const { user: { usdtData: { address } } } = getState()

  return new Promise((resolve) => {
    request.post(`${config.api.usdt}v1/address/addr/details/`, {
      body: `addr=${address}`,
    })
      .then((res) => {
        console.log('res', res)
        const transactions = res.transactions.map((item) => ({
          type: 'usdt',
          hash: item.txid,
          confirmations: item.confirmations,
          value: item.amount,
          date: item.blocktime * 1000,
          direction: address === item.sendingaddress ? 'in' : 'out',
        }))
        resolve(transactions)
      })
      .catch(() => {
        resolve([])
      })
  })
}

const fetchUnspents = (address) =>
  request.get(`${config.api.bitpay}/addr/${address}/utxo`)


const send = ({ from, to, amount } = {}) => {
  const { user: { usdtData: { privateKey } } } = getState()

  return new Promise(async (resolve) => {
    const keyPair = bitcoin.ECPair.fromWIF(privateKey, btc.network)

    const tx              = new bitcoin.TransactionBuilder(btc.network)
    const unspents        = await fetchUnspents(from)
    const feeValue        = 5000
    const sendingValue    = new BigNumber(String(amount)).multipliedBy(1e8).integerValue().toNumber()
    const totalUnspent    = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
    const skipValue       = totalUnspent - feeValue - 546

    if (totalUnspent < feeValue + 546) {
      throw new Error(`Total less than fee: ${totalUnspent} < ${546} + ${feeValue}`)
    }

    unspents.forEach(({ txid, vout }) => tx.addInput(txid, vout, 0xfffffffe))

    const omniOutput = createOmniScript(sendingValue)

    tx.addOutput(to, 546)
    tx.addOutput(omniOutput, 0)
    tx.addOutput(from, skipValue)

    tx.inputs.forEach((input, index) => {
      tx.sign(index, keyPair)
    })

    const txRaw = tx.buildIncomplete()
    const result = await broadcastTx(txRaw.toHex())

    resolve(result)
  })
}


const numToHex = (num, len) => {
  const str = Number(num).toString(16)
  return '0'.repeat(len - str.length) + str
}


const createOmniScript = (amount) => {
  const simpleSend = [
    '6f6d6e69', '0000', '0000', '0000001f',
    numToHex(amount, 16),
  ].join('')

  return bitcoin.script.compile([
    bitcoin.opcodes.OP_RETURN,
    Buffer.from(simpleSend, 'hex'),
  ])
}


const broadcastTx = (txRaw) =>
  request.post(`${api.getApiServer('bitpay')}/tx/send`, {
    body: {
      rawtx: txRaw,
    },
  })

export default {
  send,
  getTransaction,
  login,
  getBalance,
  fetchBalance,
}
