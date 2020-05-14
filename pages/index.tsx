import React, { useEffect } from 'react'
import { FiFolder, FiFileText } from "react-icons/fi";
import { Layout } from '../components'
import { promisify } from 'util'
import { readdir, stat } from 'fs'
import { join, resolve, extname } from 'path'

const $stat = promisify(stat)
const $readdir = promisify(readdir)

const sizeFn = (bytes: number) => {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  if (bytes == 0) return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return (bytes / Math.pow(1024, i)).toFixed(0) + ' ' + sizes[i]
}

interface fileInfo {
  ext: string
  filename: string
  size: string
  filetype: string
}

export default ({ fileInfo }: { fileInfo: fileInfo[] }) => {
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
      <div className="w-screen mx-auto px-4 sm:px-6 md:px-8 py-2 pb-8">
        <div className="flex flex-col pt-4">
          <div className="-my-2 py-2 overflow-x-auto sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="inline-block min-w-full shadow-sm rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-100 border-b border-gray-200 py-2 px-4 flex justify-between">
                <div className="flex items-center">
                  <span className="font-medium">{'/'}</span>
                </div>
              </div>
              <table className="min-w-full table-fixed">
                <tbody className="bg-white">
                  {fileInfo.map((item: fileInfo, key: number | undefined) => (
                    <tr
                      tabIndex={key}
                      role="button"
                      className="table-row hover:bg-gray-100 cursor-pointer border-b border-gray-200"
                    >
                      <td className="px-2 sm:pl-3 md:pl-4 py-1 whitespace-no-wrap text-sm leading-5 text-gray-600 w-6">
                        <svg
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          className="w-5 h-5"
                        >
                          {item.filetype === 'directory' ? (
                            <FiFolder />
                          ) : (
                            <FiFileText />
                          )}
                        </svg>
                      </td>
                      <td className="px-2 py-1 whitespace-no-wrap text-sm text-blue-500 leading-5 font-medium">
                        {item.filename}
                      </td>
                      <td className="px-4 py-1 whitespace-no-wrap text-sm leading-5 text-gray-500 text-right">
                        {item.size}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
        const path = join(dir, filename)
        const stat = await $stat(path)
        const ext = extname(path).toLowerCase()
        const filetype = stat.isFile() ? 'file' : 'directory'
        const size = sizeFn(stat.size)
        return {
          ext,
          filename,
          size,
          filetype,
        }
      }),
    ])
  )

  return {
    props: {
      fileInfo: [
        ...fileInfo.filter((a: fileInfo) => a.filetype === 'directory'),
        ...fileInfo.filter((a: fileInfo) => a.filetype === 'file'),
      ],
    },
  }
}
