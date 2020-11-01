import React from 'react'
import styled from 'styled-components'
import { BLURPLE, LIGHT_BLURPLE } from '../Constants'
import { CircularSkeleton } from '../common'
import { darken } from 'polished'

const hoverColor = p => p.filled ? '#677bc4' : 'rgba(0, 0, 0, 10%)'
const activeColor = p => p.filled ? '#5b6eae' : 'rgba(0, 0, 0, 20%)'

const ButtonWrapper = styled.button`
  background-color: ${p => p.filled ? BLURPLE : 'transparent'};
  color: ${p => p.filled ? LIGHT_BLURPLE : 'black'};
  border-radius: 10px;
  padding: 15px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  outline: none;
  border: none;
  width: 100%;
  transition: background-color .3s, opacity .3s;
  margin-top: 8px;
  
  &:hover {
    ${p => !p.disabled ? `background-color: ${hoverColor(p)};` : ''};
    cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  }
  
  &:active {
    background-color: ${p => activeColor(p)};
  }
  
  &:disabled {
    opacity: .7;
  }
`

const Button = ({ children, filled, icon, disabled, onClick }) => {
  return <ButtonWrapper filled={filled} disabled={disabled} onClick={onClick}>
    {children}
  </ButtonWrapper>
}

export default Button