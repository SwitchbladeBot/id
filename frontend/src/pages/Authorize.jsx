import React, { useEffect, useState } from 'react'
import Scaffold from '../components/Scaffold'
import { Box, Centered, CenterText, RectangularSkeleton, SmallCenterText } from '../common'
import Avatar from '../components/Avatar'
import Button from '../components/Button'
import styled from 'styled-components'
import axios from 'axios'

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
    axios.get('/api/authorize' + window.location.search)
      .then(r => r.data)
      .then(r => {
        if (r.location) return window.location.href = r.location
        setData(r)
      })
  }, [])

  function authorizeApplication (authorize) {
    axios.post('/api/authorize', { authorize }, { withCredentials: true }).then(r => r.data).then(r => {
      window.location.href = r.location
    })
  }

  return (
    <Scaffold>
      <Box mt={24 * 3} mb={24 * 3}>
        <Centered column>
          <Box mb={24}>
            <Avatars>
              <Avatar
                src={data ? `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.jpeg` : null}
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
              ? <SmallCenterText>
                  Logged in as <b>{data.user.username}#{data.user.discriminator}</b>. <a href="/login">Not you?</a>
                </SmallCenterText>
              : <RectangularSkeleton width={270} height={18}/>
          }
          <br/>
          {
            data
              ? <CenterText>
                  <b>{data.application.name}</b>
                  <br/>
                  wants to access your account
                </CenterText>
              : <RectangularSkeleton width={270} height={18}/>
          }
        </Centered>
      </Box>
      <Box pb={16} fullWidth>
        <Button
          filled
          disabled={!data}
          onClick={() => authorizeApplication(true)}
        >
          Authorize
        </Button>
        <Button
          disabled={!data}
          onClick={() => authorizeApplication(false)}
        >
          Cancel
        </Button>
      </Box>
    </Scaffold>
  )
}

export default Authorize