import React from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import Login from '../pages/Login'
import Authorize from '../pages/Authorize'

const Routing = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/login" component={Login} exact />
        <Route path="/authorize" component={Authorize} exact />
      </Switch>
    </BrowserRouter>
  )
}

export default Routing