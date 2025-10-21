# Watch-Buddy 🎬

Your Personal OTT Companion - Centralize your watch history and watchlists across all major OTT platforms.

**🎉 Phase 1 Complete!** Authentication system is ready for testing. See **`PHASE_1_DELIVERY.md`** to get started.

---

## 🌟 Overview

Watch-Buddy is a cross-platform application that helps you:
- **Search & Discover**: Find movies and series with detailed metadata, cast info, and OTT availability
- **Track Your Watchlist**: Create personal and shared watchlists with friends and family
- **Watch History**: Keep track of everything you've watched across all platforms
- **Get Insights**: Analyze your viewing habits and get personalized recommendations

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- A Supabase account (free tier)
- A TMDB API account (free)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd watch-buddy
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```
Then edit `.env.local` with your Supabase and TMDB credentials.

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

For detailed setup instructions, see [SETUP.md](SETUP.md)

---

## 📁 Project Structure

```
watch-buddy/
├── src/                    # Source code
│   ├── app/               # Next.js App Router
│   ├── components/        # React components
│   ├── lib/               # Utilities and configurations
│   ├── types/             # TypeScript types
│   ├── hooks/             # Custom React hooks
│   └── constants/         # App constants
├── supabase/              # Database migrations
├── tests/                 # Test files
├── dev/                   # Development documentation
│   ├── feature/          # Feature requirements
│   └── impl/             # Implementation plans
└── docs/                  # Documentation
```

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **External APIs**: TMDB API
- **Testing**: Playwright
- **Deployment**: Vercel

---

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Detailed setup instructions
- **[AGENTS.md](AGENTS.md)** - Development guidelines and preferences
- **[PROJECT_STATUS.md](PROJECT_STATUS.md)** - Current project status
- **[docs/architecture.md](docs/architecture.md)** - Architecture documentation
- **[dev/impl/master-implementation-plan.md](dev/impl/master-implementation-plan.md)** - Implementation roadmap

---

## 🎯 Features

### Phase 1: Core Features (In Progress)
- [ ] User authentication (signup, login, logout)
- [ ] Movie/series search with filters
- [ ] Content detail pages
- [ ] Personal watchlist management

### Phase 2: Advanced Features (Planned)
- [ ] Shared watchlists
- [ ] Watch history tracking
- [ ] Ratings and reviews

### Phase 3: Insights & Polish (Planned)
- [ ] Viewing insights and analytics
- [ ] Personalized recommendations
- [ ] Performance optimization

See [dev/impl/master-implementation-plan.md](dev/impl/master-implementation-plan.md) for the complete roadmap.

---

## 🧪 Testing

```bash
# Run E2E tests
npm test

# Run tests with UI
npm run test:ui
```

---

## 📝 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Format code
npm run format
```

---

## 🚢 Deployment

This project is configured for deployment on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

See [vercel.json](vercel.json) for deployment configuration.

---

## 🤝 Contributing

This is a personal project, but contributions are welcome! Please follow the guidelines in [AGENTS.md](AGENTS.md).

---

## 📄 License

MIT License - feel free to use this project for your own purposes.

---

## 🙏 Acknowledgments

- **TMDB** for providing the movie/series data API
- **Supabase** for the backend infrastructure
- **Vercel** for hosting and deployment
- **Next.js** team for the amazing framework

---

**Built with ❤️ using Next.js and Supabase**

