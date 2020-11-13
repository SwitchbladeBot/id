import React, { useEffect, useState } from 'react'
import Scaffold from '../components/Scaffold'
import {
  AlmostSmallCenterText,
  BigText,
  Box,
  Centered,
  CenterText,
  RectangularSkeleton,
  SmallCenterText
} from '../common'
import Avatar from '../components/Avatar'
import Button from '../components/Button'
import styled from 'styled-components'
import axios from 'axios'
import { BLURPLE, SECONDARY_COLOR } from '../Constants'
import ScopeItem from '../components/ScopeItem'
import HandShakeEmoji from '../assets/handshake.png'
import Error from '../components/Error'
import { useTranslation } from 'react-i18next'
import { availableLocales } from '../locales'

const Avatars = styled.div`
  display: flex;
  justify-content: space-around;
  position: relative;
`

const Dots = styled.div`
  margin: 0 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: width .4s;
`

const Dot = styled.div`
  background-color: ${p => p.selected ? BLURPLE : SECONDARY_COLOR};
  opacity: .5;
  margin: 0 4px;
  width: 8px;
  height: 3px;
  border-radius: 4px;
  transition: background-color .3s;
  
  &:hover {
    background-color: ${BLURPLE};
    cursor: pointer;
  }
`

const HandShakeImage = styled.img`
  width: 52px;
  animation: .75s ease-in-out 0s 1 handshakeIn;
  
  &.animate {
    animation: .65s ease-in-out 0s 1 handshakeAccept forwards;
  }
`

const ScopesSection = styled.div`
  padding: 16px 25px 16px;
`

const ScopeText = styled.span`
  text-transform: uppercase;
  font-size: 14px;
  font-weight: 700;
  color: ${SECONDARY_COLOR};
`

const Authorize = () => {
  const {t, i18n} = useTranslation()

  const [data, setData] = useState(null)
  const [selected, setSelected] = useState([])
  const [animate, setAnimate] = useState(false)
  const [error, setError] = useState(null)

  const handleDotClick = id => () => {
    setSelected([...selected, id])
  }

  useEffect(() => {
    axios.get('/api/authorize' + window.location.search)
      .then(r => r.data)
      .then(r => {
        if (r.location) return window.location.href = r.location
        if (r.error) return setError(r.error)

        if (r.user && r.user.locale) {
          const [l] = r.user.locale.split('-')
          if (availableLocales.includes(l)) {
            i18n.changeLanguage(l)
          }
        }
        setData(r)
      })
  }, [])

  function authorizeApplication (authorize) {
    setAnimate(true)
    setTimeout(() => {
      axios.post('/api/authorize' + window.location.search, { authorize }, { withCredentials: true }).then(r => r.data).then(r => {
        if (r.location) return window.location.href = r.location
        if (r.error) return alert(r.error)
      })
    }, 500)
  }

  const extension = data?.user?.avatar.startsWith('a_') ? 'gif' : 'jpeg'

  const scopes = new URLSearchParams(window.location.search)
    .get('scope')
    .split(' ')
    .map(s => t(`scopes.${s}`))

  return (
    <Scaffold>
      <Box mt={24 * 3} mb={24 * 3}>
        {
          error
            ? <Error>
              {error}
            </Error>
            : <>
              <Centered column>

                <Box mb={24}>
                  <Avatars>
                    <Avatar
                      src={data ? `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.${extension}` : null}
                    />
                    <Dots>
                      {
                        selected.length === 4
                          ? <HandShakeImage
                            className={animate ? 'animate' : ''}
                            src={HandShakeEmoji}
                            alt="Handshake emoji"
                          />
                          : [
                            <Dot selected={selected.includes(0)} onClick={handleDotClick(0)}/>,
                            <Dot selected={selected.includes(1)} onClick={handleDotClick(1)}/>,
                            <Dot selected={selected.includes(2)} onClick={handleDotClick(2)}/>,
                            <Dot selected={selected.includes(3)} onClick={handleDotClick(3)}/>
                          ]
                      }
                    </Dots>
                    <Avatar
                      src={data ? data.application.image : null}
                      verified={data ? data.application.verified : false}
                    />
                  </Avatars>
                </Box>

                {
                  data && false
                    ? <SmallCenterText style={{ color: SECONDARY_COLOR }}>
                      Logged in as <b>{data.user.username}#{data.user.discriminator}</b>. <a href="/login">Not you?</a>
                    </SmallCenterText>
                    : null
                }

                {
                  data
                    ? <CenterText>
                      <BigText>
                        <b>{data.application.name}</b>
                      </BigText>
                      <br/>
                      <AlmostSmallCenterText style={{
                        position: 'relative',
                        top: -10
                      }}>
                        { t('authorize.access') }
                      </AlmostSmallCenterText>
                    </CenterText>
                    : [
                      <RectangularSkeleton width={110} height={22} style={{ marginBottom: 12 }}/>,
                      <RectangularSkeleton width={220} height={14} style={{ marginBottom: 50 }}/>
                    ]
                }

              </Centered>


              {
                data
                  ? <ScopesSection>
                    <ScopeText>
                      { t('authorize.scopesTitle', { name: data.application.name }) }
                    </ScopeText>
                    {
                      scopes.map(scope => <ScopeItem>{scope}</ScopeItem>)
                    }
                  </ScopesSection>
                  : <div style={{ padding: '0 25px 0' }}>
                    <RectangularSkeleton width={190} height={14} style={{ marginBottom: 12 }}/>
                    <RectangularSkeleton width={280} height={20}/>
                  </div>
              }


            </>
        }
      </Box>
      <Box pb={16} fullWidth>
        {
          !error
            ? <Button
              filled
              disabled={!data}
              onClick={() => authorizeApplication(true)}
            >
              { t('authorize.authorize') }
            </Button>
            : null
        }
        {
          error
          ? <Button
              onClick={() => alert('redireciona pra algum lugar')}
            >
              { t('error.button') }
            </Button>
            : <Button
              disabled={!data}
              onClick={() => authorizeApplication(false)}
            >
              { t('authorize.cancel') }
            </Button>
        }
      </Box>
    </Scaffold>
  )
}

export default Authorize