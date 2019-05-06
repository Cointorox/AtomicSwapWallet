import SwapApp from 'swap.app'


const login = (_privateKey, app) => {
  SwapApp.required(app)

  const storageKey = `${app.network}:eth:privateKey`
  const privateKey = _privateKey || app.env.storage.getItem(storageKey)
  let account

  if (privateKey) {
    account = app.env.web3.eth.accounts.privateKeyToAccount(privateKey)
  }
  else {
    account = app.env.web3.eth.accounts.create()
  }

  app.env.web3.eth.accounts.wallet.add(account.privateKey)

  if (!_privateKey) {
    app.env.storage.setItem(storageKey, account.privateKey)
  }

  return account
}

const getPublicData = (account) => ({
  address: account.address,
  publicKey: null,
})


export default {
  login,
  getPublicData,
}
