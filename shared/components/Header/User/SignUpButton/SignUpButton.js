import React, { Fragment } from 'react'

import actions from 'redux/actions'
import { constants, links } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './SignUpButton.scss'

import ReactTooltip from 'react-tooltip'
import { FormattedMessage } from 'react-intl'


const handleSignUp = () => {
  actions.modals.open(constants.modals.SignUp, {})
}

const SignUpButton = ({ mobile }) => (
  <div styleName={mobile ? 'mobile' : ''}>
    {
      process.env.TESTNET ? (
        <Fragment>
          <a href={links.main} target="_blank" rel="noreferrer noopener" styleName="button" data-tip data-for="main">
            <FormattedMessage id="ADDoffer2218" defaultMessage="Mainnet" />
          </a>
          <ReactTooltip id="main" type="light" effect="solid">
            <span>
              <FormattedMessage id="ADDoffer22" defaultMessage="Start to real Swap" />
            </span>
          </ReactTooltip>
        </Fragment>
      ) : (
        <Fragment>
          <button styleName="button" data-tut="reactour__sign-up" onClick={handleSignUp} /* eslint-disable-line */ data-tip data-for="sign-up" >
            <FormattedMessage id="ADDoffer29" defaultMessage="Sign up" />
          </button>
          <ReactTooltip id="sign-up" type="light" effect="solid">
            <span>
              <FormattedMessage id="ADDoffer33" defaultMessage="Get subscribed for the Atomicswapwallet.io news" />
            </span>
          </ReactTooltip>
          <button styleName="buttonMobile" onClick={handleSignUp} /* eslint-disable-line */ >
            <i className="fa fa-bell" aria-hidden="true" />
          </button>
        </Fragment>
      )
    }
  </div>
)

export default CSSModules(SignUpButton, styles)
