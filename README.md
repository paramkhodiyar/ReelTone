# ReelTone 🎵

A local-first ringtone generator built with Next.js and FastAPI.

## 🚀 Getting Started

### Prerequisites

- Node.js & npm
- Python 3.10+
- FFmpeg (Required for audio processing)

### Installation

1. Install root dependencies:
   ```bash
   npm install
   ```

2. Install Frontend dependencies:
   ```bash
   cd apps/web && npm install
   ```

3. Setup Backend environment:
   ```bash
   cd apps/api
   python3 -m venv venv
   source venv/bin/activate
   pip install fastapi uvicorn yt-dlp pydub python-multipart
   ```

### Running the App

From the root directory, run:
```bash
npm run dev
```

This will start:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:8000

## 📱 Features

- **PWA Ready:** Works like a mobile app in your browser.
- **Easy Download:** Paste YouTube or Instagram links to fetch audio.
- **Visual Trimming:** Use the waveform to select the perfect part of the song.
- **Local First:** All your files stay on your machine.
- **Parent-Friendly:** Simple, large buttons and no complex settings.

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, Tailwind CSS 4, Framer Motion, WaveSurfer.js
- **Backend:** FastAPI, yt-dlp, pydub (FFmpeg)
