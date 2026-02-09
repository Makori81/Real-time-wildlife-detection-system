# process_videos.py - NOT training code!
from ultralytics import YOLO

def process_video():
    model = YOLO('best.pt')
    results = model('data/raw/hyenavid.webm', save=True)
    print(f"✅ Video processed: {results[0].save_dir}")

process_video()


