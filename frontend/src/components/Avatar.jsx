import React from 'react'
import styled from 'styled-components'
import { AVATAR_SIZE } from '../Constants'
import { CircularSkeleton } from '../common'
import {ReactComponent as Verified} from '../assets/verified.svg'

const badgeSize = 30
const badgeGap = 14

const AvatarWrapper = styled.div`
  width: ${AVATAR_SIZE + 16}px;
  display: flex;
  justify-content: center;
`

const Image = styled.img`
  border-radius: 50%;
  width: ${AVATAR_SIZE}px;
  height: ${AVATAR_SIZE}px;
  position: relative;
  //left: ${badgeSize / 2}px;
`

const VerifiedBadge = styled(Verified)`
  width: ${badgeSize}px;
  height: ${badgeSize}px;
  position: absolute;
  right: ${badgeGap / 2}px;
  bottom: ${badgeGap}px;
`

const Avatar = ({ src, verified, alt }) => {
  return src
    ? (
      <AvatarWrapper>
          <Image src={src} alt={alt || 'Avatar image'}/>
          {
            verified
              ? <VerifiedBadge />
              : null
          }
      </AvatarWrapper>
    )
    : <CircularSkeleton width={AVATAR_SIZE} height={AVATAR_SIZE}/>
}

export default Avatar