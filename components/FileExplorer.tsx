import { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import ReactMarkdown from 'react-markdown'
import ContentLoader, { List } from 'react-content-loader'
import { FiFolder, FiFileText, FiSearch } from 'react-icons/fi'
import Highlight, { defaultProps } from 'prism-react-renderer'
import theme from 'prism-react-renderer/themes/github'

const BLANK_ARRAY_LENGTH = 12

export interface FileInfo {
  size: number | string
  name: string
  type: string
  url: string | null
  ext: any
}

interface FileProps {
  filename: string
  ext: string
  content: string
}

const sizeFn = (bytes: number) => {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  if (bytes == 0) return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return (bytes / Math.pow(1024, i)).toFixed(0) + ' ' + sizes[i]
}

const Pre = styled.pre`
  text-align: left;
  padding: 0.5em;
  overflow: hidden;
`

const Line = styled.div`
  display: table-row;
`

const LineNo = styled.span`
  display: table-cell;
  text-align: right;
  padding-right: 1em;
  user-select: none;
  opacity: 0.5;
`

const CodeBlock = ({
  code,
  language,
}: {
  code: string
  className?: string
  language: any
}) => {
  return (
    <Highlight {...defaultProps} theme={theme} code={code} language={language}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <Pre className={className} style={style}>
          {tokens.map((line, i) => (
            <Line key={i} {...getLineProps({ line, key: i })}>
              <LineNo>{i + 1}</LineNo>
              <span className="table-cell">
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token, key })} />
                ))}
              </span>
            </Line>
          ))}
        </Pre>
      )}
    </Highlight>
  )
}

