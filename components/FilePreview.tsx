import { useEffect, useState } from 'react'

function useFetchContents(
  url: string
): {
  content: string
  loading: boolean
  error: Error
} {
  const [content, setContent] = useState<any>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState()

  if (!url) return { content, loading, error }

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const data = await (await fetch(url)).text()
        setLoading(false)
        setContent([...data])
      } catch (error) {
        setContent('')
        setLoading(false)
        setError(error)
      }
    })()
  }, [url])

  return {
    content,
    loading,
    error,
  }
}

const FilePreview = ({ filename, url }: { filename: string; url: string }) => {
  const { content, loading } = useFetchContents(url)
  return (
    <>
      {loading ? (
        <div>Loading ...</div>
      ) : (
        <div className="inline-block min-w-full shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-100 border-b border-gray-200 py-2 px-4 flex justify-between">
            <div className="flex items-center">
              <span className="font-medium">{filename}</span>
            </div>
          </div>
          <div className="min-w-full table-fixed">{content}</div>
        </div>
      )}
    </>
  )
}

export default FilePreview
