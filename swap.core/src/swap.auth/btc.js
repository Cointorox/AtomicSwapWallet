import SwapApp from 'swap.app'


const login = (_privateKey, app) => {
  SwapApp.required(app)

  const storageKey = `${app.network}:btc:privateKey`
  let privateKey = _privateKey || app.env.storage.getItem(storageKey)
  let account

  const network = (
    app.isMainNet()
      ? app.env.bitcoin.networks.bitcoin
      : app.env.bitcoin.networks.testnet
  )

  if (!privateKey) {
    privateKey = app.env.bitcoin.ECPair.makeRandom({ network }).toWIF()
  }

  account = new app.env.bitcoin.ECPair.fromWIF(privateKey, network)

  account.getPublicKey = () => account.getPublicKeyBuffer().toString('hex')
  account.getPrivateKey = () => privateKey

  if (!_privateKey) {
    app.env.storage.setItem(storageKey, privateKey)
  }

  return account
}

const getPublicData = (account) => ({
  address: account.getAddress(),
  publicKey: account.getPublicKey(),
})


export default {
  login,
  getPublicData,
}