const FileExplorer = ({
  username,
  repo,
  enableSearch = true,
}: {
  username: string
  repo: string
  enableSearch?: boolean
}) => {
  const inputRef = useRef<HTMLInputElement>()
  const [error, setError] = useState()
  const [contents, setContents] = useState<any>([])
  const [loadingList, setLoadingList] = useState(false)
  const [path, setPath] = useState('root')
  const [repoInfo, setRepoInfo] = useState({
    username,
    repo,
  })
  const [fileInfo, setFileInfo] = useState<FileProps>({
    filename: '',
    ext: 'loading',
    content: null,
  })
  const baseURL = `https://api.github.com/repos/${repoInfo.username}/${repoInfo.repo}/contents`

  const fetchAPI = async (path: string | null = null) => {
    setLoadingList(true)
    try {
      const data = await (
        await fetch(`${baseURL}/${path ? path.replace('root', '') : ''}`)
      ).json()
      if (data.message === 'Not Found') {
        setContents([])
      } else {
        setContents([...data])
      }
      setLoadingList(false)
      path && setPath(path)
    } catch (error) {
      console.log(error)
      setContents([])
      setLoadingList(false)
      setError(error)
    }
  }

  const onClick = async (item: FileInfo) => {
    if (item.type === 'file') {
      setFileInfo({ filename: 'Loading ...', content: '', ext: 'loading' })
      const content = await (await fetch(item.url)).text()
      setFileInfo({ filename: item.name, content, ext: item.ext })
    } else {
      // clear previous selected file
      fetchAPI(path === '' ? item.name : `${path}/${item.name}`)
    }
  }

  const fc: FileInfo[] = Object.values(contents).map((content: any) => ({
    name: content.name,
    size: sizeFn(content.size),
    type: content.type,
    url: content.download_url,
    ext: /(?:\.([^.]+))?$/.exec(content.name)[1],
  }))

  const files: FileInfo[] = [
    ...fc.filter((content: FileInfo) => content.type === 'dir'),
    ...fc.filter((content: FileInfo) => content.type === 'file'),
  ]

  useEffect(() => {
    fetchAPI()
  }, [repoInfo])

  useEffect(() => {
    const fetchReadme = async (files) => {
      const readmeFile = files
        .filter(
          (file) =>
            file.type === 'file' && file.name.toLowerCase() === 'readme.md'
        )
        .pop()
      if (readmeFile) {
        const content = await (await fetch(readmeFile.url)).text()
        setFileInfo({ filename: readmeFile.name, content, ext: readmeFile.ext })
      }
    }
    fetchReadme(files)
  }, [files.length])

  return (
    <div className="max-w-screen-lg mx-auto px-4 sm:px-6 md:px-8 py-2 pb-8">
      <div className="flex flex-col pt-2">
        <div className="-my-2 py-2 overflow-x-auto sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="inline-block min-w-full shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            {enableSearch ? (
              <div className="flex flex-row sm:flex-col justify-between">
                <label htmlFor="search"></label>
                <input
                  id="search"
                  ref={inputRef}
                  name="search"
                  value=""
                  type="search"
                  style={{ outline: 'none' }}
                  className="w-full outline-none py-2 px-4 text-gray-700 focus:outline-none"
                  placeholder="username/repo"
                />
                <button
                  type="submit"
                  className="px-2"
                  aria-label="search"
                  onClick={() => {
                    const value = inputRef.current.value
                    if (value !== '' && value.indexOf('/') > -1) {
                      const val = value.split('/')
                      setRepoInfo({
                        username: val[0],
                        repo: val[1],
                      })
                    }
                  }}
                >
                  <FiSearch />
                </button>
              </div>
            ) : null}
            {error ? (
              <div className="bg-gray-100 border-b border-gray-200 py-2 px-2 flex justify-center">
                {JSON.stringify(ErrorEvent)}
              </div>
            ) : contents.length === 0 && !loadingList ? (
              <div className="bg-gray-100 border-b border-gray-200 py-2 px-2 flex justify-center">
                No repo found
              </div>
            ) : (
              <div>
                <div className="bg-gray-100 border-b border-gray-200 py-2 px-2 flex justify-between">
                  <div className="flex items-center">
                    <span className="font-medium">
                      <nav className="text-black" aria-label="Breadcrumb">
                        <ol className="list-none inline-flex">
                          {path.split('/').map((ele: string, key: number) => (
                            <li className="flex items-center">
                              <a
                                href="#"
                                role="button"
                                className="text-blue-500"
                                onClick={() =>
                                  fetchAPI(
                                    path.slice(
                                      0,
                                      path.indexOf(ele) + ele.length
                                    )
                                  )
                                }
                              >
                                {ele}
                              </a>
                              <svg
                                className="fill-current mt-1 px-1 w-4 h-4"
                                viewBox="0 0 320 512"
                              >
                                {key !== path.split('/').length - 1 ? (
                                  <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z" />
                                ) : null}
                              </svg>
                            </li>
                          ))}
                        </ol>
                      </nav>
                    </span>
                  </div>
                </div>
                <table className="min-w-full table-fixed">
                  <tbody className="bg-white">
                    {loadingList
                      ? [...Array(BLANK_ARRAY_LENGTH).keys()].map((key) => (
                          <tr
                            className="table-row hover:bg-gray-100 cursor-pointer border-b border-gray-200"
                          >
                            <td className="px-2 sm:pl-3 md:pl-4 whitespace-no-wrap text-sm leading-5 text-gray-600 w-6">
                              <svg
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                className="w-5 h-5"
                              >
                                {(() => {
                                  switch (key) {
                                    case BLANK_ARRAY_LENGTH - 1:
                                    case BLANK_ARRAY_LENGTH - 2:
                                    case BLANK_ARRAY_LENGTH - 3:
                                      return <FiFileText />
                                    default:
                                      return <FiFolder />
                                  }
                                })()}
                              </svg>
                            </td>
                            <td>
                              <ContentLoader viewBox="0 0 380 20">
                                <rect
                                  x="0"
                                  y="1"
                                  rx="4"
                                  ry="4"
                                  width={(window.innerHeight * 2) / 4 + 50}
                                  height="15"
                                />
                              </ContentLoader>
                            </td>
                          </tr>
                        ))
                      : files.map((file: FileInfo, key: number) => (
                          <tr
                            role="button"
                            className="table-row hover:bg-gray-100 cursor-pointer border-b border-gray-200"
                            onClick={() => onClick(file)}
                          >
                            <td className="px-2 sm:pl-3 md:pl-4 py-1 whitespace-no-wrap text-sm leading-5 text-gray-600 w-6">
                              <svg
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                className="w-5 h-5"
                              >
                                {file.type === 'dir' ? (
                                  <FiFolder />
                                ) : (
                                  <FiFileText />
                                )}
                              </svg>
                            </td>
                            <td className="px-2 py-1 whitespace-no-wrap text-sm text-blue-500 leading-5 font-medium">
                              {file.name}
                            </td>
                            <td className="px-4 py-1 whitespace-no-wrap text-sm leading-5 text-gray-500 text-right">
                              {file.size}
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
                <div>
                  <div className="bg-gray-100 border-b border-gray-200 py-2 px-4 flex justify-between">
                    <div className="flex items-center">
                      <span className="font-medium">
                        {fileInfo.filename || ''}
                      </span>
                    </div>
                  </div>
                  <div className="min-w-full table-fixed px-2">
                    {((fileInfo) => {
                      switch (fileInfo.ext) {
                        case 'loading':
                          return <List />
                        case 'md':
                          return (
                            <ReactMarkdown
                              source={fileInfo.content}
                              escapeHtml={false}
                              renderers={{
                                inlineCode: (props: {
                                  children: React.ReactNode
                                }) => (
                                  <code className="py-0.5 px-1 font-mono rounded-sm bg-gray-100 deno-inlinecode">
                                    {props.children}
                                  </code>
                                ),
                                link: (props) => {
                                  return (
                                    <a
                                      href={props.href}
                                      target="_blank"
                                      className="text-blue-500 hover:text-blue-500"
                                    >
                                      {props.children}
                                    </a>
                                  )
                                },
                              }}
                            />
                          )
                        default:
                          return (
                            <CodeBlock
                              code={fileInfo.content}
                              language={fileInfo.ext}
                            />
                          )
                      }
                    })(fileInfo)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FileExplorer
