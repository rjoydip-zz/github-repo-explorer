import { useState, useEffect } from 'react'
import styled from 'styled-components'
import ReactMarkdown from 'react-markdown'
import Skeleton from 'react-loading-skeleton'
import { FiFolder, FiFileText } from 'react-icons/fi'
import Highlight, { defaultProps } from 'prism-react-renderer'
import theme from 'prism-react-renderer/themes/github'

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
  margin: 1em 0;
  padding: 0.5em;
  overflow: scroll;
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

const LineContent = styled.span`
  display: table-cell;
`

export const Loading = () => (
  <div className="pt-2">
    <Skeleton count={15} height={25} />
  </div>
)

const Markdown = ({ source }: { source: string }) => {
  return <ReactMarkdown source={source} escapeHtml={false} />
}

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
              <LineContent>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token, key })} />
                ))}
              </LineContent>
            </Line>
          ))}
        </Pre>
      )}
    </Highlight>
  )
}

const FileDisplay = ({
  code,
  language,
}: {
  code: string
  language: any
}) => {
  switch (language) {
    case 'md':
      return <Markdown source={code} />
    default:
      return <CodeBlock code={code} language={language} />
  }
}

const FileExplorer = ({
  username,
  repo,
}: {
  username: string
  repo: string
  onFileSelect?: (args: any) => void
}) => {
  const [, setError] = useState()
  const [contents, setContents] = useState<any>([])
  const [loading, setLoading] = useState(false)
  const [path, setPath] = useState('root')
  const [file, setFile] = useState<FileProps>({
    filename: '',
    ext: '',
    content: null,
  })
  const baseURL = `https://api.github.com/repos/${username}/${repo}/contents`

  const fetchAPI = async (path: string | null = null) => {
    setLoading(true)
    try {
      setContents([
        ...(await (
          await fetch(`${baseURL}/${path ? path.replace('root', '') : ''}`)
        ).json()),
      ])
      setLoading(false)
      path && setPath(path)
    } catch (error) {
      setContents([])
      setLoading(false)
      setError(error)
    }
  }

  const fetchReadme = async () => {
    const file = fileInfo
      .filter(
        (file) =>
          file.type === 'file' &&
          file.name == ('README.md' || 'Readme.md' || 'readme.md')
      )
      .pop()
    if (file) {
      const content = await (await fetch(file.url)).text()
      setFile({ filename: file.name, content, ext: file.ext })
    }
  }

  const fc: FileInfo[] = Object.values(contents).map((content: any) => ({
    name: content.name,
    size: sizeFn(content.size),
    type: content.type,
    url: content.download_url,
    ext: /(?:\.([^.]+))?$/.exec(content.name)[1],
  }))

  const fileInfo: FileInfo[] = [
    ...fc.filter((content: FileInfo) => content.type === 'dir'),
    ...fc.filter((content: FileInfo) => content.type === 'file'),
  ]

  useEffect(() => {
    fetchAPI()
  }, [])

  useEffect(() => {
    fetchReadme()
  }, [fileInfo.length])

  const onClick = async (item: FileInfo) => {
    if (item.type === 'file') {
      const content = await (await fetch(item.url)).text()
      setFile({ filename: item.name, content, ext: item.ext })
    } else {
      // clear previous selected file
      setFile({ filename: null, content: null, ext: null })
      fetchAPI(path === '' ? item.name : `${path}/${item.name}`)
    }
  }

  const onBreadcumClick = (path: string, ele: string) => {
    fetchAPI(path.slice(0, path.indexOf(ele) + ele.length))
  }

  return (
    <div className="max-w-screen-lg mx-auto px-4 sm:px-6 md:px-8 py-2 pb-8">
      <div className="flex flex-col pt-2">
        <div className="-my-2 py-2 overflow-x-auto sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="inline-block min-w-full shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-100 border-b border-gray-200 py-2 px-2 flex justify-between">
              <div className="flex items-center">
                <span className="font-medium">
                  {path.split('/').map((ele: string) => (
                    <span
                      role="button"
                      onClick={() => onBreadcumClick(path, ele)}
                    >
                      <b>/</b>
                      <a className="text-blue-500" href="#">
                        {ele}
                      </a>
                    </span>
                  ))}
                </span>
              </div>
            </div>
            {loading ? (
              <Loading />
            ) : (
              <table className="min-w-full table-fixed">
                <tbody className="bg-white">
                  {fileInfo.map((item: FileInfo, key: number) => (
                    <tr
                      tabIndex={key}
                      role="button"
                      className="table-row hover:bg-gray-100 cursor-pointer border-b border-gray-200"
                      onClick={() => onClick(item)}
                    >
                      <td className="px-2 sm:pl-3 md:pl-4 py-1 whitespace-no-wrap text-sm leading-5 text-gray-600 w-6">
                        <svg
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          className="w-5 h-5"
                        >
                          {item.type === 'dir' ? <FiFolder /> : <FiFileText />}
                        </svg>
                      </td>
                      <td className="px-2 py-1 whitespace-no-wrap text-sm text-blue-500 leading-5 font-medium">
                        {item.name}
                      </td>
                      <td className="px-4 py-1 whitespace-no-wrap text-sm leading-5 text-gray-500 text-right">
                        {item.size}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {file.content ? (
              <>
                <div className="bg-gray-100 border-b border-gray-200 py-2 px-4 flex justify-between">
                  <div className="flex items-center">
                    <span className="font-medium">{file.filename || ''}</span>
                  </div>
                </div>
                <div className="min-w-full table-fixed">
                  <FileDisplay language={file.ext} code={file.content} />
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FileExplorer
