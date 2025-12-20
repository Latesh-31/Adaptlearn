# AdaptLearn AI - Monolithic Next.js 14

An AI-powered adaptive learning platform built as a single, monolithic Next.js 14 application.

## 🎯 Core Features

- **Diagnostic Assessment**: AI-generated quizzes to identify knowledge gaps
- **Personalized Roadmap**: Custom 6-module learning paths based on weaknesses
- **AI Tutor**: Real-time chat support for each module
- **Progress Tracking**: Visual roadmap with locked/active/completed states

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript/JavaScript
- **Database**: MongoDB with Mongoose
- **AI Engine**: Google Gemini API (`@google/generative-ai`)
- **Styling**: Tailwind CSS (Linear/Enterprise aesthetic)
- **UI Components**: Lucide React icons, Sonner toasts

## 📂 Project Structure

```
/
├── app/
│   ├── actions/          # Server Actions
│   │   ├── ai.js         # AI-powered quiz, syllabus, tutor
│   │   ├── auth.js       # Authentication
│   │   └── courses.js    # Course management
│   ├── api/              # API routes
│   │   └── auth/me/      # Current user endpoint
│   ├── auth/             # Auth pages
│   │   ├── signin/
│   │   └── signup/
│   ├── course/[id]/      # Course view page
│   ├── dashboard/        # Main dashboard
│   ├── layout.js         # Root layout
│   ├── page.js           # Landing page
│   └── globals.css       # Global styles
├── components/
│   ├── ChatInterface.jsx # AI Tutor chat UI
│   ├── QuizModal.jsx     # Assessment modal
│   └── RoadmapView.jsx   # Module roadmap sidebar
├── lib/
│   ├── ai.js             # Gemini API helpers
│   ├── cn.js             # className utility
│   └── db.js             # MongoDB connection
├── models/
│   ├── User.js           # User schema
│   ├── Course.js         # Course schema
│   └── Assessment.js     # Assessment schema
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or cloud)
- Google Gemini API key

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/adaptlearn
   JWT_SECRET=your-super-secret-jwt-key-here
   GEMINI_API_KEY=your-gemini-api-key-here
   NEXTAUTH_URL=http://localhost:3000
   NODE_ENV=development
   ```

3. **Start MongoDB:**
   ```bash
   # If using local MongoDB
   mongod
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🧠 How It Works

### 1. User Flow

1. **Sign Up/Sign In** → User creates an account
2. **Create Course** → User enters a topic (e.g., "React Hooks")
3. **Take Diagnostic Quiz** → AI generates 5 questions to assess knowledge
4. **Get Personalized Roadmap** → AI analyzes results and creates 6 modules:
   - Modules 1-2: Target identified weaknesses
   - Modules 3-6: Comprehensive topic coverage
5. **Learn with AI Tutor** → Progress through modules with AI support

### 2. Adaptive Prompt Engineering

The system uses strategic prompts to ensure personalization:

**Assessment Analysis Prompt:**
```
Analyze these quiz results for the topic "[topic]":
- Score: X%
- Wrong Answers: [list]

Provide:
1. Brief analysis of knowledge gaps
2. List 2-4 specific weakness areas
```

**Syllabus Generation Prompt:**
```
Generate a personalized learning syllabus for "[topic]".
- Score: X%
- Weaknesses: [list]

CRITICAL: Create exactly 6 modules.
Module 1 and 2 MUST address: [weaknesses]
Modules 3-6 should cover broader topic.
```

### 3. Server Actions

All backend logic uses Next.js Server Actions (no separate API layer):

- `generateAssessment(topic, userId)` - Creates diagnostic quiz
- `submitAssessment(assessmentId, answers, userId)` - Analyzes results, generates roadmap
- `askTutor(courseId, moduleId, question, userId)` - AI tutor chat
- `generateModuleContent(courseId, moduleId, userId)` - Generates learning content
- `completeModule(courseId, moduleId, userId)` - Marks module complete, unlocks next

## 🎨 Design System

**Linear/Enterprise Aesthetic:**
- Background: `#09090b` (Zinc-950)
- Borders: `#27272a` (Zinc-800), 1px solid
- Font: Inter
- Components: Minimal, clean, high-contrast

## 📊 Database Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date
}
```

### Course
```javascript
{
  userId: ObjectId,
  topic: String,
  level: 'beginner' | 'intermediate' | 'advanced',
  roadmap: [Module],
  progress: Number (0-100),
  weaknesses: [String],
  assessmentScore: Number,
  currentModuleIndex: Number
}
```

### Assessment
```javascript
{
  userId: ObjectId,
  topic: String,
  questions: [Question],
  score: Number,
  analysis: String,
  weaknesses: [String],
  completedAt: Date
}
```

## 🔐 Authentication

- JWT tokens stored in HTTP-only cookies
- Password hashing with bcryptjs
- Session management via `getCurrentUser()` server action

## 🤖 AI Integration

**Google Gemini 1.5 Flash** is used for:
1. **Quiz Generation**: Create 5 diagnostic questions
2. **Result Analysis**: Identify weaknesses and knowledge gaps
3. **Syllabus Creation**: Generate personalized 6-module roadmap
4. **Content Generation**: Create detailed module content
5. **Tutor Chat**: Provide contextual help and explanations

## 📝 Development

### Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Adding New Features

1. **New Server Action**: Create in `app/actions/`
2. **New Page**: Create in `app/[route]/page.jsx`
3. **New Component**: Create in `components/`
4. **New Model**: Create in `models/`

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=long-random-production-secret
GEMINI_API_KEY=your-production-key
NEXTAUTH_URL=https://your-domain.com
NODE_ENV=production
```

## 📄 License

MIT

## 🙏 Acknowledgments

- Powered by Google Gemini AI
- Built with Next.js 14
- UI inspired by Linear design system
