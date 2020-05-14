import { useEffect } from 'react'
import { FiFolder, FiFileText } from 'react-icons/fi'
import { FileInfo } from '../utils'

const FileList = ({
  fileInfo,
  onFileSelect,
}: {
  fileInfo: any[]
  onFileSelect?: (args: any) => void
}) => {
  useEffect(() => {
    const isReadme = fileInfo.filter(
      (item) => item.name === 'Readme.md' && item.type === 'file'
    )
    if (isReadme.length) onFileSelect && onFileSelect(isReadme[0])
  }, [])
  return (
    <div className="inline-block min-w-full shadow-sm rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-100 border-b border-gray-200 py-2 px-4 flex justify-between">
        <div className="flex items-center">
          <span className="font-medium">{'/'}</span>
        </div>
      </div>
      <table className="min-w-full table-fixed">
        <tbody className="bg-white">
          {fileInfo.map((item: FileInfo, key: number) => (
            <tr
              tabIndex={key}
              role="button"
              className="table-row hover:bg-gray-100 cursor-pointer border-b border-gray-200"
              onClick={() =>
                item.type === 'file' && onFileSelect && onFileSelect(item)
              }
            >
              <td className="px-2 sm:pl-3 md:pl-4 py-1 whitespace-no-wrap text-sm leading-5 text-gray-600 w-6">
                <svg
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  className="w-5 h-5"
                >
                  {item.type === 'dir' ? (
                    <FiFolder />
                  ) : (
                    <FiFileText />
                  )}
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
    </div>
  )
}

export default FileList
