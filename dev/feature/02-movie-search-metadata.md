# Feature: Movie/Series Search & Metadata

## Overview
Search functionality for movies and series with detailed metadata display.

## Requirements

### User Stories
- As a user, I want to search for movies and series by title
- As a user, I want to see detailed information about a movie/series
- As a user, I want to know which OTT platforms have the content
- As a user, I want to see cast, genre, synopsis, ratings, and release date

### Functional Requirements
1. **Search**
   - Real-time search with debouncing
   - Search by title
   - Filter by type (movie/series)
   - Filter by genre
   - Filter by OTT platform
   - Sort by relevance, rating, release date

2. **Metadata Display**
   - Title, year, runtime
   - Poster and backdrop images
   - Synopsis/overview
   - Cast and crew
   - Genres
   - IMDb/TMDB ratings
   - Available OTT platforms
   - Trailer links
   - Similar content recommendations

3. **External API Integration**
   - TMDB API for movie/series data
   - OTT availability API (JustWatch or similar)
   - Fallback to OMDB API

### Database Schema
```sql
-- Movies/Series cache table
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id INTEGER UNIQUE NOT NULL,
  imdb_id TEXT,
  title TEXT NOT NULL,
  original_title TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('movie', 'series')),
  overview TEXT,
  poster_path TEXT,
  backdrop_path TEXT,
  release_date DATE,
  runtime INTEGER,
  genres JSONB,
  cast JSONB,
  crew JSONB,
  ratings JSONB,
  trailer_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OTT platforms
CREATE TABLE ott_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content availability on OTT platforms
CREATE TABLE content_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  platform_id UUID REFERENCES ott_platforms(id) ON DELETE CASCADE,
  available_from DATE,
  available_until DATE,
  content_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_id, platform_id)
);

-- Indexes
CREATE INDEX idx_content_title ON content(title);
CREATE INDEX idx_content_tmdb_id ON content(tmdb_id);
CREATE INDEX idx_content_type ON content(content_type);
CREATE INDEX idx_content_availability_content ON content_availability(content_id);
CREATE INDEX idx_content_availability_platform ON content_availability(platform_id);
```

### API Routes
- `GET /api/search?q={query}&type={type}&genre={genre}` - Search content
- `GET /api/content/{id}` - Get content details
- `GET /api/content/{id}/availability` - Get OTT availability
- `GET /api/platforms` - Get all OTT platforms

### UI Components
- SearchBar
- SearchFilters
- SearchResults
- ContentCard
- ContentDetailModal
- PlatformBadge
- CastList
- GenreList
- RatingDisplay

### Routes
- `/search` - Search page
- `/content/{id}` - Content detail page

## Acceptance Criteria
- ✅ Users can search for movies and series
- ✅ Search results display within 500ms
- ✅ Content details show all metadata
- ✅ OTT platform availability is accurate
- ✅ Images load properly with fallbacks
- ✅ Filters work correctly
- ✅ Pagination works for large result sets
- ✅ Cache reduces API calls

## Success Metrics
- Search response time < 500ms
- API cache hit rate > 70%
- Content detail page load time < 1s

