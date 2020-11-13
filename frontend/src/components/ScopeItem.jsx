import React from 'react'
import styled from 'styled-components'
import {ReactComponent as ScopeIcon} from '../assets/scope.svg'

const ScopeItemWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 12px;
  margin-bottom: 12px;
`

const Text = styled.span`
  font-size: 14px;
  line-height: 15px;
`

const Scope = styled(ScopeIcon)`
  width: 25px;
  height: 25px;
  min-width: 25px;
  min-height: 25px;
  margin-right: 10px;
`

const ScopeItem = ({ children }) => {
  return <ScopeItemWrapper>
    <Scope />
    <Text>
      {children}
    </Text>
  </ScopeItemWrapper>
}

export default ScopeItem