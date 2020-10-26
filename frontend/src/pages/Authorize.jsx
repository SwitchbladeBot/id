import React, { useEffect, useState } from 'react'
import Scaffold from '../components/Scaffold'
import { Box, Centered, CenterText, RectangularSkeleton } from '../common'
import Avatar from '../components/Avatar'
import Button from '../components/Button'
import styled from 'styled-components'

const Avatars = styled.div`
  display: flex;
  justify-content: space-around;
`

const Dots = styled.div`
  margin: 0 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Authorize = () => {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/api/authorize')
      .then(r => r.json())
      .then(r => setData(r))
  }, [])

  return (
    <Scaffold>
      <Box mt={24 * 3} mb={24 * 3}>
        <Centered column>
          <Box mb={24}>
            <Avatars>
              <Avatar
                src={data ? data.user.image : null}
              />
              <Dots>
                - - - -
              </Dots>
              <Avatar
                src={data ? data.application.image : null}
                verified={data ? data.application.verified : false}
              />
            </Avatars>
          </Box>
          {
            data
              ? <CenterText>
                <b>{data.application.name}</b> wants to do these actions on your behalf
              </CenterText>
              : <RectangularSkeleton width={270} height={18}/>
          }
        </Centered>
      </Box>
      <Box pb={16} fullWidth>
        <Button
          filled
          disabled={!data}
          onClick={() => alert('confirmado!')}
        >
          Authorize
        </Button>
        <Button

          disabled={!data}
          onClick={() => {}}
        >
          Cancel
        </Button>
      </Box>
    </Scaffold>
  )
}

export default Authorize