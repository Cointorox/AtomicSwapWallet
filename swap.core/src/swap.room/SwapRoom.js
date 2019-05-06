import debug from 'debug'
import SwapApp, { constants, Events, ServiceInterface } from 'swap.app'


class SwapRoom extends ServiceInterface {

  static get name() {
    return 'room'
  }

  constructor(config) {
    super()

    if (!config || typeof config !== 'object' || typeof config.config !== 'object') {
      throw new Error('SwapRoomService: "config" of type object required')
    }

    this._serviceName   = 'room'
    this._config        = config
    this._events        = new Events()
    this.peer           = null
    this.connection     = null
    this.roomName       = null
  }

  initService() {
    if (!this.app.env.Ipfs) {
      throw new Error('SwapRoomService: Ipfs required')
    }
    if (!this.app.env.IpfsRoom) {
      throw new Error('SwapRoomService: IpfsRoom required')
    }

    const { roomName, EXPERIMENTAL, ...config } = this._config

    const ipfs = new this.app.env.Ipfs({
      EXPERIMENTAL: {
        pubsub: true,
      },
      ...config,
    })
      .on('ready', () => ipfs.id((err, info) => {
        console.info('IPFS ready!')

        if (err) {
          throw err
        }

        this._init({
          peer: info.id,
          ipfsConnection: ipfs,
        })
      }))
      .on('error', (err) => {
        debug('swap.core:room')('IPFS error!', err)
      })
  }

  _init({ peer, ipfsConnection }) {
    if (!ipfsConnection) {
      setTimeout(() => {
        this._init({ peer, ipfsConnection })
      }, 999)
      return
    }

    this.peer = peer

    const defaultRoomName = this.app.isMainNet()
                  ? 'swap.online'
                  : 'testnet.swap.online'

    this.roomName = this._config.roomName || defaultRoomName

    debug('swap.core:room')(`Using room: ${this.roomName}`)

    this.connection = this.app.env.IpfsRoom(ipfsConnection, this.roomName, {
      pollInterval: 1000,
    })

    this.connection.on('peer joined', this._handleUserOnline)
    this.connection.on('peer left', this._handleUserOffline)
    this.connection.on('message', this._handleNewMessage)

    this._events.dispatch('ready')
  }

  _handleUserOnline = (peer) => {
    if (peer !== this.peer) {
      this._events.dispatch('user online', peer)
    }
  }

  _handleUserOffline = (peer) => {
    if (peer !== this.peer) {
      this._events.dispatch('user offline', peer)
    }
  }

  _handleNewMessage = (message) => {
    const { from, data: rawData } = message
    debug('swap.verbose:room')('message from', from)

    if (from === this.peer) {
      return
    }

    let parsedData

    try {
      parsedData = JSON.parse(rawData.toString())
    }
    catch (err) {
      console.error('parse message data err:', err)
    }

    const { fromAddress, data, sign, event, action } = parsedData

    if (!data) {
      return
    }

    // debug('swap.verbose:room')('parsedData', parsedData)

    const recover = this._recoverMessage(data, sign)

    if (recover !== fromAddress) {
      console.error(`Wrong message sign! Message from: ${fromAddress}, recover: ${recover}`)
      return
    }

    if (action === 'active') {
      this.acknowledgeReceipt(parsedData)
    }

    this._events.dispatch(event, {
      fromPeer: from,
      ...data,
    })
  }

  on(eventName, handler) {
    this._events.subscribe(eventName, handler)
    return this
  }

  off(eventName, handler) {
    this._events.unsubscribe(eventName, handler)
    return this
  }

  once(eventName, handler) {
    this._events.once(eventName, handler)
    return this
  }

  subscribe (eventName, handler) {
    this._events.subscribe(eventName, handler)
    return this
  }

  unsubscribe (eventName, handler) {
    this._events.unsubscribe(eventName, handler)
    return this
  }

  _recoverMessage(message, sign) {
    const hash      = this.app.env.web3.utils.soliditySha3(JSON.stringify(message))
    const recover   = this.app.env.web3.eth.accounts.recover(hash, sign.signature)

    return recover
  }

  _signMessage(message) {
    const hash  = this.app.env.web3.utils.soliditySha3(JSON.stringify(message))
    const sign  = this.app.env.web3.eth.accounts.sign(hash, this.app.services.auth.accounts.eth.privateKey)

    return sign
  }

  checkReceiving(message, callback) {
    let address = message.fromAddress

    const waitReceipt = (data) => {
      if (!data.action || data.action !== 'confirmation') {
        return
      }

      if (JSON.stringify(message.data) === JSON.stringify(data.message)) {
        this.unsubscribe(address, waitReceipt)

        if (this.CheckReceiptsT[message.peer]) {
          clearTimeout(this.CheckReceiptsT[message.peer])
        }

        callback(true)
      }
    }

    this.subscribe(address, waitReceipt)

    if (!this.CheckReceiptsT) {
      this.CheckReceiptsT = {}
    }

    this.CheckReceiptsT[message.peer] = setTimeout(() => {
      this.unsubscribe(address, waitReceipt)

      callback(false)
    }, 15000)
  }

  sendConfirmation(peer, message, callback = false, repeat = 9) {

    if (!this.connection) {
      setTimeout(() => { this.sendConfirmation(peer, message, callback, repeat) }, 1000)
      return
    }

    if (message.action === 'confirmation' && peer !== this.peer) {
      return
    }

    message = this.sendMessagePeer(peer, message)

    this.checkReceiving(message, delivered => {
      if (!delivered && repeat > 0) {
        repeat--
        setTimeout(() => {
          this.sendConfirmation(peer, message, callback, repeat)
        }, 1000 )
        return
      }

      if (callback) callback(delivered)
    })
  }

  acknowledgeReceipt (message) {
    if (!message.peer || !message.action
      || message.action  === 'confirmation'
      || message.action  === 'active') {
      return
    }

    const { fromAddress, data } = message

    this.sendMessagePeer(fromAddress, {
      action  : 'confirmation',
      data,
    })
  }

  sendMessagePeer(peer, message) {
    if (!this.connection) {
      if (message.action !== 'active') {
        setTimeout(() => {
          this.sendMessagePeer(peer, message)
        }, 999)
      }
      return
    }

    debug('swap.verbose:room')('sent message to peer', peer)
    // debug('swap.verbose:room')('message', message)

    const { data, event }  = message
    const sign = this._signMessage(data)

    this.connection.sendTo(peer, JSON.stringify({
      fromAddress: this.app.services.auth.accounts.eth.address,
      data,
      event,
      sign,
    }))

    return message
  }

  sendMessageRoom(message) {
    const { data, event } = message
    const sign = this._signMessage(data)

    this.connection.broadcast(JSON.stringify({
      fromAddress: this.app.services.auth.accounts.eth.address,
      data,
      event,
      sign,
    }))
  }
}


export default SwapRoom
