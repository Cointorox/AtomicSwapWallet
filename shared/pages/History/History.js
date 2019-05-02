import React, { Component } from 'react'

import { connect } from 'redaction'
import actions from 'redux/actions'

import Row from './Row/Row'
import SwapsHistory from './SwapsHistory/SwapsHistory'
import ReactTooltip from 'react-tooltip'


import styles from 'components/tables/Table/Table.scss'
import Filter from './Filter/Filter'
import PageHeadline from 'components/PageHeadline/PageHeadline'
import InfiniteScrollTable from 'components/tables/InfiniteScrollTable/InfiniteScrollTable'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'


const filterHistory = (items, filter) => {
  if (filter === 'sent') {
    return items.filter(({ direction }) => direction === 'out')
  }

  if (filter === 'received') {
    return items.filter(({ direction }) => direction === 'in')
  }

  return items
}

const subTitle = defineMessages({
  subTitleHistory: {
    id: 'Amount68',
    defaultMessage: 'My History',
  },
})

@injectIntl
@connect(({ history: { transactions, filter, swapHistory } }) => ({
  items: filterHistory(transactions, filter),
  swapHistory,
}))
export default class History extends Component {
  state = {
    renderedItems: 10,
  }

  componentDidMount() {
    // actions.analytics.dataEvent('open-page-history')
    actions.user.setTransactions()
    actions.core.getSwapHistory()
  }

  loadMore = () => {
    const { items } = this.props
    const { renderedItems } = this.state

    if (renderedItems < items.length) {
      this.setState(state => ({
        renderedItems: state.renderedItems + Math.min(10, items.length - state.renderedItems),
      }))
    }
  }

  rowRender = (row) => (
    <Row key={row.hash} {...row} />
  )

  render() {
    const { items, swapHistory, intl } = this.props
    const titles = [
      <FormattedMessage id="Coin61" defaultMessage="Coin" />,
      <FormattedMessage id="Status61" defaultMessage="Status" />,
      <FormattedMessage id="Statement61" defaultMessage="Statement" />,
      <FormattedMessage id="Amount61" defaultMessage="Amount" />,
    ]

    return (
      <section>
        <PageHeadline subTitle={intl.formatMessage(subTitle.subTitleHistory)} />
        { swapHistory.length > 0 && <SwapsHistory showSubtitle="true" orders={swapHistory.filter(item => item.step >= 4)} /> }
        <h3 data-tip data-for="transactions" style={{ width:'210px' }}>
          <FormattedMessage id="history68" defaultMessage="All transactions" />
        </h3>
        <ReactTooltip id="transactions" type="light" effect="solid">
          <span>
            <FormattedMessage id="history72" defaultMessage="All transactions sent and received" />
          </span>
        </ReactTooltip>
        <Filter />
        <InfiniteScrollTable
          className={styles.history}
          titles={titles}
          bottomOffset={400}
          getMore={this.loadMore}
          itemsCount={items.length}
          items={items.slice(0, this.state.renderedItems)}
          rowRender={this.rowRender}
        />
      </section>
    )
  }
}
