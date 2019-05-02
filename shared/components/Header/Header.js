/* eslint-disable max-len */
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { withRouter } from 'react-router-dom'
import { isMobile } from 'react-device-detect'
import { connect } from 'redaction'

import links from 'helpers/links'
import actions from 'redux/actions'
import { constants, firebase } from 'helpers'
import config from 'app-config'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import Tour from 'reactour'

import CSSModules from 'react-css-modules'
import styles from './Header.scss'

import Nav from './Nav/Nav'
import User from './User/User'
import SignUpButton from './User/SignUpButton/SignUpButton'
import NavMobile from './NavMobile/NavMobile'

import LogoTooltip from 'components/Logo/LogoTooltip'
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'
import TourPartial from './TourPartial/TourPartial'

import Logo from 'components/Logo/Logo'
import { relocalisedUrl } from 'helpers/locale'
import { localisedUrl } from '../../helpers/locale'
import UserTooltip from 'components/Header/User/UserTooltip/UserTooltip'

let lastScrollTop = 0

const messages = defineMessages({
  wallet: {
    id: 'menu.wallet',
    description: 'Menu item "Wallet"',
    defaultMessage: 'Wallet',
  },
  exchange: {
    id: 'menu.exchange',
    description: 'Menu item "Exchange"',
    defaultMessage: 'Exchange',
  },
  history: {
    id: 'menu.history',
    description: 'Menu item "My History"',
    defaultMessage: 'My History',
  },
  aboutus: {
    id: 'menu.aboutus',
    description: 'Menu item "About Us"',
    defaultMessage: 'About Us',
  },
})


@injectIntl
@withRouter
@connect({
  feeds: 'feeds.items',
  peer: 'ipfs.peer',
  isSigned: 'signUp.isSigned',
  isInputActive: 'inputActive.isInputActive',
})
@CSSModules(styles, { allowMultiple: true })
export default class Header extends Component {

  static propTypes = {
    history: PropTypes.object.isRequired,
  }

  static getDerivedStateFromProps({ history: { location: { pathname } } }) {
    if  (pathname === '/ru' || pathname === '/') {
      return { path: true }
    }
    return { path: false }
  }

  constructor(props) {
    super(props)
    this.state = {
      optionsForOenSignUpModal: {},
      isPartialTourOpen: false,
      path: false,
      isTourOpen: false,
      isShowingMore: false,
      sticky: false,
      menuItems: [
        {
          title: props.intl.formatMessage(messages.wallet),
          link: links.home,
          exact: true,
          icon: 'wallet',
        },
        {
          title: props.intl.formatMessage(messages.exchange),
          link: links.exchange,
          icon: 'exchange-alt',
          tour: 'reactour__exchange',
        },
        {
          title: props.intl.formatMessage(messages.history),
          link: links.history,
          icon: 'history',
        },
        {
          title: props.intl.formatMessage(messages.aboutus),
          link: links.aboutus,
          isMobile: false,
        },
      ],
    }
    this.lastScrollTop = 0
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll)

