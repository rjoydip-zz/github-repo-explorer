import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Layout } from '../components'
import { promisify } from 'util'
import { readdir, stat } from 'fs'
import { join, resolve, extname } from 'path'
import { FileInfo } from '../utils'

const $stat = promisify(stat)
const $readdir = promisify(readdir)

const FileList = dynamic(() => import('../components/FileList'))
const FilePreview = dynamic(() => import('../components/FilePreview'))

const sizeFn = (bytes: number) => {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  if (bytes == 0) return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return (bytes / Math.pow(1024, i)).toFixed(0) + ' ' + sizes[i]
}

export default ({ fileInfo }: { fileInfo: FileInfo[] }) => {
  const [file, setFile] = useState<{ filename: string; content: string }>(
    {
      filename: '',
      content: '',
    }
  )
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

  const onFileSelect = async (fileInfo: FileInfo) => {
    console.log(fileInfo)
    setFile({
      filename: fileInfo.filename,
      content: fileInfo.file,
    })
  }

  return (
    <Layout>
      <div className="flex flex-col pt-2">
        <div className="-my-2 py-2 overflow-x-auto sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <FileList fileInfo={fileInfo} onFileSelect={onFileSelect} />
          <FilePreview filename={file.filename} content={file.content} />
        </div>
      </div>
    </Layout>
  )
}

export async function getStaticProps() {
  const dir = join(resolve(process.cwd()))
  const fileInfo = await Promise.resolve(
    Promise.all([
      ...[...(await $readdir(dir))].map(async (filename) => {
        const file = join(dir, filename)
        const stat = await $stat(file)
        const ext = extname(file).toLowerCase()
        const filetype = stat.isFile() ? 'file' : 'directory'
        const size = sizeFn(stat.size)
        return {
          ext,
          filename,
          size,
          file,
          filetype,
        }
      }),
    ])
  )

  return {
    props: {
      fileInfo: [
        ...fileInfo.filter((a: FileInfo) => a.filetype === 'directory'),
        ...fileInfo.filter((a: FileInfo) => a.filetype === 'file'),
      ],
    },
  }
}
