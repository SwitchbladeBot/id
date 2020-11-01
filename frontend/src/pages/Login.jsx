import React, { useEffect, useState } from 'react'
import Scaffold from '../components/Scaffold'
import { Box, Centered, CenterText, RectangularSkeleton, SmallCenterText } from '../common'
import Avatar from '../components/Avatar'
import Button from '../components/Button'

import axios from 'axios'
import { useCookies } from 'react-cookie'

const Login = ({ history }) => {
  const [data, setData] = useState(null)
  const [ cookies, setCookie, removeCookie ] = useCookies([ 'session' ])

  useEffect(() => {
    removeCookie('session')
    axios.get('/api/login')
      .then(r => r.data)
      .then(r => setData(r))
  }, [])

  return (
    <Scaffold>
      <Box mt={24 * 2} mb={24 * 2}>
        <Centered column>
          <Box mb={24}>
            <Avatar
              src={data ? data.application.image : null}
              verified={data ? data.application.verified : false}
            />
          </Box>
          {
            data
              ? <CenterText>
                Login to authorize <b>{data.application.name}</b> to access Switchblade on your behalf.
              </CenterText>
              : <RectangularSkeleton width={210} height={18}/>
          }
        </Centered>
      </Box>
      <Box pb={16} fullWidth>
        <Button
          filled
          disabled={!data}
          onClick={() => window.location.href = data.login_url}
        >
          Login with Discord
        </Button>
      </Box>
    </Scaffold>
  )
}

export default Login