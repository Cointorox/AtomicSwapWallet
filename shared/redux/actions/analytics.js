const getGtag = () =>  window.gtag || null

const dataEvent = ({ action, label } = {}) => {
  const gtag = getGtag()

  if (!action || !gtag) {
    return
  }

  gtag('event', action, {
    'label': label,
  })
}

const balanceEvent = ({ action, currency, balance } = {}) => {
  const gtag = getGtag()

  if (!action || !gtag) {
    return
  }

  gtag('event', `balance-${action}`, {
    'currency': currency,
    'balance': balance,
  })
}

const signUpEvent = ({ action, type } = {}) => {
  const gtag = getGtag()

  if (!action || !gtag) {
    return
  }

  gtag('event', `signUp-${action}`, {
    'type': type,
  })
}

const errorEvent = (eventAction) => {
  const gtag = getGtag()

  if (!gtag) {
    return
  }

  return null // TODO: add gtag for errorEvent
}

const swapEvent = (eventAction, eventLabel) => {
  const gtag = getGtag()

  if (!gtag) {
    return
  }

  return null // TODO: add gtag for swapEvent
}

const getTracker = () => {
  if (!window.ga) {
    return
  }

  try {
    return window.ga.getAll()[0]
  } catch (error) {
    console.error(error)
  }
  return null
}

const getClientId = () => {
  const tracker = getTracker()

  if (!tracker) {
    return
  }
  return tracker.get('clientId')
}


export default {
  getTracker,
  getClientId,
  dataEvent,
  errorEvent,
  swapEvent,
  balanceEvent,
  signUpEvent,
}
