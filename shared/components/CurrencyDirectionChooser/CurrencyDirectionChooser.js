import React, { Component } from 'react'
import PropTypes from 'prop-types'

import actions from 'redux/actions'
import { constants } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './CurrencyDirectionChooser.scss'
import { connect } from 'redaction'

import Flip from 'components/controls/Flip/Flip'
import Button from 'components/controls/Button/Button'
import CurrencySelect from 'components/ui/CurrencySelect/CurrencySelect'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import { FormattedMessage } from 'react-intl'


@connect(
  ({
    currencies,
    addSelectedItems,
    user: { ethData, btcData, /* bchData, */ tokensData, eosData, telosData, nimData, usdtData, ltcData },
  }) => ({
    currencies: currencies.items,
    addSelectedItems: currencies.addSelectedItems[0],
    items: [ ethData, btcData, eosData, telosData, /* bchData, */ ltcData, usdtData /* nimData */ ],
    tokenItems: [ ...Object.keys(tokensData).map(k => (tokensData[k])) ],
  })
)
@CSSModules(styles, { allowMultiple: true })
export default class CurrencyDirectionChooser extends Component {

  static propTypes = {
    flipCurrency: PropTypes.func,
    currencies: PropTypes.any,
    handleSellCurrencySelect: PropTypes.func,
    handleBuyCurrencySelect: PropTypes.func,
    handleSubmit: PropTypes.func,
    buyCurrency: PropTypes.string.isRequired,
    sellCurrency: PropTypes.string.isRequired,
  }

  createOffer = () => {
    const { buyCurrency, sellCurrency } = this.props

    // return if value equal undefined or null
    if (!sellCurrency || !buyCurrency) {
      return
    }

    actions.modals.open(constants.modals.Offer, {
      buyCurrency,
      sellCurrency,
    })

    // actions.analytics.dataEvent('orderbook-click-createoffer-button')
  }

  chooseProps = () => {
    const { currencies, tokenItems, addSelectedItems } = this.props

    if (addSelectedItems === undefined) {
      return currencies
    }
    return addSelectedItems
  }

  render() {
    const { buyCurrency, sellCurrency,
      flipCurrency, handleBuyCurrencySelect, handleSellCurrencySelect, handleSubmit,
      currencies, addSelectedItems } = this.props

    return (
      <div styleName="choice">
        <div styleName="row title">
          <SubTitle>
            <FormattedMessage id="CurrencyDirectionChooser54" defaultMessage=" Choose the direction of exchange" />
          </SubTitle>
        </div>
        <div styleName="row formRow">
          <div styleName="row">
            <div styleName="row rowLeft">
              <p styleName="text">
                <FormattedMessage id="CDC63" defaultMessage="You have" />
              </p>
              <CurrencySelect
                styleName="currencySelect currencySelectLeft"
                selectedValue={sellCurrency}
                onSelect={handleSellCurrencySelect}
                currencies={currencies}
              />
            </div>
            <Flip onClick={flipCurrency} />
            <div styleName="row rowRight">
              <p styleName="text">
                <FormattedMessage id="CDC75" defaultMessage="You get" />
              </p>
              <CurrencySelect
                styleName="currencySelect currencySelectRight"
                selectedValue={buyCurrency}
                onSelect={handleBuyCurrencySelect}
                currencies={this.chooseProps()}
              />
            </div>
          </div>
          <Button styleName="button" brand onClick={handleSubmit}>
            <FormattedMessage id="CurrencyDirectionChooser86" defaultMessage="SHOW ORDERS " />
          </Button>
          <Tooltip id="cdc87" >
            <FormattedMessage id="CDC52" defaultMessage="Offer list" />
          </Tooltip>
        </div>
      </div>
    )
  }
}
