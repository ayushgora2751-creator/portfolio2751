import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentic Resume Data for Ayush Gora
export const FALLBACK_DATA = {
  profile: {
    name: "Ayush Gora",
    title: "B.Tech CSE Student | Aspiring DevOps & Cloud Engineer",
    tagline: "Highly curious about infrastructure automation, local AI deployment, and building scalable applications.",
    bio: "Motivated Computer Science Engineering student (Class of 2029) with a strong problem-solving mindset and practical approach to learning. Highly curious about infrastructure automation, local AI deployment, and building scalable applications. Actively developing hands-on technical projects to bridge the gap between academic theory and industry practices, with a primary focus on transitioning into Cloud Computing and DevOps Engineering roles.",
    career_goal: "Transitioning into Cloud Computing and DevOps Engineering roles.",
    email: "ayushgora@example.com",
    location: "Punjab, India",
    education: [
      {
        id: 1,
        institution: "GNA University, Phagwara, Punjab",
        degree: "Bachelor of Technology (B.Tech) in Computer Science and Engineering",
        field_of_study: "Computer Science and Engineering",
        start_year: 2025,
        end_year: 2029,
        is_current: true,
        description: "Class of 2029. Focus on infrastructure automation, local AI deployment, software engineering, and cloud platforms."
      },
      {
        id: 2,
        institution: "Rainbow International School",
        degree: "Class XII (Senior Secondary)",
        field_of_study: "Science & Mathematics",
        start_year: 2024,
        end_year: 2025,
        is_current: false,
        description: "Higher secondary education with a strong analytical foundation in mathematics, physics, and computer science."
      },
      {
        id: 3,
        institution: "DAV Senior Secondary School",
        degree: "Class X (Secondary)",
        field_of_study: "General Sciences & Computing",
        start_year: 2022,
        end_year: 2023,
        is_current: false,
        description: "Secondary education with foundational training in mathematics, natural sciences, and computer literacy."
      }
    ],
    social_links: [
      { id: 1, platform: "GitHub", url: "https://github.com/AyushGora", icon_name: "Github" },
      { id: 2, platform: "LinkedIn", url: "https://linkedin.com", icon_name: "Linkedin" },
      { id: 3, platform: "Portfolio", url: "http://localhost:5173", icon_name: "Globe" },
      { id: 4, platform: "Email", url: "mailto:ayushgora@example.com", icon_name: "Mail" },
    ]
  },
  projects: [
    {
      id: 1,
      title: "OpenJarvis — Local AI Personal Assistant",
      slug: "openjarvis-local-ai",
      short_description: "Locally hosted, offline AI personal assistant on Windows utilizing OpenJarvis, Ollama, and Qwen 3.5 LLM.",
      description: "Developing a locally hosted, offline AI personal assistant on Windows utilizing OpenJarvis and Ollama. Integrating the Qwen 3.5 LLM alongside speech-to-text (Faster Whisper) and text-to-speech (Kokoro TTS) for seamless voice interaction. Designing a local web-based chat interface to explore future computer automation capabilities securely without external API dependencies.",
      category: "Local AI & Systems Automation",
      technologies: ["Python", "Ollama", "OpenJarvis", "Qwen 3.5", "Kokoro TTS", "Faster Whisper"],
      thumbnail_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      github_url: "https://github.com/AyushGora",
      live_url: "",
      featured: true
    },
    {
      id: 2,
      title: "Fake Account Detection Application",
      slug: "fake-account-detection",
      short_description: "AI-powered application to identify potentially fake social media accounts via profile and behavioral analytics.",
      description: "Architecting an AI-powered application to identify potentially fake social media accounts by analyzing user profiles and behavioral patterns. Planning implementation of secure authentication, AI/ML-based classification logic, and a comprehensive frontend reporting dashboard.",
      category: "AI & Machine Learning",
      technologies: ["React.js", "Python", "FastAPI/Flask", "SQL", "Machine Learning"],
      thumbnail_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
      github_url: "https://github.com/AyushGora",
      live_url: "",
      featured: true
    },
    {
      id: 3,
      title: "MSJ Engineering Consultancy Website",
      slug: "msj-engineering-consultancy",
      short_description: "Professional frontend business demonstration for an engineering consultancy deployed live on Netlify.",
      description: "Developed and deployed a professional frontend business demonstration for an engineering consultancy to showcase modern web presentation skills, responsive UI architectures, and corporate branding.",
      category: "Client & Enterprise Web",
      technologies: ["React.js", "HTML", "CSS", "JavaScript", "Netlify"],
      thumbnail_url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
      github_url: "https://github.com/AyushGora",
      live_url: "https://msj01demo.netlify.app",
      featured: true
    },
    {
      id: 4,
      title: "Frontend Web Demonstrations (JAP Interior & Dhauladhar Hills Resort)",
      slug: "frontend-web-demonstrations",
      short_description: "Responsive, visually appealing frontend prototypes for interior design and hospitality businesses.",
      description: "Built responsive, visually appealing frontend prototypes for interior design (JAP Interior) and hospitality (Dhauladhar Hills Resort) businesses using React, HTML, CSS, and modern interactive JavaScript.",
      category: "Commercial Frontend Showcase",
      technologies: ["React.js", "HTML", "CSS", "JavaScript", "UI/UX"],
      thumbnail_url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
      github_url: "https://github.com/AyushGora",
      live_url: "https://msj01demo.netlify.app",
      featured: true
    },
    {
      id: 5,
      title: "3D Scrollytelling & Swarm Portfolio",
      slug: "3d-scrollytelling-swarm-portfolio",
      short_description: "Production-grade portfolio featuring 192-frame canvas scrollytelling, WebGL 3D, and Django REST backend.",
      description: "High-end developer portfolio integrating hardware-accelerated HTML5 Canvas scrubbing across 192 frames, Three.js 3D crystal environments, Web Audio API sound synthesis, and a decoupled Django REST Framework backend.",
      category: "Creative 3D & Full Stack",
      technologies: ["Next.js 14", "React", "Three.js", "Framer Motion", "Django REST", "Docker"],
      thumbnail_url: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80",
      github_url: "https://github.com/AyushGora/swarm",
      live_url: "http://localhost:3000",
      featured: true
    }
  ],
  skills: [
    {
      id: 1,
      name: "Cloud & DevOps",
      slug: "cloud-devops",
      icon_name: "Cloud",
      description: "Infrastructure automation, containerization, cloud architectures, and CI/CD pipelines",
      skills: [
        { id: 1, name: "Git & GitHub", icon_name: "GitBranch", description: "Version control, branching workflows, pull requests" },
        { id: 2, name: "Linux Fundamentals", icon_name: "TerminalSquare", description: "Core OS operations, shell scripting, permission management" },
        { id: 3, name: "AWS", icon_name: "Cpu", description: "Cloud computing fundamentals, EC2 compute, IAM security, S3 storage" },
        { id: 4, name: "GCP (Google Cloud)", icon_name: "Cloud", description: "Cloud Community Days, Google Cloud Skills Boost & Arcade" },
        { id: 5, name: "Microsoft Azure", icon_name: "Layers", description: "Microsoft Learn and Azure cloud service architecture" },
        { id: 6, name: "Docker & Containerization", icon_name: "Container", description: "Application containerization, images, volumes" },
        { id: 7, name: "Kubernetes", icon_name: "Boxes", description: "Container orchestration exploring and cluster basics" },
        { id: 8, name: "CI/CD Pipelines", icon_name: "Zap", description: "Automated build, test, and deployment workflows" },
      ]
    },
    {
      id: 2,
      name: "Programming & Web",
      slug: "programming-web",
      icon_name: "Code2",
      description: "Full-stack languages, relational databases, and modern frontend frameworks",
      skills: [
        { id: 9, name: "Python", icon_name: "Terminal", description: "Core programming, backend services, automation scripts" },
        { id: 10, name: "Java", icon_name: "FileCode", description: "Object-oriented programming, data structures, algorithms" },
        { id: 11, name: "SQL", icon_name: "Database", description: "Relational schemas, queries, data normalization" },
        { id: 12, name: "JavaScript", icon_name: "Code2", description: "Modern ES6+, asynchronous operations, DOM APIs" },
        { id: 13, name: "React.js", icon_name: "Atom", description: "Component architecture, hooks, reactive UI state" },
        { id: 14, name: "Node.js", icon_name: "Server", description: "Server-side JavaScript runtime & API integration" },
        { id: 15, name: "HTML & CSS", icon_name: "Palette", description: "Semantic markup, modern layout styling & Tailwind CSS" },
      ]
    },
    {
      id: 3,
      name: "AI & Development Tools",
      slug: "ai-tools",
      icon_name: "Cpu",
      description: "Local AI models, voice synthesizers, scientific computing, and microservices",
      skills: [
        { id: 16, name: "Ollama", icon_name: "Cpu", description: "Local LLM runner for private, offline model execution" },
        { id: 17, name: "OpenJarvis", icon_name: "TerminalSquare", description: "Local AI personal assistant & computer automation framework" },
        { id: 18, name: "Qwen 3.5 LLM", icon_name: "Network", description: "High-capability instruction model for private intelligence" },
        { id: 19, name: "Faster Whisper", icon_name: "Zap", description: "Optimized speech-to-text voice recognition engine" },
        { id: 20, name: "Kokoro TTS", icon_name: "Volume2", description: "Neural text-to-speech natural voice generation" },
        { id: 21, name: "NumPy & Matplotlib", icon_name: "Layers", description: "Numerical analysis, data processing, scientific visualization" },
        { id: 22, name: "FastAPI & Flask", icon_name: "Server", description: "High-speed Python REST APIs and microservice endpoints" },
      ]
    }
  ],
  education: [
    {
      id: 1,
      institution: "GNA University, Phagwara, Punjab",
      degree: "Bachelor of Technology (B.Tech) in Computer Science and Engineering",
      field_of_study: "Computer Science and Engineering",
      start_year: 2025,
      end_year: 2029,
      is_current: true,
      description: "Class of 2029. Focus on infrastructure automation, local AI deployment, software engineering, and cloud platforms."
    },
    {
      id: 2,
      institution: "Rainbow International School",
      degree: "Class XII (Senior Secondary)",
      field_of_study: "Science & Mathematics",
      start_year: 2024,
      end_year: 2025,
      is_current: false,
      description: "Higher secondary education with a strong analytical foundation in mathematics, physics, and computer science."
    },
    {
      id: 3,
      institution: "DAV Senior Secondary School",
      degree: "Class X (Secondary)",
      field_of_study: "General Sciences & Computing",
      start_year: 2022,
      end_year: 2023,
      is_current: false,
      description: "Secondary education with foundational training in mathematics, natural sciences, and computer literacy."
    }
  ],
  achievements: [
    {
      id: 1,
      title: "GNA Cyber Jungle (Shikar-E-Flag CTF)",
      category: "Hackathon & CTF",
      issuer: "GNA University",
      date_achieved: "2025–2026",
      description: "Competed in GNA Cyber Jungle Shikar-E-Flag Capture-the-Flag cybersecurity competition."
    },
    {
      id: 2,
      title: "Smart Campus & Student Life / SIH26089 (CoopServe)",
      category: "Hackathon Innovation",
      issuer: "Smart India Hackathon / University Selection",
      date_achieved: "2025–2026",
      description: "Selected for Smart Campus & Student Life problem statement; explored solutions for SIH26089 (CoopServe)."
    },
    {
      id: 3,
      title: "Google Developer Ecosystem (GDG Jalandhar)",
      category: "Developer Community",
      issuer: "GDG Jalandhar & Google Cloud",
      date_achieved: "2026",
      description: "Engaged with GDG Jalandhar; participated in DevFest Jalandhar 2026 and Cloud Community Days Chandigarh 2026. Actively completing Google Cloud Skills Boost / Arcade learning paths."
    },
    {
      id: 4,
      title: "Microsoft Student Ambassador Community Skiller",
      category: "Developer Community",
      issuer: "Microsoft Learn",
      date_achieved: "2025–2026",
      description: "Participating in Microsoft Learn student activities and the Microsoft Student Ambassador Community Skiller learning path."
    },
    {
      id: 5,
      title: "AWS Cloud Computing Fundamentals",
      category: "Certification Path",
      issuer: "AWS Training & Certification",
      date_achieved: "2025–Present",
      description: "Active learning path in foundational cloud compute, storage, networking, and security architecture."
    },
    {
      id: 6,
      title: "Docker & Containerization",
      category: "Certification Path",
      issuer: "DevOps Infrastructure Path",
      date_achieved: "2025–Present",
      description: "Active learning path in Docker containers, images, volume management, and multi-service development."
    }
  ]
};

