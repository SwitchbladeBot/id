import styled from 'styled-components'
import React from 'react'

const LogoWrapper = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-weight: 900;
  font-style: italic;
  font-size: 24px;
  padding: ${p => p.padding || 34}px;
`

export const Logo = (props) => <LogoWrapper {...props}>SWITCHBLADE</LogoWrapper>

export const RectangularSkeleton = styled.div`
  background: #d7d7d7;
  animation: skeleton 1.5s ease-in-out 0.5s infinite;
  border-radius: 4px;
  width: ${p => p.width || 40}px;
  height: ${p => p.height || 40}px;
`

export const CircularSkeleton = styled(RectangularSkeleton)`
  border-radius: 50%;
`

export const Centered = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  ${p => !!p.column ? 'flex-direction: column; align-items: center;' : ''}
`

export const CenterText = styled.span`
  text-align: center;
  font-size: 20px;
`

export const Box = styled.div`
  margin-bottom: ${p => p.mb || 0}px;
  margin-top: ${p => p.mt || 0}px;
  padding-bottom: ${p => p.pb || 0}px;
  padding-top: ${p => p.pt || 0}px;
  width: ${p => p.fullWidth ? '100%' : 'auto'};
`