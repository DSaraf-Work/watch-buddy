# Feature: Watch History Tracking

## Overview
Track and display user's watch history across all OTT platforms.

## Requirements

### User Stories
- As a user, I want to manually add content I've watched
- As a user, I want to see my complete watch history
- As a user, I want to filter my history by platform, date, genre
- As a user, I want to rate content I've watched
- As a user, I want to import watch history from OTT platforms (future: via extension)

### Functional Requirements
1. **Manual Entry**
   - Add watched content manually
   - Specify watch date
   - Add rating (1-5 stars)
   - Add review/notes
   - Mark as rewatched

2. **History Display**
   - View all watched content
   - Sort by watch date, rating, title
   - Filter by platform, genre, content type, date range
   - Search within history
   - Statistics (total watched, by platform, by genre)

3. **Import (Future)**
   - Browser extension integration
   - CSV import
   - Automatic sync from OTT platforms

### Database Schema
```sql
-- Watch history
CREATE TABLE watch_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  platform_id UUID REFERENCES ott_platforms(id) ON DELETE SET NULL,
  watched_at TIMESTAMP WITH TIME ZONE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  is_rewatch BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Watch sessions (for series episodes)
CREATE TABLE watch_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  history_id UUID REFERENCES watch_history(id) ON DELETE CASCADE,
  season_number INTEGER,
  episode_number INTEGER,
  watched_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_watch_history_user ON watch_history(user_id);
CREATE INDEX idx_watch_history_content ON watch_history(content_id);
CREATE INDEX idx_watch_history_watched_at ON watch_history(watched_at DESC);
CREATE INDEX idx_watch_sessions_history ON watch_sessions(history_id);

-- RLS Policies
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own watch history"
  ON watch_history FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own watch history"
  ON watch_history FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own watch history"
  ON watch_history FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own watch history"
  ON watch_history FOR DELETE
  USING (user_id = auth.uid());
```

### API Routes
- `GET /api/history` - Get user's watch history
- `POST /api/history` - Add to watch history
- `PUT /api/history/{id}` - Update history entry
- `DELETE /api/history/{id}` - Delete history entry
- `GET /api/history/stats` - Get watch statistics
- `POST /api/history/import` - Import history (CSV/JSON)

### UI Components
- WatchHistoryList
- HistoryItemCard
- AddToHistoryButton
- HistoryFilters
- RatingInput
- ReviewModal
- HistoryStats
- ImportHistoryModal

### Routes
- `/history` - Watch history page
- `/history/stats` - Statistics page

## Acceptance Criteria
- ✅ Users can manually add watched content
- ✅ Users can rate and review watched content
- ✅ History displays correctly with all metadata
- ✅ Filters and sorting work properly
- ✅ Statistics are accurate
- ✅ Users can edit/delete history entries
- ✅ Rewatch tracking works
- ✅ RLS policies prevent unauthorized access

## Success Metrics
- Average history entries per user > 20
- Rating completion rate > 60%
- History accuracy (user satisfaction) > 90%

