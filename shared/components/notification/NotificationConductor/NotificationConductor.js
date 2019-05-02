import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redaction'

import Notifications from 'components/notifications'

import cssModules from 'react-css-modules'
import styles from './NotificationConductor.scss'


@connect({
  notifications: 'notifications',
})
@cssModules(styles)
export default class NotificationConductor extends Component {

  static propTypes = {
    notifications: PropTypes.object,
  }

  render() {
    const { notifications } = this.props

    const notificationNames = Object.keys(notifications)
    const areNotificationsExist = Boolean(notificationNames.length)

    return areNotificationsExist && (
      <div styleName="notificationConductor">
        {
          notificationNames.map((key) => {
            const { name, data = {} } = notifications[key]

            return React.createElement(Notifications[name], {
              key: name,
              name,
              data,
            })
          })
        }
      </div>
    )
  }
}
