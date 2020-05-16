import React, { useEffect } from 'react'
import dynamic from 'next/dynamic'
import Layout from '../components/Layout'

const FileExplorer = dynamic(() => import('../components/FileExplorer'), {
  ssr: false,
})

const IndexPage = ({}) => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .register('/sw.js')
          .then((_) => {
            console.log('service worker registration successful')
          })
          .catch((err) => {
            console.warn('service worker registration failed', err.message)
          })
      }
    }
  }, [])

  return (
    <Layout>
      <FileExplorer username={'denoland'} repo={'deno'} />
    </Layout>
  )
}

export default IndexPage