    const checker = setInterval(() => {
      switch (true) {
        case !localStorage.getItem(constants.localStorage.wasOnExchange):
        case !localStorage.getItem(constants.localStorage.wasOnWallet):
          this.startTourAndSignInModal()
          break
        default:
          clearInterval(checker)
      }
    }, 3000)
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
    this.startTourAndSignInModal()

  }

  startTourAndSignInModal = () => {
    // if (!process.env.MAINNET || config.isWidget) {
    //   return
    // }

    const currentUrl = this.props.history.location
    const isGuestLink = !(!currentUrl.hash
      || currentUrl.hash.slice(1) !== 'guest')

    if (isGuestLink) {
      localStorage.setItem(constants.localStorage.wasOnWallet, true)
      localStorage.setItem(constants.localStorage.wasOnExchange, true)

      return
    }

    const isStartPage = currentUrl.pathname === '/' || currentUrl.pathname === '/ru'
    const isPartialPage = currentUrl.pathname.includes('/exchange/')
    const didOpenSignUpModal = localStorage.getItem(constants.localStorage.didOpenSignUpModal)
    const wasOnWallet = localStorage.getItem(constants.localStorage.wasOnWallet)
    const wasOnExchange = localStorage.getItem(constants.localStorage.wasOnExchange)

    switch (true) {
      case isStartPage && !wasOnWallet:
        this.startTourInNeed(didOpenSignUpModal, this.openWalletTour)
        localStorage.setItem(constants.localStorage.wasOnWallet, true)
        break
      case isPartialPage && !wasOnExchange:
        this.startTourInNeed(didOpenSignUpModal, this.openExchangeTour)
        localStorage.setItem(constants.localStorage.wasOnExchange, true)
        break
      default: return
    }

    if (!didOpenSignUpModal) {
      this.openSignUpModal(this.state.optionsForOenSignUpModal)
    }
  }

  startTourInNeed = (didOpenSignUpModal, inNeedTourStarter) => {
    if (!didOpenSignUpModal) {
      this.optionsForOenSignUpModal(inNeedTourStarter)
    } else {
      inNeedTourStarter()
    }
  }

  optionsForOenSignUpModal(inNeedTourStarter) {
    this.setState(() => ({
      optionsForOenSignUpModal: { onClose: inNeedTourStarter },
    }))
  }

  declineRequest = (orderId, participantPeer) => {
    actions.core.declineRequest(orderId, participantPeer)
    actions.core.updateCore()
  }

  acceptRequest = async (orderId, participantPeer, link) => {
    const { toggle, history, intl: { locale } } = this.props

    actions.core.acceptRequest(orderId, participantPeer)
    actions.core.updateCore()

    if (typeof toggle === 'function') {
      toggle()
    }

    await history.replace(localisedUrl(locale, link))
    await history.push(localisedUrl(locale, link))
  }

  handleScroll = () =>  {
    if (this.props.history.location.pathname === '/') {
      this.setState(() => ({ sticky: false }))
      return
    }
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop
    if (scrollTop > this.lastScrollTop) {
      this.setState(() => ({ sticky: false }))
    }
    else {
      this.setState(() => ({ sticky: true }))
    }
    this.lastScrollTop = scrollTop
  }

  toggleShowMore = () => {
    this.setState(prevState => ({
      isShowingMore: !prevState.isShowingMore,
    }))
  }

  closeTour = () => {
    this.setState({ isTourOpen: false })
  }

  openSignUpModal = (options) => {
    localStorage.setItem(constants.localStorage.didOpenSignUpModal, true)
    actions.modals.open(constants.modals.SignUp, options)
  }

  openWalletTour = () => {
    this.setState({ isTourOpen: true })
    console.warn('work!')

  }

  openExchangeTour = () => {
    this.setState({ isPartialTourOpen: true })
  }

  render() {

    const { sticky, menuItems, isTourOpen, isShowingMore, path, isPartialTourOpen } = this.state
    const { intl: { locale }, history, pathname, feeds, peer, isSigned, isInputActive } = this.props

    const accentColor = '#510ed8'

    if (config && config.isWidget) {
      return (
        <User
          acceptRequest={this.acceptRequest}
          declineRequest={this.declineRequest} />
      )
    }

    if (isMobile) {
      return (
        <div styleName={isInputActive ? 'header-mobile header-mobile__hidden' : 'header-mobile'}>
          <UserTooltip
            feeds={feeds}
            peer={peer}
            acceptRequest={this.acceptRequest}
            declineRequest={this.declineRequest}
          />
          <NavMobile menu={menuItems} />
          {!isSigned && (<SignUpButton mobile />)}
        </div>
      )
    }

    return (
      <div styleName={sticky ? 'header header-fixed' : 'header'}>
        <WidthContainer styleName="container">
          <LogoTooltip withLink />
          <Nav menu={menuItems} />
          <Logo withLink mobile />
          <TourPartial isTourOpen={this.state.isPartialTourOpen} />
          <User
            openTour={this.openWalletTour}
            path={path}
            acceptRequest={this.acceptRequest}
            declineRequest={this.declineRequest}
          />
          <Tour
            steps={tourSteps}
            onRequestClose={this.closeTour}
            isOpen={isTourOpen}
            maskClassName="mask"
            className="helper"
            accentColor={accentColor}
          />
        </WidthContainer>
      </div>
    )
  }
}
const tourSteps = [
  {
    selector: '[data-tut="reactour__address"]',
    content: <FormattedMessage
      id="Header184"
      defaultMessage="This is your personal bitcoin address. We do not store your private keys. Everything is kept in your browser. No server, no back-end, completely decentralized. " />,
  },
  {
    selector: '[data-tut="reactour__save"]',
    content: <FormattedMessage id="Header188" defaultMessage="AtomicSwapWallet.io does NOT store your private keys, please download and keep them in a secured place" />,
  },
  {
    selector: '[data-tut="reactour__balance"]',
    content: <FormattedMessage id="Header192" defaultMessage="This is your bitcoin balance. You can close your browser, reboot your computer. Your funds will remain safe, just don't forget to save your private keys" />,
  },
  {
    selector: '[data-tut="reactour__store"]',
    content: <FormattedMessage id="Header196" defaultMessage="You can store crypto of different blockchains including Bitcoin, Ethereum, EOS, Bitcoin Cash, Litecoin and various token" />,
  },
  {
    selector: '[data-tut="reactour__exchange"]',
    content: <FormattedMessage id="Header200" defaultMessage="Our killer feature is the peer-to-peer exchange available in our wallet powered by atomic swap technology. You can perfrom swaps with any crypto listed in our wallet." />,
  },
  {
    selector: '[data-tut="reactour__sign-up"]',
    content: <FormattedMessage
      id="Header205"
      defaultMessage="You will receive notifications regarding updates with your account (orders, transactions) and monthly updates about our project" />,
  },
  {
    selector: '[data-tut="reactour__goTo"]',
    content: ({ goTo }) => (
      <div>
        <strong><FormattedMessage id="Header194" defaultMessage="Do not forget to save your keys" /></strong>
        <button
          style={{
            border: '1px solid #f7f7f7',
            background: 'none',
            padding: '.3em .7em',
            fontSize: 'inherit',
            display: 'block',
            cursor: 'pointer',
            margin: '1em auto',
          }}
          onClick={() => goTo(1)}
        >
          <FormattedMessage id="Header207" defaultMessage="show how to save" />
        </button>
      </div>),
  },
]
