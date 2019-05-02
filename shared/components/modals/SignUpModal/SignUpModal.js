import React, { Fragment } from 'react'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'

import { connect } from 'redaction'
import actions from 'redux/actions'
import Link from 'sw-valuelink'
import { request, firebase, constants } from 'helpers'
import firestore from 'helpers/firebase/firestore'

import cssModules from 'react-css-modules'
import styles from './SignUpModal.scss'

import Modal from 'components/modal/Modal/Modal'
import Button from 'components/controls/Button/Button'
import Input from 'components/forms/Input/Input'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'


const title = defineMessages({
  signUpModal: {
    id: 'SignUpModal55',
    defaultMessage: 'Sign up',
  },
})

@withRouter
@connect(
  ({
    user: { ethData, btcData, ltcData },
    signUp: { isSigned },
  }) => ({
    ethAddress: ethData.address,
    btcAddress: btcData.address,
    ltcAddress: ltcData.address,
    isSigned,
  })
)
@injectIntl
@cssModules(styles)
export default class SignUpModal extends React.Component {

  static propTypes = {
    name: PropTypes.string,
  }

  constructor() {
    super()

    this.state = {
      isSubmited: false,
      isSupportedPush: firebase.isSupported(),
      isPushError: false,
      isEmailError: false,
      email: '',
    }
  }

  validateEmail = (value) => value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)

  handleSubmit = async () => {
    const { name, ethAddress, btcAddress, ltcAddress, history } = this.props
    const { isSupportedPush, email } = this.state

    const currentUrl = history.location
    const isRefLink = (currentUrl.search
      && currentUrl.search.includes('?promo=')
      && !localStorage.getItem(constants.localStorage.firstStart))
    let refEthAddress = null

    if (isRefLink) {
      // eslint-disable-next-line prefer-destructuring
      refEthAddress = currentUrl.search.split('?promo=')[1].split('&')[0]
      await firebase.submitUserData('usersBalance', { Referrer: refEthAddress })
    }

    const ipInfo = await firebase.getIPInfo()
    const data = {
      ...ipInfo,
      ethAddress,
      btcAddress,
      ltcAddress,
      Referrer: refEthAddress,
      registrationDomain: window.top.location.host,
      userAgentRegistration: navigator.userAgent,
    }
    firestore.addUser(data)

    this.setState(() => ({ isSubmited: true }))

    actions.analytics.signUpEvent({ action: 'request' })

    if (!isSupportedPush) {
      const result = await firebase.signUpWithEmail({
        ...data,
        email,
      })
      firestore.signUpWithEmail({
        email,
      })

      if (!result) {
        this.setState(() => ({
          isEmailError: true,
          isSubmited: result,
        }))
        return
      }

      this.setState(() => ({ isSubmited: result }))
      return
    }

    const result = await firebase.signUpWithPush(data)
    firestore.signUpWithPush()

    if (!result) {
      this.setState(() => ({
        isPushError: !result,
        isSupportedPush: result,
        isSubmited: result,
      }))
      return
    }

    this.setState(() => ({ isSubmited: result }))
  }

  close = () => {
    const { name, data } = this.props

    actions.modals.close(name)
    if (typeof data.onClose === 'function') {
      data.onClose()
    }
  }

  render() {
    const { isSubmited, isSupportedPush, isPushError, isEmailError, email } = this.state
    const { name, intl, data, isSigned } = this.props
    const isDisabled = isSupportedPush ? isSubmited : isSubmited || !this.validateEmail(email)

    const linked = Link.all(this, 'email')

    return (
      <Modal name={name} title={intl.formatMessage(title.signUpModal)} data={data} delayClose>
        {
          isSigned || isEmailError ? (
            <Fragment>
              {
                isEmailError && (
                  <p styleName="result">
                    <FormattedMessage id="SignUpModal133" values={{ br: <br />  }} defaultMessage="Something went wrong.{br}Try it later" />
                  </p>
                )
              }
              {
                isSigned && (
                  <p styleName="result">
                    <FormattedMessage id="SignUpModal000" values={{ br: <br />  }} defaultMessage="Thanks!{br}You will receive a notification" />
                  </p>
                )
              }
              <Button styleName="button" brand fullWidth onClick={this.close}>
                <FormattedMessage id="SignUpModal001" defaultMessage="Go to my wallet" />
              </Button>
            </Fragment>
          ) : (
            <Fragment>
              {
                !isSubmited && (
                  <div styleName="input-wrapper">
                    {
                      (!isSupportedPush || isPushError) && (
                        <Input styleName="input" valueLink={linked.email} focusOnInit type="email" placeholder="E-mail" />
                      )
                    }
                  </div>
                )
              }
              <Button styleName="button" brand fullWidth disabled={isDisabled} onClick={this.handleSubmit}>
                {
                  isSubmited ? (
                    <FormattedMessage id="SignUpModal002" defaultMessage="Wait please" />
                  ) : (
                    <FormattedMessage id="SignUpModal003" defaultMessage="Allow notifications" />
                  )
                }
              </Button>
              {
                !isPushError ? (
                  <p styleName="info">
                    <FormattedMessage
                      id="SignUpModal004"
                      values={{ br: <br />  }}
                      defaultMessage="You will receive notifications regarding updates with your account (orders, transactions){br}and monthly updates about our project" />
                  </p>
                ) : (
                  <p styleName="info">
                    <FormattedMessage
                      id="SignUpModal005"
                      values={{ br: <br />  }}
                      defaultMessage="It seems like push notification is not working{br}Please, leave your email for notifications,{br}or try later" />
                  </p>
                )
              }
            </Fragment>
          )
        }
      </Modal>
    )
  }
}
