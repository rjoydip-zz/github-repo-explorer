const FilePreview = ({
  filename,
  content,
}: {
  filename: string
  content: string
}) => {
  return (
    <div className="inline-block min-w-full shadow-sm rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-100 border-b border-gray-200 py-2 px-4 flex justify-between">
        <div className="flex items-center">
          <span className="font-medium">{filename}</span>
        </div>
      </div>
      <div className="min-w-full table-fixed">{content}</div>
    </div>
  )
}

export default FilePreview
