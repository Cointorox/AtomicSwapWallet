import React, { Component, Fragment } from 'react'

import styles from './FeeControler.scss'
import cssModules from 'react-css-modules'

import CopyToClipboard from 'react-copy-to-clipboard'
import { FormattedMessage } from 'react-intl'
import { BigNumber } from 'bignumber.js'

import Button from 'components/controls/Button/Button'
import Timer from 'components/Timer/Timer'

import config from 'app-config'


const isWidgetBuild = config && config.isWidget

@cssModules(styles)
export default class FeeControler extends Component {

  state = {
    isAddressCopied: false,
  }

  handleCopy = () => {
    this.setState({
      isAddressCopied: true,
    }, () => {
      setTimeout(() => {
        this.setState({
          isAddressCopied: false,
        })
      }, 500)
    })
  }

  render() {
    const { ethAddress } = this.props
    const { isAddressCopied } = this.state

    return (
      <div styleName="main">
        <CopyToClipboard text={ethAddress} data-tut="reactour__address">
          <div>
            <div styleName="warning">
              <i className="fas fa-exclamation-triangle" />
            </div>
            <Fragment>
              <h3 styleName="feeHeading">
                <FormattedMessage
                  id="FeeControler68"
                  defaultMessage="Not enough ETH on your balance for miner fee.{br}Deposit 0.002 ETH to your account"
                  values={{
                    br: <br />,
                  }}
                />
              </h3>
              <p styleName="address">
                {ethAddress}
              </p>
              <Button brand styleName="button" onClick={this.handleCopy}>
                {isAddressCopied
                  ? <FormattedMessage id="FeeControler48" defaultMessage="Copied" />
                  : <FormattedMessage id="FeeControler49" defaultMessage="Copy" />
                }
              </Button>
            </Fragment>
          </div>
        </CopyToClipboard>
      </div>
    )
  }
}
