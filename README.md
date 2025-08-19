# Gutcheck Score™ MVP

A Next.js-based entrepreneurial assessment platform that provides AI-powered scoring and insights for entrepreneurs.

<!-- Last updated: 2025-08-11 - Cloud Billing API enabled -->

## 🚀 Features

- **25-Question Assessment**: Comprehensive evaluation across 5 entrepreneurial categories
- **Real-time Scoring**: Immediate calculation of Gutcheck Score™ using exact framework
- **AI-Powered Insights**: Gemini integration for personalized feedback and recommendations
- **Responsive Design**: Mobile-first approach with modern UI/UX
- **Multi-step Flow**: Smooth assessment experience with progress tracking
- **Results Dashboard**: Detailed score breakdown and category analysis

## 📊 Assessment Categories

- **Personal Foundation** (20% weight)
- **Entrepreneurial Skills** (25% weight)
- **Resources** (20% weight)
- **Behavioral Metrics** (15% weight)
- **Growth & Vision** (20% weight)

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: Google Gemini API
- **State Management**: React Hooks
- **Form Handling**: React Hook Form + Zod validation
- **UI Components**: Headless UI, Heroicons

## 📁 Project Structure

```
gutcheck-score-mvp/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── assessment/         # Assessment flow pages
│   │   ├── dashboard/          # User dashboard
│   │   ├── api/               # API routes (future)
│   │   └── globals.css
│   ├── components/            # React components
│   ├── lib/                   # Firebase, Gemini config
│   ├── types/                 # TypeScript types
│   └── utils/                 # Scoring logic
├── public/                    # Static assets
└── package.json
```

## 🚀 CI/CD Pipeline Status

- ✅ Cloud Build trigger configured
- ✅ Automated deployment on push to main branch
- ✅ Firebase Admin permissions granted
- 🚀 Ready for first automated deployment test!
- ✅ Cloud Build trigger now active and enabled!

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   cd ~
   mkdir gutcheck-score-mvp
   cd gutcheck-score-mvp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your API keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Assessment Flow

1. **Landing Page**: Introduction and overview
2. **Assessment**: 25 questions across 5 categories
3. **Scoring**: Real-time calculation using exact framework
4. **Results**: Detailed breakdown with AI insights
5. **Dashboard**: Assessment history and progress tracking

## 🧮 Scoring Framework

The assessment uses the exact scoring framework from the Gutcheck.AI documentation:

- **Normalization Formula**: `(Raw Score / 5) × (Category Weight / 5)`
- **Category Weights**: Predefined percentages for each category
- **Overall Score**: Sum of all category scores (max 100)
- **Star Rating**: 1-5 stars based on overall score

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Key Components

- **AssessmentQuestion**: Handles different question types (MCQ, Likert, Open-ended)
- **Scoring Utils**: Implements exact scoring logic from framework
- **Results Page**: Displays scores and AI-generated insights
- **Dashboard**: User interface for assessment history

## 🔮 Next Steps (Phase 1.5)

### Firebase Integration
- [ ] Set up Firebase project
- [ ] Configure Firestore database
- [ ] Implement user authentication
- [ ] Add data persistence

### Gemini AI Integration
- [ ] Connect to Gemini API for open-ended questions
- [ ] Implement AI scoring prompts
- [ ] Add real-time feedback generation
- [ ] Create AI insights pipeline

### Enhanced Features
- [ ] User authentication (anonymous + authenticated)
- [ ] Assessment history tracking
- [ ] PDF report generation
- [ ] Email notifications
- [ ] Partner dashboard

## 📊 Data Model

### Assessment Session
```typescript
interface AssessmentSession {
  sessionId: string;
  userId?: string;
  createdAt: Date;
  responses: AssessmentResponse[];
  scores: CategoryScores;
  geminiFeedback: AIFeedback;
  outcomeTrackingReady: boolean;
}
```

### Scoring Categories
```typescript
interface CategoryScores {
  personalBackground: number;
  entrepreneurialSkills: number;
  resources: number;
  behavioralMetrics: number;
  growthVision: number;
  overallScore: number;
}
```

## 🎯 Business Impact

This MVP delivers on the core Phase 1 objectives:

- ✅ **Stable Assessment Flow**: 25-question framework implemented
- ✅ **Real-time Scoring**: Exact formulas from documentation
- ✅ **AI Integration Ready**: Gemini API configuration complete
- ✅ **User Experience**: Professional, responsive interface
- ✅ **Data Structure**: ML-ready schema for future phases

## 🤝 Contributing

This is a solo founder project currently in MVP development. The focus is on:

1. **Stability**: Ensuring the assessment works reliably
2. **Accuracy**: Implementing exact scoring framework
3. **User Experience**: Smooth, professional interface
4. **Scalability**: Foundation for future Firebase integration

## 📄 License

Proprietary - Gutcheck.AI internal use only.

## 🆘 Support

For technical issues or questions about the assessment framework, refer to the Gutcheck.AI documentation and strategic roadmap.

---

**Built with ❤️ for entrepreneurs everywhere**
# URL parsing fixes deployed
