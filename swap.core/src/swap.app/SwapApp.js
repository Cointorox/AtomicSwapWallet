import constants from './constants'
import StorageFactory from './StorageFactory'


class SwapApp {

  static _swapAppInstance = null

  /**
   *
   * @param {object}  options
   * @param {string}  options.network
   * @param {object}  options.env
   * @param {array}   options.services
   * @param {array}   options.swaps
   * @param {array}   options.flows
   */
  constructor(options) {
    this.network    = options.network || constants.NETWORKS.TESTNET
    this.env        = {}
    this.services   = {}

    this.swaps      = {}
    this.flows      = {}

    this._addEnv(options.env || {})
    this._addServices(options.services || {})

    this._addSwaps(options.swaps || [])
    this._addFlows(options.flows || [])
  }

  static init(options) {
    return new SwapApp(options)
  }

  static setup(options, forceFreshSetup = false) {
    if (SwapApp._swapAppInstance && !forceFreshSetup) {
      throw new Error(`Shared instance already initialized. Use SwapApp.shared() to access it.`)
    }

    SwapApp._swapAppInstance = new SwapApp(options)
  }

  static shared() {
    SwapApp.required(SwapApp._swapAppInstance, `Shared instance not initialized. Call SwapApp.setup(config) first.`)
    return SwapApp._swapAppInstance
  }

  // Configure -------------------------------------------------------- /

  _addEnv(env) {
    Object.keys(env).forEach((name) => {
      if (Object.values(constants.ENV).indexOf(name) < 0) {
        throw new Error(`SwapApp.addEnv(): Only ${Object.values(constants.ENV)} available`)
      }
    })

    env.storage = new StorageFactory(env.storage)

    // SwapApp.env = env

    this.env = env
  }

  _addService(service) {
    if (!service._serviceName) {
      throw new Error('SwapApp service should contain "_serviceName" property')
    }

    if (!Object.values(constants.SERVICES).includes(service._serviceName)) {
      throw new Error(`SwapApp service should contain "_serviceName" property should be one of ${Object.values(constants.SERVICES)}, got "${service._serviceName}"`)
    }

    service._attachSwapApp(this)
    this.services[service._serviceName] = service
  }

  _addServices(services) {
    // add service to app by _serviceName
    services.forEach((service) => this._addService(service))
    // spy expects
    Object.keys(this.services).forEach((serviceName) => this.services[serviceName]._waitRelationsResolve())
    // init services
    Object.keys(this.services).forEach((serviceName) => this.services[serviceName]._tryInitService())
  }

  _addSwap(swap) {
    if (!swap._swapName) {
      throw new Error('SwapApp swap should contain "_swapName" property')
    }

    if (!Object.values(constants.COINS).includes(swap._swapName.toUpperCase())) {
      throw new Error(`SwapApp swap should contain "_swapName" property should be one of ${Object.values(constants.COINS)}, got "${swap._swapName.toUpperCase()}"`)
    }

    this.swaps[swap._swapName] = swap

    if (typeof swap._initSwap === 'function') {
      swap._initSwap(this)
    }
  }

  _addSwaps(swaps) {
    swaps.forEach((swap) => {
      this._addSwap(swap)
    })
  }

  _addFlow(Flow) {
    const flowName = Flow.getName()

    if ( !Object.values(constants.COINS).includes( Flow.getFromName() )
      || !Object.values(constants.COINS).includes( Flow.getToName() )
    ) {
      throw new Error(`SwapApp flow "_flowName" property should contain only: ${Object.values(constants.COINS)}. Got: "${flowName.toUpperCase()}"`)
    }

    this.flows[flowName] = Flow
  }

  _addFlows(flows) {
    flows.forEach((flow) => {
      this._addFlow(flow)
    })
  }

  // Public methods --------------------------------------------------- /

  isMainNet() {
    return this.network.toLowerCase() === constants.NETWORKS.MAINNET
  }

  isTestNet() {
    return this.network.toLowerCase() === constants.NETWORKS.TESTNET
  }

  isLocalNet() {
    return this.network.toLowerCase() === constants.NETWORKS.LOCALNET
  }

  isSwapApp() {
    return true
  }

  static is(app) {
    return app && app.isSwapApp && app.isSwapApp() && app instanceof SwapApp
  }

  static required(app, errorMessage = ``) {
    if (!SwapApp.is(app)) {
      throw new Error(`SwapApp required, got: ${app}. ${errorMessage}`)
    }
  }
}


export default SwapApp
