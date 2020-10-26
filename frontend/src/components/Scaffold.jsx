import React from 'react'
import { Centered, Logo } from '../common'
import { BREAKPOINT, LIGHT_BLURPLE } from '../Constants'
import styled from 'styled-components'
import useMediaQuery from '../utils/useMediaQuery'

const Container = styled.div`
  max-width: ${BREAKPOINT}px;
  width: 100%;
  height: 100vh;
`

const SmallContainer = styled(Container)`
  background: ${LIGHT_BLURPLE};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0 16px;
`

const NormalContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const LightBox = styled.div`
  background: ${LIGHT_BLURPLE};
  border-radius: 10px;
  margin: 0 16px;
  padding: 16px 16px 0;
  display: flex;
  flex-direction: column;
  width: calc(100% - 64px);
`

const SmallScaffold = ({ children }) => {
  return <SmallContainer>
    <Centered>
      <Logo/>
    </Centered>
    {children}
  </SmallContainer>
}

const NormalScaffold = ({ children }) => {
  return <NormalContainer>
    <Centered>
      <Logo padding={14} />
    </Centered>
    <LightBox>
      {children}
    </LightBox>
  </NormalContainer>
}

const Scaffold = ({ children }) => {
  const isSmall = useMediaQuery(`(max-width: ${BREAKPOINT}px)`)
  return <Centered>
    {
      isSmall
        ? <SmallScaffold>{children}</SmallScaffold>
        : <NormalScaffold>{children}</NormalScaffold>
    }
  </Centered>
}

export default Scaffold