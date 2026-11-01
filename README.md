# SmartAttend-AI 2.0 🎯

**SmartAttend-AI 2.0** is an enterprise-grade, AI-powered smart attendance system featuring live webcam facial recognition, 3D anti-spoofing and liveness verification, student profile enrollment, institutional analytics, automated attendance logs, and classroom session management.

---

## 🌟 Key Features

- **Live AI Biometric Kiosk**: Real-time webcam face detection with canvas HUD overlays (facial landmark mesh, bounding box, 3D orientation axis, confidence scores, and sound feedback).
- **Anti-Spoofing & Liveness Detection**: Verification to prevent 2D photo and phone-screen spoofing attacks.
- **Simulation & Test Engine**: 1-click test triggers for instant simulation of enrolled students, unregistered visitors, and spoof attacks.
- **Institutional Analytics Dashboard**: Turnout percentages, weekly attendance trends, department compliance benchmarking, and defaulter watchlist (<75% attendance threshold) with warning dispatching.
- **Student Directory & Biometric Enrollment**: Register student profiles with live optical face capture and feature embedding extraction.
- **Attendance Ledger**: Filterable attendance logs with cryptographic timestamping, manual status override capability, and 1-click CSV spreadsheet export or printable rosters.
- **Classroom Session Manager**: Start, schedule, and supervise active lectures linked directly to the biometric optical terminal.
- **AI Trend Forecaster**: Predictive insights on campus arrival clusters and attendance patterns.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS v4, Lucide Icons, Canvas Confetti
- **Audio Feedback**: Web Audio API Sound Synthesizer
- **Tooling**: Vite 6, Node.js

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/09-geet/SmartAttend-AI2.0.git
   cd SmartAttend-AI2.0
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

### Building for Production

```bash
npm run build
```

---

## 📄 License

MIT License. Built for modern academic and enterprise institutions.