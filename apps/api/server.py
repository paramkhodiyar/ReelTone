from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yt_dlp
import uuid
import os
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# Allow Next.js to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://reeltone-nine.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Use paths relative to the current script location to avoid issues on hosting providers
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DOWNLOAD_DIR = os.path.join(BASE_DIR, "downloads")
RINGTONE_DIR = os.path.join(BASE_DIR, "ringtones")
os.makedirs(DOWNLOAD_DIR, exist_ok=True)
os.makedirs(RINGTONE_DIR, exist_ok=True)

import re
from datetime import datetime

def clean_filename(text):
    # Remove special characters and keep it clean for filesystem
    clean = re.sub(r'[^\w\s-]', '', text).strip()
    return re.sub(r'[-\s]+', '_', clean)

@app.post("/download")
async def download(data: dict):
    url = data["url"]
    file_id = str(uuid.uuid4())
    out_path = f"{DOWNLOAD_DIR}/{file_id}"
    
    cookie_path = os.path.join(BASE_DIR, "cookies.txt")
    
    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": out_path,
        "postprocessors": [{
            "key": "FFmpegExtractAudio",
            "preferredcodec": "mp3",
            "preferredquality": "128",
        }],
        "quiet": True,
        "nocheckcertificate": True,
        "noplaylist": True,
        "concurrent_fragment_downloads": 10,
        "socket_timeout": 30,
        "geo_bypass": True,
        # Use cookies file if user has provided it
        "cookiefile": cookie_path if os.path.exists(cookie_path) else None,
        # Try to bypass bot detection by mimicking a real browser
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "extractor_args": {
            "youtube": {
                "player_client": ["android", "ios", "web"],
                "player_skip": ["webpage", "configs"],
            }
        }
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            title = info.get("title", "Unknown")
        
        return {"file": f"{file_id}.mp3", "title": title}
    except Exception as e:
        print(f"Download error: {str(e)}")
        # Raise proper HTTPException so Axios catches it in catch block
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/trim")
async def trim(data: dict):
    from pydub import AudioSegment
    
    filename = data["file"]
    start_sec = data["start"]
    end_sec = data["end"]
    title = data.get("title")
    
    input_path = os.path.join(DOWNLOAD_DIR, filename)
    
    if title and title != "Unknown":
        base_name = f"{clean_filename(title)}_Ringtone"
    else:
        date_str = datetime.now().strftime("%Y%m%d_%H%M")
        base_name = f"Ringtone_{date_str}"
        
    output_filename = f"{base_name}.mp3"
    
    # Check for duplicates and add suffix if needed
    counter = 1
    final_filename = output_filename
    while os.path.exists(os.path.join(RINGTONE_DIR, final_filename)):
        final_filename = f"{base_name}_{counter}.mp3"
        counter += 1
        
    output_path = os.path.join(RINGTONE_DIR, final_filename)
    
    audio = AudioSegment.from_file(input_path)
    trimmed = audio[start_sec * 1000 : end_sec * 1000]
    trimmed.export(output_path, format="mp3")
    
    return {"ringtone": final_filename}

@app.get("/library")
async def list_library():
    files = []
    if os.path.exists(RINGTONE_DIR):
        for f in os.listdir(RINGTONE_DIR):
            if f.endswith(".mp3"):
                files.append(f)
    return {"files": files}

app.mount("/files", StaticFiles(directory=DOWNLOAD_DIR), name="files")
app.mount("/ringtones", StaticFiles(directory=RINGTONE_DIR), name="ringtones")
