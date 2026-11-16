<<<<<<< HEAD
# Ayush Gora — World-Class 3D Developer Portfolio

> A real, production-ready full-stack developer portfolio combining **React (Vite)**, **Three.js / React Three Fiber**, an organic **Multiplayer-style Swarm Cursor engine**, and a robust **Django REST Framework** backend.

---

## 🌟 Key Features

- **Multiplayer Swarm Cursor Engine (`SwarmCursor.jsx`)**: Flocking physics simulation (boids algorithm) with multiple labeled cursors, dynamic speed particle trails, and interactive attraction to hero elements.
- **Cinematic 3D WebGL Hero**: Immersive Three.js space canvas with interactive floating geometric nodes, depth particles, and responsive lighting.
- **Interactive Project Showcase**: Dynamic 3D tilt cards connected to Django backend APIs with live links, modal details, and technology tags.
- **Interactive 3D Skills Orbit**: Categorized technology visualizations (Frontend, Backend, Cloud & DevOps, System Tools) with zero fabricated stats.
- **Production-Ready Django REST API**: Full backend with endpoints for `profile`, `projects`, `skills`, `education`, `achievements`, and a rate-limited `contact` submission endpoint.
- **Custom Django Admin Panel**: Complete content management interface for updating projects, bio, skills, and viewing visitor messages.
- **Glassmorphism Design System**: Ultra-modern deep space palette (`#030712`, `#0B0F19`, `#3B82F6`, `#06B6D4`, `#8B5CF6`).

---

## 🏗️ Architecture

```
swarm/
├── frontend/                     # React 18 + Vite + Tailwind CSS + Three.js
│   ├── src/
│   │   ├── components/           # UI components (Navbar, Footer, GlassCard, etc.)
│   │   ├── sections/             # Main sections (Hero, About, Skills, Projects, Contact)
│   │   ├── animations/           # Swarm Cursor engine, particle systems
│   │   ├── three/                # Three.js / R3F Canvas and 3D meshes
│   │   ├── hooks/                # Custom hooks (useLenis, useMousePosition, useApi)
│   │   ├── services/             # Axios API client and endpoints
│   │   ├── assets/               # Icons, images, textures
│   │   ├── App.jsx               # Root application component
│   │   └── main.jsx              # Application bootstrap
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # Python + Django + Django REST Framework
│   ├── config/                   # Core Django settings & URLs
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── profile_app/          # Bio, education, career goals, social links
│   │   ├── projects/             # Portfolio projects with live/GitHub URLs
│   │   ├── skills/               # Categorized technical competencies
│   │   ├── contact/              # Inquiries, validation, rate-limiting
│   │   └── analytics/            # Interaction logs and achievements
│   ├── manage.py
│   └── requirements.txt
│
├── .planning/                    # GSD Planning & State Artifacts
│   ├── PROJECT.md
│   ├── REQUIREMENTS.md
│   ├── ROADMAP.md
│   ├── STATE.md
│   └── config.json
├── .env.example                  # Environment variable reference
└── README.md
```

---

## 🚀 Quickstart Guide (Windows PowerShell)

### 1. Django Backend Setup

```powershell
# Navigate to backend directory
cd backend

# Create and activate Python virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Seed verified portfolio data (Ayush Gora)
python manage.py seed_portfolio

# Start Django development server (runs on http://localhost:8000)
python manage.py runserver
```

### 2. React Frontend Setup

```powershell
# In a new PowerShell window, navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite development server (runs on http://localhost:5173)
npm run dev
```

---

## 🔒 Security & Best Practices

- Input sanitization & email format validation on `POST /api/contact/`.
- IP-based rate limiting to prevent spam on the contact endpoint.
- CORS restricted to approved origins (`CORS_ALLOWED_ORIGINS`).
- PostgreSQL-ready production settings with environment-controlled `SECRET_KEY`.
- Canvas performance auto-scaling for mobile and low-power devices.
- `prefers-reduced-motion` compliance.

=======
# portfolio
>>>>>>> 08838b69db3b0dfd587991607903a5c948098670
