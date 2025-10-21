# Feature: Watchlist Management

## Overview
Personal and shared watchlists for tracking content users want to watch.

## Requirements

### User Stories
- As a user, I want to add movies/series to my watchlist
- As a user, I want to remove items from my watchlist
- As a user, I want to see my complete watchlist
- As a user, I want to share my watchlist with other users
- As a user, I want to see items that multiple users have wishlisted
- As a user, I want to mark items as watched from my watchlist

### Functional Requirements
1. **Personal Watchlist**
   - Add content to watchlist
   - Remove content from watchlist
   - View all watchlist items
   - Sort by date added, title, release date
   - Filter by content type, genre, platform

2. **Shared Watchlists**
   - Create shared watchlist with other users
   - Invite users to shared watchlist
   - Accept/decline watchlist invitations
   - View shared watchlist items
   - See who added each item
   - Query items wishlisted by multiple users

3. **Watchlist Actions**
   - Mark as watched (moves to watch history)
   - Add notes/comments to items
   - Set priority (high/medium/low)
   - Get notifications when available on platforms

### Database Schema
```sql
-- Watchlists
CREATE TABLE watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_shared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Watchlist members (for shared watchlists)
CREATE TABLE watchlist_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  watchlist_id UUID REFERENCES watchlists(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(watchlist_id, user_id)
);

-- Watchlist items
CREATE TABLE watchlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  watchlist_id UUID REFERENCES watchlists(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  added_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
  notes TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(watchlist_id, content_id)
);

-- Indexes
CREATE INDEX idx_watchlists_owner ON watchlists(owner_id);
CREATE INDEX idx_watchlist_members_user ON watchlist_members(user_id);
CREATE INDEX idx_watchlist_items_watchlist ON watchlist_items(watchlist_id);
CREATE INDEX idx_watchlist_items_content ON watchlist_items(content_id);

-- RLS Policies
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist_items ENABLE ROW LEVEL SECURITY;

-- Users can view their own watchlists and shared watchlists they're members of
CREATE POLICY "Users can view accessible watchlists"
  ON watchlists FOR SELECT
  USING (
    owner_id = auth.uid() OR
    id IN (SELECT watchlist_id FROM watchlist_members WHERE user_id = auth.uid())
  );

-- Users can create their own watchlists
CREATE POLICY "Users can create watchlists"
  ON watchlists FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Users can update their own watchlists
CREATE POLICY "Users can update own watchlists"
  ON watchlists FOR UPDATE
  USING (owner_id = auth.uid());

-- Similar policies for watchlist_members and watchlist_items
```

### API Routes
- `GET /api/watchlists` - Get user's watchlists
- `POST /api/watchlists` - Create watchlist
- `GET /api/watchlists/{id}` - Get watchlist details
- `PUT /api/watchlists/{id}` - Update watchlist
- `DELETE /api/watchlists/{id}` - Delete watchlist
- `POST /api/watchlists/{id}/items` - Add item to watchlist
- `DELETE /api/watchlists/{id}/items/{itemId}` - Remove item
- `POST /api/watchlists/{id}/members` - Add member
- `DELETE /api/watchlists/{id}/members/{userId}` - Remove member
- `GET /api/watchlists/shared-items` - Get items wishlisted by multiple users

### UI Components
- WatchlistGrid
- WatchlistCard
- AddToWatchlistButton
- WatchlistItemCard
- SharedWatchlistManager
- WatchlistInviteModal
- PrioritySelector
- WatchlistFilters

### Routes
- `/watchlist` - Personal watchlist page
- `/watchlist/shared` - Shared watchlists page
- `/watchlist/{id}` - Specific watchlist page

## Acceptance Criteria
- ✅ Users can create and manage personal watchlists
- ✅ Users can add/remove items from watchlists
- ✅ Users can create shared watchlists
- ✅ Users can invite others to shared watchlists
- ✅ Query for multi-user wishlisted items works
- ✅ Watchlist items can be marked as watched
- ✅ Filters and sorting work correctly
- ✅ RLS policies prevent unauthorized access

## Success Metrics
- Average watchlist size > 10 items
- Shared watchlist adoption > 30%
- Watchlist-to-watched conversion > 40%

