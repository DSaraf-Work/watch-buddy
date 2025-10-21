'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SearchBar } from './SearchBar'
import { SearchFilters } from './SearchFilters'
import { ContentGrid } from './ContentGrid'
import { Pagination } from './Pagination'

interface SearchResult {
  id: number
  tmdb_id: number
  title: string
  original_title: string
  content_type: 'movie' | 'series'
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  genre_ids: number[]
}

interface SearchResponse {
  results: SearchResult[]
  page: number
  total_pages: number
  total_results: number
}

export function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [type, setType] = useState<'all' | 'movie' | 'series'>(
    (searchParams.get('type') as 'all' | 'movie' | 'series') || 'all'
  )
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'))
  const [results, setResults] = useState<SearchResult[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounced search
  const performSearch = useCallback(async (searchQuery: string, searchType: string, searchPage: number) => {
    if (!searchQuery.trim()) {
      setResults([])
      setTotalPages(0)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        page: searchPage.toString(),
      })

      if (searchType !== 'all') {
        params.append('type', searchType)
      }

      const response = await fetch(`/api/search?${params}`)
      
      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data: SearchResponse = await response.json()
      setResults(data.results)
      setTotalPages(data.total_pages)
    } catch (err) {
      setError('Failed to search. Please try again.')
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Update URL when search params change
  useEffect(() => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (type !== 'all') params.set('type', type)
    if (page > 1) params.set('page', page.toString())

    const newUrl = params.toString() ? `/search?${params}` : '/search'
    router.push(newUrl, { scroll: false })
  }, [query, type, page, router])

  // Perform search when params change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query, type, page)
    }, 300) // Debounce 300ms

    return () => clearTimeout(timeoutId)
  }, [query, type, page, performSearch])

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery)
    setPage(1) // Reset to first page on new search
  }

  const handleTypeChange = (newType: 'all' | 'movie' | 'series') => {
    setType(newType)
    setPage(1) // Reset to first page on filter change
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <SearchBar 
        value={query} 
        onChange={handleSearch}
        placeholder="Search for movies and TV series..."
      />

      {/* Filters */}
      <SearchFilters 
        selectedType={type}
        onTypeChange={handleTypeChange}
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Searching...</p>
        </div>
      ) : results.length > 0 ? (
        <>
          <div className="text-sm text-gray-600">
            Found {results.length} results
          </div>
          <ContentGrid results={results} />
          {totalPages > 1 && (
            <Pagination 
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      ) : query ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No results found for "{query}"</p>
          <p className="text-sm text-gray-500 mt-2">Try different keywords or filters</p>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">Start searching for movies and TV series</p>
        </div>
      )}
    </div>
  )
}

