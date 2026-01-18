# 🎮 VALOML | AI-Powered Scouting for Champions

<div align="center">

![Project Banner](https://via.placeholder.com/1200x400/0f172a/ff4655?text=VALOML+|+The+Tactical+Edge)

### **The Ultimate Automated Scouting Report Generator for Competitive VALORANT**

*Built for the Cloud9 x JetBrains Hackathon — Category 2*

---

[![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20FastAPI%20%7C%20Groq-blue)](https://nextjs.org/)
[![Powered By](https://img.shields.io/badge/Powered%20By-GRID%20Esports%20Data-red)](https://grid.gg/)
[![Built With](https://img.shields.io/badge/Built%20With-JetBrains%20%26%20Junie-purple)](https://www.jetbrains.com/)
[![License](https://img.shields.io/badge/License-GPL_v3-blue.svg)](LICENSE)

[🎯 Features](#-features--category-2-alignment) • [🏗️ Architecture](#️-architecture--tech-stack) • [🚀 Quick Start](#-quick-start) • [📊 Demo](#-demo)

</div>

---

## 🎯 The Problem

In modern Tier-1 VALORANT, teams have access to **mountains of data** — but transforming that data into **actionable intelligence** remains a time-consuming, manual process. Coaches spend **hours** reviewing VODs and spreadsheets to answer questions like:

> *"Where does aspas hold on Haven?"*  
> *"What's their pistol round win condition?"*  
> *"How do we exploit their weaknesses?"*

**ValoML solves this.** 

---

## 💡 The Solution

**ValoML** is a **military-grade tactical dashboard** that automates the entire scouting process. By fusing official **GRID Esports Data** with advanced **Machine Learning (K-Means clustering)** and **LLM Analysis (Llama 3.3 70B)**, we generate comprehensive match preparations in **seconds, not hours**.

### What Makes ValoML Different?

| Traditional Scouting | ValoML |
|:---:|:---:|
| ⏱️ Hours of VOD review | ⚡ Reports in ~15 seconds |
| 📊 Manual spreadsheet analysis | 🤖 AI-powered pattern recognition |
| 📝 Subjective player notes | 📈 Data-driven weakness scoring |
| 🎯 One analyst's perspective | 🧠 ML clustering + LLM synthesis |

---

## ✨ Features — Category 2 Alignment

ValoML directly addresses all **Category 2: Automated Scouting Report Generator** requirements:

### 📋 1. Automated Scouting Reports
*Instantly analyzes an opponent's last 10-20 matches to generate:*

- **📊 Map Veto Prediction** — Visualizes win rates and identifies permaban candidates
- **🎯 Threat Intel** — Key players with role badges (`[ FIRST BLOOD ]`, `[ ENTRY ]`, `[ ANCHOR ]`)
- **⚠️ Weakness Scanner** — Detects exploitable patterns with actionable recommendations

### 🧠 2. Machine Learning Engine
*Going beyond basic stats with real ML:*

- **Playstyle Clustering** — K-Means on agent compositions to classify teams (e.g., *"Aggressive Dual-Duelist"* vs *"Tactical Control"*)
- **Weakness Scoring** — Quantifies exploitability with a 0-100 score
- **Loss Correlation** — Identifies factors most strongly associated with defeats

### 💬 3. Tactical Chat Assistant
*AI analyst that understands your team and opponent:*

> **You:** *"How do we beat Fnatic on Lotus?"*  
> **ValoML:** *Returns specific strategies based on their recent losses and playstyle patterns*

### ⚔️ 4. Versus Mode & Predictions
*Head-to-head comparison with predictive modeling:*

- Weighted model considering **Map Pool Depth**, **Form**, and **First Blood %**
- Visual side-by-side stat comparison
- Win probability estimation

### 🏆 5. "How to Win" Insights *(Bonus Feature)*
*Not just data — actionable strategies:*

- AI-generated tactical recommendations
- Attack and defense exploitation strategies
- Key player targeting suggestions

---

## 🏗️ Architecture & Tech Stack

<div align="center">

```
┌─────────────────────────────────────────────────────────────────┐
│                     ValoML ARCHITECTURE                         │
└─────────────────────────────────────────────────────────────────┘

     ┌─────────────┐              ┌─────────────────────────────┐
     │   USER      │              │      GRID ESPORTS API       │
     │             │              │   (Official VCT Data)       │
     └──────┬──────┘              └────────────┬────────────────┘
            │                                   │
            ▼                                   ▼
┌───────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js 14)                      │
│   ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐    │
│   │  Tactical │  │   Player  │  │   Versus  │  │    Chat   │    │
│   │    HUD    │  │   Intel   │  │   Mode    │  │   Widget  │    │
│   └───────────┘  └───────────┘  └───────────┘  └───────────┘    │
└───────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌───────────────────────────────────────────────────────────────────┐
│                     BACKEND (FastAPI + Python)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │
│  │    Team     │  │   Player    │  │   Insight   │               │
│  │  Analyzer   │  │  Profiler   │  │  Generator  │               │
│  └─────────────┘  └─────────────┘  └─────────────┘               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │
│  │   K-Means   │  │  Weakness   │  │    Groq     │               │
│  │  Clusterer  │  │   Scorer    │  │ (Llama 3.3) │               │
│  └─────────────┘  └─────────────┘  └─────────────┘               │
└───────────────────────────────────────────────────────────────────┘
```

</div>

### Tech Stack Breakdown

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| **Frontend** | Next.js 14, Tailwind CSS, Framer Motion, Recharts | Tactical HUD interface with visualizations |
| **Backend** | Python (FastAPI), Pydantic | API orchestration and data processing |
| **AI/ML** | Groq (Llama 3.3 70B), scikit-learn | Natural language reports & pattern recognition |
| **Data** | GRID Esports API + Smart Caching | Official VCT data with fallback system |
| **MLOps** | MLflow, Prometheus, Grafana | Experiment tracking & production monitoring |
| **Deploy** | Docker Compose (5 services) | Production-ready containerization |

---

## 🔬 MLOps & Experiment Tracking

We don't just deploy models — we **track and monitor** them like a production ML system:

### MLflow Integration
- **Experiment Tracking** — Every K-Means training run logged with parameters and metrics
- **Model Versioning** — Models persisted with `joblib` and registered in MLflow
- **Silhouette Scores** — Cluster quality metrics tracked (achieving 0.99 with k=5)

### Production Monitoring
- **Prometheus Metrics** — API health, request counts, inference latency
- **Grafana Dashboards** — Real-time visualization of system performance
- **Health Checks** — Automated service health monitoring

---

## 🤖 Built with JetBrains & Junie

This project was developed entirely using the **JetBrains Ecosystem**, leveraging the power of **Junie (AI Coding Agent)** to accelerate development:

### IDEs Used
- **WebStorm** — Frontend development (Next.js, React)
- **PyCharm** — Backend development (FastAPI, ML)

### How Junie Helped

| Use Case | Contribution |
|:---------|:-------------|
| **Algorithm Optimization** | Junie helped refactor the K-Means clustering logic to handle sparse datasets efficiently |
| **Unit Testing** | Generated test cases for `WeaknessScorer` to ensure edge cases (0 matches) didn't crash the app |
| **Code Explanation** | Accelerated understanding of complex GRID JSON schemas |
| **Boilerplate Reduction** | Reduced repetitive coding time by ~40%, allowing focus on data science |

> *"Junie acted as our third teammate, reducing boilerplate coding time by ~40% and allowing us to focus on the data science."*

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **Python** 3.10+
- **Docker & Docker Compose** (recommended)
- **GRID API Key** — [Get one here](https://grid.gg/)
- **Groq API Key** — [Get one here](https://console.groq.com/)

### Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

> ⚠️ **Important Port Configuration:**
> - **Local development** (without Docker): Backend runs on port `8000`
> - **Docker deployment**: Backend exposed on port `8081`
> 
> Set `NEXT_PUBLIC_API_URL` accordingly:
> - Local: `http://localhost:8000`
> - Docker: `http://localhost:8081`
> - Cloud: `http://YOUR_SERVER_IP:8081`

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/yanou16/valo-machine-learning.git
cd valo-machine-learning

# Create environment file
cp .env.example .env
# Edit .env with your API keys and set:
# NEXT_PUBLIC_API_URL=http://localhost:8081

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend:  http://localhost:8081
# MLflow:   http://localhost:5000
# Grafana:  http://localhost:3001
```

### Option 2: Manual Setup (Development)

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set environment variables
export GRID_API_KEY="your_grid_api_key"
export GROQ_API_KEY="your_groq_api_key"

# Start the server (runs on port 8000)
uvicorn main:app --reload --port 8000
```

#### Frontend
```bash
cd frontend
npm install

# Set environment variable (port 8000 for local dev!)
export NEXT_PUBLIC_API_URL="http://localhost:8000"

# Start development server
npm run dev
```


---

## 📊 Demo

### Scouting Report Generation
1. Enter a team name (e.g., "Sentinels", "Fnatic", "LOUD")
2. Watch the tactical terminal process the data
3. Explore the interactive dashboard with:
   - Map win rates and veto suggestions
   - Player threat profiles
   - AI-generated strategic insights

### Versus Mode
1. Select two teams for head-to-head comparison
2. View side-by-side statistics
3. Get AI-powered win probability predictions

### Chat Assistant
1. Open the chat widget
2. Ask tactical questions about your analyzed team
3. Receive context-aware strategic advice

---

## 📁 Project Structure

```
valoml/
├── backend/
│   ├── analysis/          # ML modules (team_analyzer, ml_analyzer, etc.)
│   ├── clients/           # External API clients (GRID, Groq)
│   ├── routers/           # FastAPI endpoints
│   ├── models/            # Persisted ML models
│   └── main.py            # Application entry point
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js pages
│   │   ├── components/    # React components
│   │   └── context/       # State management
│   └── public/            # Static assets
├── ops/                   # Prometheus configuration
├── docker-compose.yml     # Multi-service orchestration
└── pipeline_documentation.ipynb  # ML pipeline walkthrough
```

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Cloud9 & JetBrains** — For hosting this incredible hackathon
- **GRID Esports** — For providing comprehensive VCT match data
- **Groq** — For lightning-fast LLM inference
- **The VALORANT Community** — For the passion that inspired this project

---

<div align="center">

**Made with ❤️ for the Cloud9 x JetBrains Hackathon 2026**

*Victory is Calculated.*

</div>