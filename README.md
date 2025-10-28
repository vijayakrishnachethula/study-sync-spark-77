# StudySync Matcher 🎓✨

A unique CS student study group matching app with immersive, animated UX inspired by cosmic coding themes. Built with React, TypeScript, Framer Motion, and Chart.js.

## 🌟 Features

### Core Functionality
- **Smart Matching Algorithm**: Matches students based on:
  - 60% Course overlap
  - 25% Schedule compatibility 
  - 15% Study style alignment
- **Interactive Profile Creation**: Beautiful animated form with validation
- **Match Dashboard**: View top matches with detailed compatibility breakdowns
- **Radar Charts**: Visualize match factors with interactive Chart.js graphs

### 🎨 Design & UX
- **Cosmic Theme**: Blue (#4A90E2) to green (#7ED321) gradients
- **Dark/Light Mode**: Persisted theme toggle with smooth transitions
- **Particle Effects**: Constellation backgrounds with mouse-repel interactivity
- **Fluid Animations**: Spring-based staggers, drags, hovers via Framer Motion
- **Gamification**: 
  - "Learner Orbs" for study style selection
  - "Code Chips" for icebreaker quizzes
  - Power Pair badges for 80%+ matches
  - Confetti celebrations

### 🐛 Easter Eggs
- Type `debugme` in courses field to trigger terminal modal
- CS fact tooltips on quiz hover
- Particle sparks on card drag

### ♿ Accessibility
- ARIA labels throughout
- Keyboard navigation support
- Reduced motion for mobile
- Screen reader friendly

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

\`\`\`bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd studysync-matcher

# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

The app will be available at `http://localhost:8080`

### Build for Production

\`\`\`bash
npm run build
\`\`\`

## 📦 Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Chart.js + react-chartjs-2
- **Particles**: @tsparticles/react
- **Icons**: React Icons
- **UI Components**: shadcn/ui
- **Routing**: React Router v6

## 🏗️ Project Structure

\`\`\`
src/
├── components/
│   ├── ui/                 # shadcn UI components
│   ├── Navbar.tsx          # Fixed navigation with theme toggle
│   ├── MatchCard.tsx       # Draggable match cards with radar charts
│   ├── RadarChart.tsx      # Interactive Chart.js radar visualization
│   ├── ParticleBackground.tsx  # Constellation effect
│   ├── CosmicLoader.tsx    # Rotating stars loader
│   ├── ProTipsModal.tsx    # Study tips based on learning style
│   ├── TerminalModal.tsx   # Easter egg terminal
│   └── PowerPairBadge.tsx  # 80%+ match badge
├── contexts/
│   └── ThemeContext.tsx    # Dark/light mode provider
├── pages/
│   ├── ProfileForm.tsx     # Home page with form
│   ├── Matches.tsx         # Match results page
│   └── NotFound.tsx        # 404 page
├── utils/
│   ├── matcher.ts          # Core matching algorithm (O(n))
│   └── mockProfiles.ts     # Sample user data
├── App.tsx                 # Main app with routing
└── index.css               # Global styles & design tokens
\`\`\`

## 🎯 Key Components

### Matching Algorithm (`utils/matcher.ts`)
\`\`\`typescript
// Score breakdown (0-100):
// - 60% Course overlap
// - 25% Schedule compatibility (regex-based conflict detection)
// - 15% Study style match (binary)
\`\`\`

### Design System (`index.css`)
- Semantic color tokens (HSL)
- Custom gradients and shadows
- Reusable animation keyframes
- Dark/light mode support

## 🚢 Deployment

### Netlify (Recommended)

1. Connect your GitHub repo to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy!

### Manual Deploy

\`\`\`bash
npm run build
# Upload dist/ folder to your hosting provider
\`\`\`

## 🔮 Future Enhancements

- Backend integration with user authentication
- Real-time chat between matches
- Calendar integration for scheduling
- Email notifications
- Mobile app (PWA installable)
- Advanced filtering options

## 📝 Environment Variables

For backend integration, create `.env`:

\`\`\`
VITE_API_URL=https://your-api-url.com
\`\`\`

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📄 License

MIT

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Particles by [tsParticles](https://particles.js.org)

---

**Built with 💙 by StudySync Team**
