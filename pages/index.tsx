import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Layout } from '../components'
import { FileInfo } from '../utils'
import { useGithubRepoContents } from '../hooks'

const FileList = dynamic(() => import('../components/FileList'))
const FilePreview = dynamic(() => import('../components/FilePreview'))

const sizeFn = (bytes: number) => {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  if (bytes == 0) return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return (bytes / Math.pow(1024, i)).toFixed(0) + ' ' + sizes[i]
}

export default ({}) => {
  const { contents, loading }: any = useGithubRepoContents(
    'rjoydip',
    'file-explorer-previewer'
  )
  const [file, setFile] = useState<{ name: string; url: string }>({
    name: '',
    url: '',
  })
  const fc = Object.values(contents).map((content: any) => ({
    name: content.name,
    size: sizeFn(content.size),
    type: content.type,
    url: content.download_url,
  }))
  const fileInfo = [
    ...fc.filter((content: any) => content.type === 'dir'),
    ...fc.filter((content: any) => content.type === 'file'),
  ]
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

  const onFileSelect = async (fileInfo: FileInfo) =>
    setFile({
      name: fileInfo.name,
      url: fileInfo.url,
    })

  return (
    <Layout>
      <div className="flex flex-col pt-2">
        <div className="-my-2 py-2 overflow-x-auto sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          {loading ? (
            <div>Loading ...</div>
          ) : (
            <>
              <FileList fileInfo={fileInfo} onFileSelect={onFileSelect} />
              <FilePreview filename={file.name} url={file.url} />
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
