import React from 'react'

import { FormattedMessage } from 'react-intl'

import CSSModules from 'react-css-modules'
import styles from './Swap.scss'


@CSSModules(styles)
class SwapController extends React.PureComponent {

  constructor({ swap }) {
    super()

    this.swap = swap

    this.state = {
      online: true,
    }
  }

  componentDidMount() {
    this.swap.events.subscribe('check status', this.checkStatusUser)
    this.dispatchEvent('check status')
    setInterval(() => {
      this.checkStatusUser()
    }, 5000)
  }

  componentWillUnmount() {
    this.dispatchEvent('check status')
    this.swap.events.unsubscribe('check status', this.checkStatusUser)
  }

  dispatchEvent = (event) => {
    this.swap.events.dispatch(event)
  }

  checkStatusUser = () => {
    const { online } = this.state
    const status = this.swap.room.getOnlineParticipant()

    this.setState(() => ({
      online: status,
    }))
  }

  render() {
    const { online } = this.state

    return (
      <div styleName="onlineIndicator">
        {
          online ? (
            <p styleName="online">
              <FormattedMessage id="SwapController54" defaultMessage="Another participant is online" />
            </p>
          ) : (
            <p styleName="offline">
              <FormattedMessage id="SwapController60" defaultMessage="Another participant is offline" />
            </p>
          )
        }
      </div>
    )
  }
}

export default SwapController
