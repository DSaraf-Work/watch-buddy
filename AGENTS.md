# Agent Guidelines for Watch-Buddy Project

## Project Overview
**Watch-Buddy**: Cross-platform app (web, mobile) centralizing watch history and watchlists across major OTT services (Netflix, Disney+ Hotstar, Amazon Prime Video, etc.).

### Core Features
- Detailed movie/series metadata and search
- Aggregated watch activity (manual, imported, or via extension)
- Track planned and finished content
- Multi-user shared wishlists with sync capability
- User authentication (unique email + password)
- [v2] Personalized insights and recommendations

### Tech Stack
- **Frontend**: Next.js
- **Database**: Supabase
- **Deployment**: Vercel (follow Vercel conventions during local dev)

---

## Development Environment

### Local Development Server
- **Port**: ALWAYS use port **3000** for local development
- **Port Management**:
  - If port 3000 is occupied, kill the conflicting process before starting
  - Use the provided `npm run dev:clean` script to automatically handle this
  - Never use alternative ports - consistency is critical
- **Starting the Server**:
  ```bash
  npm run dev:clean  # Kills port 3000 processes and starts dev server
  # OR
  npm run dev        # Standard dev server (assumes port 3000 is free)
  ```

### Test Credentials
**CRITICAL**: Always use these credentials for testing authentication flows:
- **Email**: `dheerajsaraf1996@gmail.com`
- **Password**: `Abcd1234`
- **Note**: This user is pre-verified and ready for testing
- **Usage**: Use these credentials in ALL testing scenarios, Playwright tests, and manual testing
- **Never** create new test users unless explicitly requested by the user

---

## Development Workflow

### Feature Implementation Process
1. **Check for feature file**: Look in `dev/feature/` folder
2. **If no feature file exists**:
   - Create requirement markdown in `dev/feature/[feature-name].md`
   - Create implementation plan in `dev/impl/[feature-name].md`
3. **Implement feature** following the plan
4. **Update architecture** document with changes
5. **Test thoroughly** using Playwright/Chrome MCP before handoff
   - **ALWAYS use test credentials**: `dheerajsaraf1996@gmail.com` / `Abcd1234`
6. **Supabase** Use supabase mcp server to create or perform any db migrations or set any policies or anything that is achievable using this mcp server

### Documentation Requirements
- **Architecture**: Single file with indexed sections per functionality
- **Always update** architecture on any feature impl or code modifications
- **Feature docs**: Separate requirement and implementation files

---

## Code Quality Standards

### Modularity & Separation of Concerns
- ✅ Keep modules and functionalities **separate and independent**
- ✅ Strong, consistent separation of concerns
- ✅ Maximize code reuse, minimize duplication
- ✅ Refactor for extensibility and reusability when needed

### Backward Compatibility
- ✅ Maintain **complete and exhaustive** backward compatibility
- ✅ Cover **all edge cases** when refactoring
- ❌ Never break existing functionality

### Code Reuse
- ✅ Reuse existing code wherever possible
- ✅ Refactor duplicated code into shared utilities
- ✅ Create abstractions for common patterns

---

## Testing Requirements

### Pre-Handoff Testing
- ✅ Use Playwright MCP or Chrome MCP stdio for feature testing
- ✅ Verify **no unexpected bugs**
- ✅ Ensure **complete feature requirement fulfillment**
- ✅ Test all edge cases and user flows
- ❌ Never hand off untested features

---

## File Organization

```
watch-buddy/
├── dev/
│   ├── feature/          # Feature requirement markdowns
│   └── impl/             # Implementation plan markdowns
├── AGENTS.md             # This file
└── [architecture file]   # Single indexed architecture doc
```

---

## Key Principles

1. **Modular First**: Independent, loosely-coupled modules
2. **DRY**: Don't Repeat Yourself - reuse aggressively
3. **Document Changes**: Keep architecture doc current
4. **Test Before Handoff**: No untested features to user
5. **Vercel-Ready**: Follow Vercel conventions from day one
6. **Plan Then Build**: Requirements → Implementation Plan → Code
7. **Backward Compatible**: Never break existing functionality

---

## User Authentication
- Unique email per user
- Unique password per user
- Secure authentication flow

## Multi-User Features
- Shared wishlists between users
- Sync capability for shared content
- Query movies wishlisted by multiple users

---

## Future Scope (v2)
- Personalized insights
- Basic recommendations
- Advanced analytics

---

**Last Updated**: 2025-10-21

