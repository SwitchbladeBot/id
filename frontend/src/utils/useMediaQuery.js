import { useLayoutEffect, useState } from 'react'

const useMediaQuery = (query) => {
  const [matched, setMatched] = useState(false)

  useLayoutEffect(() => {
    const updateMatch = () => {
      setMatched(window.matchMedia(query).matches)
    }

    window.addEventListener('resize', updateMatch)

    updateMatch()

    return () => window.removeEventListener('resize', updateMatch)
  }, [])

  return matched
}

export default useMediaQuery