// API Service Functions
export async function fetchProfile() {
  try {
    const response = await apiClient.get('/profile/');
    return response.data;
  } catch (err) {
    console.warn("Using fallback profile data:", err.message);
    return FALLBACK_DATA.profile;
  }
}

export async function fetchProjects() {
  try {
    const response = await apiClient.get('/projects/');
    return response.data;
  } catch (err) {
    console.warn("Using fallback projects data:", err.message);
    return FALLBACK_DATA.projects;
  }
}

export async function fetchSkills() {
  try {
    const response = await apiClient.get('/skills/');
    return response.data;
  } catch (err) {
    console.warn("Using fallback skills data:", err.message);
    return FALLBACK_DATA.skills;
  }
}

export async function fetchEducation() {
  try {
    const response = await apiClient.get('/education/');
    return response.data;
  } catch (err) {
    console.warn("Using fallback education data:", err.message);
    return FALLBACK_DATA.education;
  }
}

export async function fetchAchievements() {
  try {
    const response = await apiClient.get('/achievements/');
    return response.data;
  } catch (err) {
    console.warn("Using fallback achievements data:", err.message);
    return FALLBACK_DATA.achievements;
  }
}

export async function submitContactForm(payload) {
  const response = await apiClient.post('/contact/', payload);
  return response.data;
}

export default apiClient;
