import React from 'react'
import ReactDOM from 'react-dom'
import routes from 'routes'
import store, { history } from 'redux/store'

import Root from 'containers/Root/Root'
import Loader from 'components/loaders/Loader/Loader'
import { migrate } from 'helpers'
import ErrorPageNoSSL from 'components/ErrorPageNoSSL/ErrorPageNoSSL'

{window.location.protocol === 'http:' && window.location.hostname !== 'localhost'
  ? (ReactDOM.render(
      <ErrorPageNoSSL />,
      document.getElementById('root')
    ))
  : (migrate().finally(() => setTimeout(() => {
      ReactDOM.render(
        <Root history={history} store={store} routes={routes} />,
        document.getElementById('root')
      )
    }, 1000))
  )
}
