import debug from 'debug'
import BigNumber from 'bignumber.js'
import SwapApp, { Collection, ServiceInterface, util, constants } from 'swap.app'
import SwapRoom from 'swap.room'
import aggregation from './aggregation'
import events from './events'
import Order from './Order'


const checkIncomeOrderFormat = (order) => {
  const format = {
    id: '?String',
    owner: {
      peer: 'String',
      reputation: util.typeforce.t.maybe(util.typeforce.isNumeric),
      ...(() => {
        const result = {}
        Object.keys(constants.COINS).forEach((key) => {
          result[key] = util.typeforce.t.maybe({
            address: util.typeforce.isCoinAddress[constants.COINS[key]],
            publicKey: util.typeforce.isPublicKey[constants.COINS[key]],
          })
        })
        return result
      })(),
    },
    buyCurrency: util.typeforce.isCoinName,
    sellCurrency: util.typeforce.isCoinName,
    buyAmount: util.typeforce.isNumeric,
    sellAmount: util.typeforce.isNumeric,
    exchangeRate: util.typeforce.t.maybe(util.typeforce.isNumeric),
    isProcessing: '?Boolean',
    isRequested: '?Boolean',
    isPartial: '?Boolean',
    isHidden: '?Boolean',
    destination: util.typeforce.t.maybe({
      ownerAddress: '?String',
      participantAddress: '?String',
    }),
  }

  const isValid = util.typeforce.check(format, order, true)

  if (!isValid) {
    debug('swap.core:orders')('Wrong income order format. Excepted:', format, 'got:', order)
  }

  return isValid
}

const checkIncomeOrderOwner = ({ owner: { peer } }, fromPeer) =>
  peer === fromPeer

const checkIncomeOrder = (order, fromPeer) => {
  const isFormatValid = checkIncomeOrderFormat(order)
  const isOwnerValid = checkIncomeOrderOwner(order, fromPeer)

  return isFormatValid && isOwnerValid
}


class SwapOrders extends aggregation(ServiceInterface, Collection) {

  static get name() {
    return 'orders'
  }

  constructor() {
    super()

    this._serviceName = 'orders'
    this._dependsOn   = [ SwapRoom ]

    this.getUniqueId = () => {}
  }

  initService() {
    this.app.services.room.on('ready', this._handleReady)
    this.app.services.room.on('user online', this._handleUserOnline)
    this.app.services.room.on('user offline', this._handleUserOffline)
    this.app.services.room.on('new orders', this._handleNewOrders)
    this.app.services.room.on('new order', this._handleNewOrder)
    this.app.services.room.on('remove order', this._handleRemoveOrder)
    this.app.services.room.on('hide orders', this._handleHideOrders)
    this.app.services.room.on('show orders', this._handleShowOrders)

    this.getUniqueId = (() => {
      let id = Date.now()
      return () => `${this.app.services.room.peer}-${++id}`
    })()
  }

  _handleReady = () => {
    this._persistMyOrders()
  }

  _handleHideOrders = ({ fromPeer }) => {
    this.items.forEach((order) => {
      if (order && order.owner && order.owner.peer === fromPeer) {
        order.isHidden = true
      }
    })
  }

  _handleShowOrders = ({ fromPeer }) => {
    this.items.forEach((order) => {
      if (order && order.owner && order.owner.peer === fromPeer) {
        order.isHidden = false
      }
    })
  }

  _handleUserOnline = (peer) => {
    let myOrders = this.getMyOrders()

    if (myOrders.length) {
      // clean orders from other additional props
      myOrders = myOrders.map((item) => util.pullProps(
        item,
        'id',
        'owner',
        'buyCurrency',
        'sellCurrency',
        'buyAmount',
        'exchangeRate',
        'sellAmount',
        'isRequested',
        'isProcessing',
        'isPartial',
        'isHidden',
        'destination',
      ))

      this.app.services.room.sendMessagePeer(peer,
        {
          event: 'new orders',
          data: {
            orders: myOrders,
          },
        }
      )
    }
  }

  _handleUserOffline = (peer) => {
    const peerOrders = this.getPeerOrders(peer)

    if (peerOrders.length) {
      peerOrders.forEach(({ id }) => {
        this._handleRemove(id)
      })
    }
  }

  _handleNewOrders = ({ fromPeer, orders }) => {
    // ductape to check if such orders already exist
    const filteredOrders = orders.filter(({ id, owner: { peer } }) => (
      !this.getByKey(id) && peer === fromPeer
    ))

    this._handleMultipleCreate({ orders: filteredOrders, fromPeer })
  }

  _handleNewOrder = ({ fromPeer, order }) => {
    if (order && order.owner && order.owner.peer === fromPeer) {
      if (checkIncomeOrder(order, fromPeer)) {
        this._handleCreate(order)
      }
    }
  }

  _handleRemoveOrder = ({ fromPeer, orderId }) => {
    const order = this.getByKey(orderId)

    if (order && order.owner && order.owner.peer === fromPeer) {
      this._handleRemove(orderId)
    }
  }

  _persistMyOrders() {
    this.getMyOrders().forEach((orderData) => {
      this._handleCreate(orderData)
    })
  }

