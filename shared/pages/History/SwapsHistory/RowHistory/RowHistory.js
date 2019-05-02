import React, { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment/moment'

import { links, localStorage } from 'helpers'
import actions from 'redux/actions'
import { Link } from 'react-router-dom'

import CSSModules from 'react-css-modules'
import styles from './RowHistory.scss'

import Coins from 'components/Coins/Coins'
import Timer from 'pages/Swap/Timer/Timer'
import Avatar from 'components/Avatar/Avatar'
import { FormattedMessage, injectIntl } from 'react-intl'
import { localisedUrl } from 'helpers/locale'
import BigNumber from 'bignumber.js'


@injectIntl
@CSSModules(styles, { allowMultiple: true })
export default class RowHistory extends Component {

  static propTypes = {
    row: PropTypes.object,
  }

  tryRefund = (timeLeft) => {
    const { row: { id } } = this.props

    if (timeLeft > 0) {
      return
    }

    try {
      const { flow } = actions.core.getSwapById(id)

      const {
        state: { isFinished, isRefunded, step, scriptBalance },
        swap: { sellCurrency },
      } = flow

      const isPayed = sellCurrency === 'BTC' ? 4 : 5

      if (isFinished || isRefunded || (step === isPayed && scriptBalance === 0)) {
        console.error(`Refund of swap ${id} is not available`)
        return
      }

      flow.tryRefund()
        .then((result) => {
          console.log('refunded', result)
          localStorage.setItem(`swap:flow.${id}`, flow.state)
        })
    } catch (err) {
      console.error(`RefundError`, err)
    }
  }

  componentDidMount() {
    const {
      btcScriptValues, ltcScriptValues,
      usdtScriptValues, scriptValues,
    } = this.props.row

    const values  = btcScriptValues
      || ltcScriptValues
      || usdtScriptValues
      || scriptValues

    if (!values) return

    const lockTime = values.lockTime * 1000

    const timeLeft = lockTime - Date.now()

    this.tryRefund(timeLeft)
  }

  closeIncompleted = () => {
    actions.modals.close('IncompletedSwaps')
  }


  render() {

    const { row, intl: { locale } } = this.props

    if (row === 'undefined') {
      return null
    }

    let {
      buyAmount, buyCurrency, sellAmount, btcScriptValues, balance,
      ltcScriptValues, usdtScriptValues, isRefunded, isMy, sellCurrency,
      isFinished, id, scriptValues,
    } = row

    const values = btcScriptValues || ltcScriptValues || usdtScriptValues || scriptValues
    const date = Date.now() / 1000

    if (!values) {
      return
    }

    const lockDateAndTime = moment.unix(values.lockTime || date).format('HH:mm:ss DD/MM/YYYY')

    const linkToTheSwap = isMy
      ? `${localisedUrl(locale, links.swap)}/${sellCurrency}-${buyCurrency}/${id}`
      : `${localisedUrl(locale, links.swap)}/${buyCurrency}-${sellCurrency}/${id}`

    buyAmount   = BigNumber(buyAmount)
    sellAmount  = BigNumber(sellAmount)

    return (
      <tr>
        <td>
          <Avatar
            value={id}
          />
        </td>
        <td>
          <Link to={`${linkToTheSwap}`}>
            <Coins names={[buyCurrency, sellCurrency]}  />
          </Link>
        </td>
        <td>
          {
            isMy ? (
              `${sellAmount.toFixed(5)} ${sellCurrency.toUpperCase()}`
            ) : (
              `${buyAmount.toFixed(5)} ${buyCurrency.toUpperCase()}`
            )
          }
        </td>
        <td>
          {
            isMy ? (
              `${buyAmount.toFixed(5)} ${buyCurrency.toUpperCase()}`
            ) : (
              `${sellAmount.toFixed(5)} ${sellCurrency.toUpperCase()}`
            )
          }
        </td>
        <td>
          { (sellAmount / buyAmount).toFixed(5) }{ ` ${sellCurrency}/${buyCurrency}`}
        </td>
        <td>
          { isFinished ?
            <FormattedMessage id="RowHistory94" defaultMessage="Finished" />
            :
            (isRefunded && <FormattedMessage id="RowHistory77" defaultMessage="Refunded" /> ||
              values && !isRefunded && !isFinished && balance > 0 ? (
                <Timer
                  lockTime={values.lockTime * 1000}
                  enabledButton={this.tryRefund}
                />
              ) : (
                !isRefunded && <FormattedMessage id="RowHistory76" defaultMessage="Refund not available" />
              )
            )
          }
        </td>
        <td>
          { lockDateAndTime.split(' ').map((item, key) => <Fragment key={key}>{item}<br /></Fragment>) }
        </td>
        <td>
          <Link to={`${linkToTheSwap}`} onClick={this.closeIncompleted}>
            <FormattedMessage id="RowHistory91" defaultMessage="Link to the swap" />
          </Link>
        </td>
      </tr>
    )
  }
}
