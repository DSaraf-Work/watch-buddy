# Feature: User Insights & Analytics (v2)

## Overview
Personalized insights into viewing habits and basic recommendations.

## Requirements

### User Stories
- As a user, I want to see my viewing statistics
- As a user, I want to discover my favorite genres
- As a user, I want to see my most-watched platforms
- As a user, I want to get personalized recommendations
- As a user, I want to see my viewing trends over time

### Functional Requirements
1. **Viewing Statistics**
   - Total content watched (movies/series)
   - Total watch time
   - Average rating given
   - Most watched genres
   - Most used platforms
   - Viewing frequency (daily/weekly/monthly)

2. **Trends & Patterns**
   - Viewing activity over time (charts)
   - Genre preferences over time
   - Platform usage trends
   - Peak viewing times
   - Binge-watching patterns

3. **Recommendations**
   - Based on watch history
   - Based on ratings
   - Based on genres
   - Similar to content in watchlist
   - Trending content

4. **Insights Dashboard**
   - Visual charts and graphs
   - Key metrics cards
   - Comparison with previous periods
   - Achievements/milestones

### Database Schema
```sql
-- User preferences (computed from history)
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  favorite_genres JSONB,
  favorite_platforms JSONB,
  avg_rating DECIMAL(3,2),
  total_watched INTEGER DEFAULT 0,
  total_watch_time INTEGER DEFAULT 0, -- in minutes
  last_computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recommendations cache
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  score DECIMAL(5,4),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- Indexes
CREATE INDEX idx_user_preferences_user ON user_preferences(user_id);
CREATE INDEX idx_recommendations_user ON recommendations(user_id);
CREATE INDEX idx_recommendations_score ON recommendations(score DESC);

-- RLS Policies
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view own recommendations"
  ON recommendations FOR SELECT
  USING (user_id = auth.uid());
```

### API Routes
- `GET /api/insights/stats` - Get user statistics
- `GET /api/insights/trends` - Get viewing trends
- `GET /api/insights/genres` - Get genre breakdown
- `GET /api/insights/platforms` - Get platform usage
- `GET /api/recommendations` - Get personalized recommendations
- `POST /api/insights/compute` - Trigger insights computation

### UI Components
- InsightsDashboard
- StatsCard
- TrendChart
- GenreDistributionChart
- PlatformUsageChart
- RecommendationCarousel
- TimelineChart
- AchievementBadge

### Routes
- `/insights` - Insights dashboard
- `/recommendations` - Recommendations page

## Acceptance Criteria
- ✅ Statistics are accurate and up-to-date
- ✅ Charts display correctly
- ✅ Recommendations are relevant
- ✅ Insights update when history changes
- ✅ Performance is acceptable (< 2s load time)
- ✅ Mobile-responsive design

## Success Metrics
- Insights page engagement > 40%
- Recommendation click-through rate > 15%
- User satisfaction with recommendations > 70%

## Implementation Notes
- Compute insights asynchronously
- Cache recommendations for 24 hours
- Use background jobs for heavy computations
- Consider using Chart.js or Recharts for visualizations

