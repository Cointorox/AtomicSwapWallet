import React, { Fragment } from 'react'

import styles from './Links.scss'
import CSSModules from 'react-css-modules'

import links from 'helpers/links'
import { FormattedMessage } from 'react-intl'

const link = [
  [
    /* Наши продукты (Our products) */
    { header: <FormattedMessage id="FooterOurProductsHeader" defaultMessage="Products" />,
    /* Криптовалютный обменник (Exchange) https://Atomicswapwallet.io/exchange */
      link : links.footer.exchange, title: <FormattedMessage id="FooterOurProductsExchange" defaultMessage="Exchange" /> },
    /* Криптовалютый онлайн кошелек (Wallet) https://Atomicswapwallet.io */
    { link : links.footer.wallet, title: <FormattedMessage id="FooterOurProductsWallet" defaultMessage="Wallet" /> },
    { link : links.footer.chromeextension, title: <FormattedMessage id="FooterOurProductsChromeExtension" defaultMessage="Chrome Extension" /> },
  ],
  [
    /* Партнерам (Partnership) */
    { header: <FormattedMessage id="FooterPartnershipHeader" defaultMessage="Partnership" />,
    /* Для стейблкоинов (For stablecoins) https://wiki.swap.online/for_stablecoins/ */
      link: links.footer.forstablecoin, title: <FormattedMessage id="FooterPartnershipForstablecoin" defaultMessage="Host dIEO" /> },
    /* Другим DEX (For DEXes) https://wiki.swap.online/for_dexs/ */
    { link: links.footer.fordexses, title: <FormattedMessage id="FooterPartnershipForDEXes" defaultMessage="Whitelabel Solution" /> },
    /* Блокчейнам (For Blockchains) https://wiki.swap.online/for_blockchains/ */
    { link: links.footer.forblockchains, title: <FormattedMessage id="FooterPartnershipForBlockchains" defaultMessage="List Coin" /> },
    /* Токенам (For ERC20 tokens) https://listing.Atomicswapwallet.io/ */
    { link: links.footer.forerc20tokens, title: <FormattedMessage id="FooterPartnershipForERC20" defaultMessage="List Token" /> },
    /* Виджет для криптосайтов (For news websites) https://widget.Atomicswapwallet.io/ */
    { link: links.footer.fornewswebsites, title: <FormattedMessage id="FooterPartnershipForNewsWebsites" defaultMessage="Press Opportunities" /> },
  ],
  [
    /* Технология (Technology) */
    { header: <FormattedMessage id="FooterTechnologyHeader" defaultMessage="Technology" />,
    /* Whitepaper https://wiki.swap.online/en.pdf */
      link: links.footer.whitepaper, title: <FormattedMessage id="FooterTechnologyWhitepaper" defaultMessage="Whitepaper" /> },
    /* Wiki https://wiki.swap.online/ */
    { link: links.footer.wiki, title: <FormattedMessage id="FooterTechnologyWiki" defaultMessage="Wiki" /> },
    /* GitHub https://github.com/swaponline */
    { link: links.footer.github, title: <FormattedMessage id="FooterTechnologyGithub" defaultMessage="GitHub" /> },
  ],
  [
    /* О компании (About company) */
    { header: <FormattedMessage id="FooterAboutHeader" defaultMessage="About company" />,
    /* О компании (About company) https://wiki.swap.online/about-swap-online/ */
      link: links.footer.about, title: <FormattedMessage id="FooterAboutCompany" defaultMessage="About Us" /> },
    /* Условия использования (Agreements) https://drive.google.com/file/d/0Bz2ZwZCmFtj_Nm9qSm0tUm9Ia1kwVGhWRlVlVXRJTGZtYW5N/view?usp=sharing */
    { link: links.footer.agreements, title: <FormattedMessage id="FooterAboutAgreements" defaultMessage="Terms of Use" /> },
    /* Политика конфиденциальности (Privacy policy) https://drive.google.com/file/d/1LdsCOfX_pOJAMqlL4g6DfUpZrGF5eRe9/view?usp=sharing */
    { link: links.footer.privacypolicy, title: <FormattedMessage id="FooterAboutPrivacyPolicy" defaultMessage="Privacy policy" /> },
    /* Контакты (Contacts) https://wiki.swap.online/contacts-swap-online/ */
    { link: links.footer.contacts, title: <FormattedMessage id="FooterAboutContacts" defaultMessage="Contact Us" /> },
  ],
]

const getIcon = (icon) => {
  switch (icon) {
    case 'lightling':
      return <img alt="Lightling" src="https://s.w.org/images/core/emoji/11/svg/26a1.svg" />
    default:
      return null
  }
}
const Rows = items => items.map((item, index) => (
  <Fragment key={index}>
    { item.header && <h4>{item.header}</h4> }
    { item.icon && (
      <div>
        { getIcon(item.icon) }
        <a href={item.link} target="_blank" rel="noopener noreferrer">{item.title}</a>
      </div>
    )}
    { !item.icon && (
      <a href={item.link} target="_blank" rel="noopener noreferrer">{item.title}</a>
    )}
  </Fragment>
))


const Links = () => (
  <div styleName="links">
    {
      link.map((items, index) => (
        <div styleName="column" key={index}>
          {
            Rows(items)
          }
        </div>
      ))
    }
  </div>
)

export default CSSModules(styles)(Links)
