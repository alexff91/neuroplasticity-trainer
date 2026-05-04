# NeuroForge - Adaptive Brain Training Platform

A science-backed cognitive training application that leverages **neuroplasticity research** to deliver personalized brain exercises with adaptive difficulty, spaced repetition, and interleaved practice.

**[Live Demo](https://alexff91.github.io/neuroplasticity-trainer/)** | Built with React + TypeScript + Vite

---

## What Makes This Different

Most "brain training" apps are gamified toys with no scientific foundation. NeuroForge is transparent about its evidence base: every exercise references peer-reviewed research, and the adaptive algorithm is based on established learning science.

- **Adaptive difficulty** using an ELO-like rating system targeting Vygotsky's Zone of Proximal Development
- **Spaced repetition** scheduling prioritizes exercises at the optimal retention interval
- **Interleaved practice** mixes exercise types within sessions (proven superior to blocked practice)
- **Full scientific transparency** with citations for every claim and a dedicated Science page

## Cognitive Exercises (12 exercises across 6 domains)

| Exercise | Cognitive Domain | Brain Regions | Key Reference |
|----------|-----------------|---------------|---------------|
| **Pattern Matrix** | Pattern Recognition | DLPFC, lateral occipital cortex | Jaeggi et al. (2008), PNAS |
| **Sequence Recall** | Working Memory | Frontoparietal network | Klingberg (2010), Trends in Cog. Sci. |
| **N-Back Challenge** | Working Memory | Prefrontal & parietal cortex | Soveri et al. (2017), Psychonomic Bull. |
| **Math Sprint** | Working Memory | Intraparietal sulcus, PFC | Dehaene et al. (2003), Cog. Neuropsych. |
| **Speed Match** | Processing Speed | Myelination circuits | Ball et al. (2002), JAMA |
| **Reaction Tap** | Processing Speed | Cortico-spinal pathways | Deary et al. (2010), Behavior Genetics |
| **Go/No-Go** | Attention Control | Right inferior frontal gyrus | Aron et al. (2004), Trends in Cog. Sci. |
| **Stroop Challenge** | Attention Control | Anterior cingulate cortex | MacLeod (1991), Psych. Bulletin |
| **Schulte Table** | Attention Control | Dorsal attention network | Posner & Petersen (1990), Annu. Rev. Neurosci. |
| **Mental Rotation** | Spatial Reasoning | Posterior parietal cortex | Uttal et al. (2013), Psych. Bulletin |
| **Word Chain** | Verbal Fluency | Broca's area, temporal cortex | Henry & Crawford (2004), Neuropsych. |
| **Anagram Solver** | Verbal Fluency | Left IFG, anterior temporal | Aziz-Zadeh et al. (2009), Brain Res. |

## Features

### Adaptive Difficulty Engine
The system uses a simplified **ELO rating** for each exercise. After each trial, the algorithm:
1. Computes expected performance based on current difficulty vs. user ability
2. Adjusts the ELO rating based on actual accuracy and response time
3. Maps the new rating to a difficulty level (1-10)
4. Applies streak bonuses (3+ consecutive correct = accelerated progression)
5. Implements safety nets (3+ consecutive failures = difficulty reduction)

This targets the "desirable difficulty" sweet spot described by Bjork (1994).

### Spaced Repetition Scheduling
When generating a session, exercises are ranked by:
- **Recency** (40%): exercises not done recently get priority
- **Accuracy targeting** (40%): exercises in the 60-80% accuracy zone get priority (optimal learning zone)
- **Novelty bonus**: untried exercises get a significant boost
- **Random jitter** (20%): prevents rigid ordering

### Brain Health Dashboard
- **Cognitive radar chart**: visualize strengths/weaknesses across 6 domains
- **Daily score trends**: track improvement over time
- **Per-skill progress lines**: see learning curves for each domain
- **Adaptive difficulty bar chart**: see how the system has adjusted to your level
- **Achievement tracking**: 10 achievements with progress indicators

### Structured Sessions
- **Quick Focus** (5 min): 3-4 interleaved exercises
- **Daily Training** (10 min): 6-8 exercises with full variety
- **Deep Session** (15 min): 10-12 exercises for intensive training
- Individual exercise mode for targeted practice

### Streak & Motivation System
- Daily training streaks with fire indicator
- 10 achievements (First Steps, Consistent, Dedicated, Iron Will, Half Century, Brain Athlete, Perfect Mind, Well-Rounded, Speed Demon, Building Habits)
- Score history and personal bests

### PWA Support
- Service worker for offline functionality
- Installable on mobile devices
- All data stored locally (localStorage)

### Global Mind (Optional, Opt-In)
A privacy-respecting global benchmark layer:

- **Local-first.** The app works fully offline. Global Mind is opt-in only.
- **Anonymous handle.** A random handle (e.g. `SwiftSynapse4821`) is generated on first connect — no sign-up, no email, no tracking.
- **What is sent:** the handle, your timezone region, brain score, and per-skill averages from your last 10 sessions. Nothing else.
- **What you get:** your *Brain Score* compared against the global average per skill, a top-50 leaderboard, and live community totals (trainees, exercises, sessions).
- **Backend is open-source.** A 150-line [Cloudflare Worker](server/worker.ts) you can self-host on the free tier. See [`server/README.md`](server/README.md) for the 3-minute deploy.
- **Profile portability.** Export/import your full profile as JSON from the Dashboard for backup or device transfer.

When no backend is configured, the Global tab shows static seed benchmarks so the UI still demonstrates the feature.

## Scientific Foundation

### Core Learning Principles Applied

1. **Neuroplasticity** - The brain physically restructures itself through training (Draganski et al., 2004)
2. **Spaced Repetition** - Distributed practice produces stronger memories (Cepeda et al., 2006)
3. **Desirable Difficulty** - Optimal challenge zone for maximum growth (Bjork, 1994)
4. **Interleaving** - Mixed practice outperforms blocked practice (Rohrer & Taylor, 2007)
5. **Myelination** - Repeated practice increases neural signal speed (Fields, 2008)

### Honest Disclaimer

The app includes a prominent disclaimer: while exercises are grounded in peer-reviewed research, the "brain training" industry has legitimate scientific critics (see Simons et al., 2016). This app prioritizes scientific transparency over marketing claims.

## Tech Stack

- **React 19** with TypeScript
- **Vite 6** for fast builds
- **Recharts** for data visualization
- **Lucide React** for icons
- **localStorage** for persistence (no backend required)
- **Service Worker** for PWA/offline support

## Getting Started

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Production build with Global Mind enabled (point to your Worker URL)
VITE_GLOBAL_API_URL=https://neuroforge-global.<your-subdomain>.workers.dev \
  npm run build

# Preview production build
npm run preview
```

## Architecture

```
src/
  types.ts           # TypeScript interfaces
  storage.ts         # localStorage persistence layer
  exercises.ts       # Exercise configs, skill labels, achievements
  difficulty.ts      # Adaptive ELO engine, spaced repetition, interleaving
  global.ts          # Optional opt-in anonymous global sync layer
  games/
    PatternMatrix.tsx    # Visual pattern completion
    SequenceRecall.tsx   # Grid-based sequence memory
    NBack.tsx            # Classic N-back task
    MathSprint.tsx       # Timed mental arithmetic
    SpeedMatch.tsx       # Shape/color matching speed
    ReactionTap.tsx      # Simple + go/no-go reaction time
    GoNoGo.tsx           # Inhibitory control task
    StroopTest.tsx       # Color-word interference
    SchulteTable.tsx     # Visual search / peripheral attention
    MentalRotation.tsx   # 2D shape rotation/mirror detection
    WordChain.tsx        # Timed word generation
    Anagram.tsx          # Letter unscrambling
  components/
    Header.tsx           # Navigation with streak display
    HomeView.tsx         # Brain Score hero, session launcher, exercise catalog
    SessionRunner.tsx    # Session flow: intro > play > result > next
    Dashboard.tsx        # Charts, radar, achievements, profile export/import
    GlobalView.tsx       # Opt-in global benchmarks & leaderboard
    SciencePage.tsx      # Full science references and principles
  App.tsx              # Root state management and routing

server/                  # Optional self-hostable Cloudflare Worker backend
  worker.ts              # POST /submit, GET /global — anonymous KV-backed
  wrangler.toml.example  # Wrangler config template
  README.md              # 3-minute deploy guide
```

## Key References

- Aron, A.R., et al. (2004). Inhibition and the right inferior frontal cortex. *Trends in Cognitive Sciences*, 8(4), 170-177.
- Ball, K., et al. (2002). Effects of cognitive training interventions with older adults: ACTIVE RCT. *JAMA*, 288(18), 2271-2281.
- Bjork, R.A. (1994). Memory and metamemory considerations in the training of human beings. MIT Press.
- Cepeda, N.J., et al. (2006). Distributed practice in verbal recall tasks. *Psychological Bulletin*, 132(3), 354.
- Draganski, B., et al. (2004). Neuroplasticity: Changes in grey matter induced by training. *Nature*, 427, 311-312.
- Fields, R.D. (2008). White matter in learning, cognition and psychiatric disorders. *Trends in Neurosciences*, 31(7), 361-370.
- Henry, J.D. & Crawford, J.R. (2004). A meta-analytic review of verbal fluency performance. *Neuropsychology*, 18(2), 284.
- Jaeggi, S.M., et al. (2008). Improving fluid intelligence with training on working memory. *PNAS*, 105(19), 6829-6833.
- Klingberg, T. (2010). Training and plasticity of working memory. *Trends in Cognitive Sciences*, 14(7), 317-324.
- MacLeod, C.M. (1991). Half a century of research on the Stroop effect. *Psychological Bulletin*, 109(2), 163.
- Rohrer, D. & Taylor, K. (2007). The shuffling of mathematics problems improves learning. *Instructional Science*, 35, 481-498.
- Simons, D.J., et al. (2016). Do "Brain-Training" programs work? *Psychological Science in the Public Interest*, 17(3), 103-186.
- Soveri, A., et al. (2017). Working memory training revisited. *Psychonomic Bulletin & Review*, 24(4), 1077-1096.
- Uttal, D.H., et al. (2013). The malleability of spatial skills. *Psychological Bulletin*, 139(2), 352.

## License

MIT
