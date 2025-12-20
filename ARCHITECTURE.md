# Architecture Overview

## Current Structure: Monolithic Next.js 14 ✅

AdaptLearn AI has been rebuilt as a **unified Next.js 14 application** with all backend and frontend code in a single codebase.

### Active Codebase (USE THIS)

```
/ (root)
├── app/                    # Next.js App Router
│   ├── actions/           # Server Actions (backend logic)
│   ├── api/               # API Routes
│   ├── auth/              # Authentication pages
│   ├── course/[id]/       # Course learning view
│   ├── dashboard/         # Dashboard page
│   ├── layout.js          # Root layout
│   └── page.js            # Landing page
├── components/            # React components
├── lib/                   # Utilities (DB, AI)
├── models/                # Mongoose schemas
├── public/                # Static assets
└── package.json           # Root dependencies
```

**Start the application:**
```bash
npm run dev  # Runs on http://localhost:3000
```

---

## Legacy Structure (client/ and server/)

⚠️ **DEPRECATED**: The old `client/` and `server/` directories are from the previous architecture and are no longer used. They remain in the repository for reference but are not part of the current application.

### Old Architecture (DO NOT USE)

```
/client/    # Old React + Vite frontend (deprecated)
/server/    # Old Express backend (deprecated)
```

These directories can be safely removed if you don't need the reference code.

---

## Key Architectural Differences

### Old (Client/Server Split)

- **Frontend**: React + Vite + Client-side routing
- **Backend**: Express.js + REST API
- **Communication**: HTTP requests between separate servers
- **Development**: Two servers running (`npm run dev` in each)

### New (Monolithic Next.js)

- **Frontend**: Next.js App Router + Server Components
- **Backend**: Next.js Server Actions (no separate API layer)
- **Communication**: Direct function calls
- **Development**: Single server (`npm run dev`)

---

## Why the Change?

### Benefits of Monolithic Next.js

1. **Simplified Development**: One codebase, one server
2. **Better Performance**: Server Components, automatic code splitting
3. **Easier Deployment**: Deploy to Vercel with zero configuration
4. **Type Safety**: Shared types between client and server
5. **Less Boilerplate**: Server Actions eliminate API routes
6. **Better DX**: Hot reload for both frontend and backend

### Trade-offs

- **Tight Coupling**: Frontend and backend are in one repo
- **Vendor Lock**: More tied to Next.js ecosystem
- **Learning Curve**: New paradigms (Server Actions, RSC)

---

## Database & AI Integration

### MongoDB Connection
- **File**: `lib/db.js`
- **Strategy**: Connection caching for serverless
- **ODM**: Mongoose with schemas in `models/`

### Google Gemini AI
- **File**: `lib/ai.js`
- **Model**: gemini-1.5-flash
- **Usage**: Quiz generation, analysis, tutoring, content creation

---

## Authentication

- **Strategy**: JWT tokens in HTTP-only cookies
- **Implementation**: Server Actions in `app/actions/auth.js`
- **Password Hashing**: bcryptjs
- **Session Management**: Cookie-based

---

## Data Flow Example

### Creating a Course

1. **User clicks "Start New Course"**
   ```jsx
   // components/QuizModal.jsx
   <button onClick={() => setShowQuizModal(true)}>
   ```

2. **User enters topic, AI generates quiz**
   ```js
   // app/actions/ai.js (Server Action)
   export async function generateAssessment(topic, userId) {
     const result = await generateJSON(prompt);
     // Saves to MongoDB
   }
   ```

3. **User completes quiz, AI analyzes results**
   ```js
   // app/actions/ai.js
   export async function submitAssessment(assessmentId, answers, userId) {
     // Analyzes weaknesses
     // Generates personalized 6-module roadmap
     // Saves Course to MongoDB
   }
   ```

4. **User navigates to course page**
   ```jsx
   // app/course/[id]/page.jsx
   // Server fetches course data
   // Renders roadmap + module content
   ```

5. **User asks AI tutor for help**
   ```js
   // app/actions/ai.js
   export async function askTutor(courseId, moduleId, question, userId) {
     // Sends context + question to Gemini
     // Returns personalized answer
   }
   ```

---

## Deployment

### Development
```bash
npm run dev
```

### Production (Vercel)
```bash
git push origin main
# Vercel auto-deploys
```

### Production (Other Platforms)
```bash
npm run build
npm run start
```

---

## File Organization

### Server-Side Code
- `app/actions/*.js` - Server Actions (mutations)
- `lib/*.js` - Utilities (DB, AI helpers)
- `models/*.js` - Mongoose schemas

### Client-Side Code
- `app/**/page.jsx` - Pages (can be Server or Client Components)
- `components/*.jsx` - Reusable components (mostly Client Components)

### Shared
- `app/layout.js` - Root layout (Server Component)
- `tailwind.config.js` - Styling configuration

---

## Testing the Application

### 1. Without AI (Offline)
Comment out AI calls in `app/actions/ai.js` and return mock data.

### 2. With Local MongoDB
```bash
mongod
npm run dev
```

### 3. Full Integration (MongoDB Atlas + Gemini)
Configure `.env.local` with real credentials.

---

## Migration Path (If Needed)

If you need to migrate data from the old architecture:

1. **Export data** from old MongoDB collections
2. **Transform** to match new schemas in `models/`
3. **Import** into new database
4. Update user references and IDs

---

## Future Enhancements

Potential additions to the architecture:

- [ ] **Redis**: For session caching and rate limiting
- [ ] **PostgreSQL**: If relational data becomes complex
- [ ] **tRPC**: For type-safe API calls (if APIs needed)
- [ ] **Prisma**: Alternative to Mongoose for type safety
- [ ] **WebSockets**: For real-time tutor chat
- [ ] **Queue System**: For background AI processing
- [ ] **CDN**: For static assets and content

---

## Summary

✅ **Use**: Root-level Next.js 14 application  
❌ **Ignore**: `client/` and `server/` directories (legacy)  
📚 **Docs**: See `README.md` and `QUICKSTART.md`  
🚀 **Deploy**: Push to Vercel or run `npm run build && npm start`

**Questions?** Check the code - it's well-commented and follows Next.js 14 best practices.
