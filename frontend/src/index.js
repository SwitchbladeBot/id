import React from 'react'
import ReactDOM from 'react-dom'
import Routing from './components/Routing'
import './index.css'

import './locales'

ReactDOM.render(
  <React.StrictMode>
    <Routing />
  </React.StrictMode>,
  document.getElementById('app')
);