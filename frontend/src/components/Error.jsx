import React from 'react'
import styled from 'styled-components'
import {ReactComponent as CloseIcon} from '../assets/error.svg'
import { Centered } from '../common'
import { useTranslation } from 'react-i18next'

const ErrorIcon = styled(CloseIcon)`
  width: 72px;
  height: 72px;
`

const Title = styled.span`
  font-weight: bold;
  font-size: 28px;
  margin: 24px 0;
`

const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Error = ({ children }) => {
  const { t } = useTranslation()

  return <Centered>
    <ErrorWrapper>
      <ErrorIcon />
      <Title>
        {t('error.title')}
      </Title>
      {children}
    </ErrorWrapper>
  </Centered>
}

export default Error