import { useEffect, useState } from 'react'

import { IReposResponse } from '../@types/repos'

function useGithubRepoContents(
  username: string,
  repo: string
): {
  contents: IReposResponse
  loading: boolean
  error: Error
} {
  const [contents, setContents] = useState<any>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState()

  if (!username) return { contents, loading, error }

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const data = await (
          await fetch(
            `https://api.github.com/repos/${username}/${repo}/contents`
          )
        ).json()
        setLoading(false)
        setContents([...data])
      } catch (error) {
        setContents([])
        setLoading(false)
        setError(error)
      }
    })()
  }, [username])

  return {
    contents,
    loading,
    error,
  }
}

export { useGithubRepoContents }
export default useGithubRepoContents
