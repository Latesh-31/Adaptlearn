# 🚀 Quick Start Guide - AdaptLearn AI

## Prerequisites

1. **Node.js 18+** installed
2. **MongoDB** running (local or cloud)
3. **Google Gemini API Key** ([Get it here](https://makersuite.google.com/app/apikey))

## Setup (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env.local` file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
MONGODB_URI=mongodb://localhost:27017/adaptlearn
JWT_SECRET=your-super-secret-jwt-key-minimum-32-chars
GEMINI_API_KEY=your-gemini-api-key-here
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Start MongoDB

**Option A: Local MongoDB**
```bash
mongod
```

**Option B: MongoDB Atlas (Cloud)**
- Use your Atlas connection string in `MONGODB_URI`
- Format: `mongodb+srv://username:password@cluster.mongodb.net/adaptlearn`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## First Time User Flow

1. **Sign Up** at `/auth/signup`
   - Enter your name, email, and password
   
2. **Create Your First Course**
   - Click "Start New Course" on the dashboard
   - Enter a topic (e.g., "Python Functions", "React Hooks", "SQL Joins")
   - AI generates a 5-question diagnostic quiz
   
3. **Take the Assessment**
   - Answer all 5 questions
   - AI analyzes your answers to identify weaknesses
   
4. **Get Your Personalized Roadmap**
   - AI creates a 6-module learning path
   - First 2 modules target your specific weaknesses
   - Next 4 modules cover the broader topic
   
5. **Learn with AI Tutor**
   - Click on Module 1 to start
   - Read the AI-generated content
   - Click "Ask AI Tutor" for help anytime
   - Complete module to unlock the next one

## Testing Without AI (Offline Mode)

If you don't have a Gemini API key yet, you can test the UI by temporarily mocking the AI responses:

1. Comment out the AI calls in `app/actions/ai.js`
2. Return mock data for testing
3. This is useful for frontend development

## Troubleshooting

### MongoDB Connection Failed
- **Local**: Ensure `mongod` is running
- **Atlas**: Check your connection string and IP whitelist
- Test connection: `mongosh "your-connection-string"`

### Gemini API Errors
- Verify your API key is active
- Check [Google AI Studio](https://makersuite.google.com/) for API status
- Ensure you have free tier credits or billing enabled

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
PORT=3001 npm run dev
```

## Project Structure

```
/app
  /actions        → Server Actions (AI, auth, courses)
  /api           → API routes
  /auth          → Sign in/up pages
  /course/[id]   → Course learning view
  /dashboard     → Main dashboard
  
/components      → React UI components
/lib            → Utilities (DB, AI, helpers)
/models         → Mongoose schemas
```

## Key Files

- `app/actions/ai.js` - All AI operations (quiz, analysis, tutor)
- `lib/db.js` - MongoDB connection with caching
- `lib/ai.js` - Gemini API wrappers
- `models/Course.js` - Course schema with progress tracking
- `components/QuizModal.jsx` - Assessment UI
- `app/course/[id]/page.jsx` - Main learning interface

## Development Commands

```bash
npm run dev       # Start dev server (with hot reload)
npm run build     # Build for production
npm run start     # Run production build
npm run lint      # Run ESLint
```

## Production Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

### Environment Variables for Production

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=long-random-production-secret-min-32-chars
GEMINI_API_KEY=your-production-key
NEXTAUTH_URL=https://yourdomain.com
NODE_ENV=production
```

## Next Steps

- [ ] Customize the UI theme in `tailwind.config.js`
- [ ] Add more quiz question types (true/false, fill-in-blank)
- [ ] Implement spaced repetition for review
- [ ] Add module quizzes for assessment
- [ ] Create a progress dashboard with analytics
- [ ] Add collaborative features (share courses)

## Support

- **Issues**: GitHub Issues
- **Docs**: See `README.md` for full documentation
- **AI API**: [Google Gemini Docs](https://ai.google.dev/)

---

**Built with ❤️ using Next.js 14 and Google Gemini AI**
