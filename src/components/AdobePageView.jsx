import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackAdobe } from '../lib/adobeDataLayer'

export default function AdobePageView() {
  const location = useLocation()

  useEffect(() => {
    const pageName = document.title
    trackAdobe('page_view', {
      web: {
        webPageDetails: {
          URL: window.location.href,
          pageName,
          pageViews: { value: 1 }
        }
      }
    })
  }, [location.pathname, location.search])

  return null
}
