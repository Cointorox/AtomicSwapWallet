import React, { Fragment } from 'react'
import CSSModules from 'react-css-modules'

import ReactTooltip from 'react-tooltip'
import styles from './Tooltip.scss'
import { FormattedMessage } from 'react-intl'


const Tooltip = ({ children, id, dontHideMobile, place }) => (
  <Fragment>
    <span data-tip data-for={id} styleName={`tooltip${dontHideMobile ? ' tooltip_truesight' : ''}`}>
      <FormattedMessage id="Tooltip11" defaultMessage="?" />
    </span>
    <ReactTooltip id={id} effect="solid" type="light" multiline {...{ place }} styleName="r-tooltip" >
      {children}
    </ReactTooltip>
  </Fragment>
)

export default CSSModules(Tooltip, styles, { allowMultiple: true })