  /**
   *
   * @param {object} data
   * @param {string} data.id
   * @param {object} data.owner
   * @param {string} data.owner.peer
   * @param {number} data.owner.reputation
   * @param {object} data.owner.<currency>
   * @param {string} data.owner.<currency>.address
   * @param {string} data.owner.<currency>.publicKey
   * @param {string} data.buyCurrency
   * @param {string} data.sellCurrency
   * @param {number} data.buyAmount
   * @param {number} data.sellAmount
   * @param {boolean} data.isProcessing
   * @param {boolean} data.isRequested
   */
  _create(data) {
    const { id, buyAmount, sellAmount, buyCurrency, sellCurrency, ...rest } = data

    const buy = buyCurrency.toUpperCase()
    const sell = sellCurrency.toUpperCase()
    const roundedBuyAmount = BigNumber(buyAmount).dp(constants.COINS_PRECISION[buy])
    const roundedSellAmount = BigNumber(sellAmount).dp(constants.COINS_PRECISION[sell])

    const order = new Order(this.app, this, {
      id:           id || this.getUniqueId(),
      buyAmount:    roundedBuyAmount,
      sellAmount:   roundedSellAmount,
      buyCurrency:  buy,
      sellCurrency: sell,
      ...rest,
    })

    this.append(order, order.id)

    return order
  }

  _handleCreate(data) {
    const order = this._create(data)

    if (order) {
      events.dispatch('new order', order)
    }
  }

  _handleMultipleCreate({ orders, fromPeer }) {
    const newOrders = []

    orders.forEach((data) => {
      if (checkIncomeOrder(data, fromPeer)) {
        const order = this._create(data)

        newOrders.push(order)
      }
    })

    if (newOrders.length) {
      events.dispatch('new orders', newOrders)
    }
  }

  /**
   *
   * @param {string} orderId
   */
  _handleRemove(orderId) {
    try {
      const order = this.getByKey(orderId)

      if (order) {
        this.removeByKey(orderId)
        events.dispatch('remove order', order)
      }
    }
    catch (err) {}
  }

  _saveMyOrders() {
    let myOrders = this.items.filter(({ owner: { peer } }) => peer === this.app.services.room.peer)

    // clean orders from other additional props
    // TODO need to add functionality to sync `requests` for users who going offline / online
    // problem: when I going online and persisting my orders need to show only online users requests,
    // but then user comes online need to change status. Ofc we can leave this bcs developers can do this themselves
    // with filters - skip requests where user is offline, but it looks like not very good
    myOrders = myOrders.map((item) => util.pullProps(
      item,
      'id',
      'owner',
      'buyCurrency',
      'sellCurrency',
      'buyAmount',
      'sellAmount',
      'exchangeRate',
      'participant',
      'requests',
      'isRequested',
      'isProcessing',
      'isPartial',
      'isHidden',
      'destination',
    ))

    this.app.env.storage.setItem('myOrders', myOrders)
  }

  getMyOrders() {
    return this.app.env.storage.getItem('myOrders') || []
  }

  getPeerOrders(peer) {
    return this.items.filter(({ owner }) => peer === owner.peer)
  }

  /**
   *
   * @param {object} data
   * @param {string} data.buyCurrency
   * @param {string} data.sellCurrency
   * @param {number} data.buyAmount
   * @param {number} data.sellAmount
   */
  create(data) {
    const order = this._create({
      ...data,
      owner: this.app.services.auth.getPublicData(),
    })
    this._saveMyOrders()

    this.app.services.room.sendMessageRoom({
      event: 'new order',
      data: {
        order: util.pullProps(
          order,
          'id',
          'owner',
          'buyCurrency',
          'exchangeRate',
          'sellCurrency',
          'buyAmount',
          'sellAmount',
          'isRequested',
          'isProcessing',
          'isPartial',
          'isHidden',
          'destination',
        ),
      },
    })

    return order
  }

  hideMyOrders() {
    this.items.forEach((order) => {
      if (order && order.owner && order.owner.peer === this.app.services.room.peer) {
        order.isHidden = true
      }
    })
    this._saveMyOrders()
    this.app.services.room.sendMessageRoom({
      event: 'hide orders',
      data: {},
    })
  }

  showMyOrders() {
    this.items.forEach((order) => {
      if (order && order.owner && order.owner.peer === this.app.services.room.peer) {
        order.isHidden = false
      }
    })
    this._saveMyOrders()
    this.app.services.room.sendMessageRoom({
      event: 'show orders',
      data: {},
    })
  }

  hasHiddenOrders() {
    let myHiddenOrders = this.items.filter(({ isHidden, owner: { peer } }) => (peer === this.app.services.room.peer && isHidden))
    return myHiddenOrders.length ? true : false
  }

  /**
   *
   * @param {string} orderId
   */
  remove(orderId) {
    this.removeByKey(orderId)
    this.app.services.room.sendMessageRoom({
      event: 'remove order',
      data: {
        orderId,
      },
    })
    this._saveMyOrders()
  }

  /**
   *
   * @param {String} event
   * @param {String} peer
   * @param {Object} data
   * @param {function} callback
   */
  requestToPeer(event, peer, data, callback) {
    this.app.services.room.sendMessagePeer(peer, {
      event,
      data,
    })

    if (!callback) {
      return
    }

    this.app.services.room.on('accept request', function ({ fromPeer, orderId }) {
      debug('swap.core:orders')('requestToPeer accept request', fromPeer)
      if (peer === fromPeer) {
        this.unsubscribe()

        debug('swap.core:orders')('requestToPeer IF')

        callback(orderId)
      }
    })

    this.app.services.room.on('decline request', function ({ fromPeer }) {
      if (peer === fromPeer) {
        this.unsubscribe()

        callback(false)
      }
    })
  }

  on(eventName, handler) {
    events.subscribe(eventName, handler)
    return this
  }

  off(eventName, handler) {
    events.unsubscribe(eventName, handler)
    return this
  }
}


export default SwapOrders
