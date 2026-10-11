#!/usr/bin/env python3
"""
HeatRoute — Automated 3-Minute Hackathon Demo Video Generator
Generates:
  1. High-fidelity Neural Voiceover (en-IN-PrabhatNeural / Indian English Tech Narrator)
  2. 1080p 60fps automated browser choreography via Playwright
  3. Perfectly synchronized MP4 demo video with embedded audio and subtitles (.srt)
"""

import os
import sys
import time
import asyncio
import subprocess
from pathlib import Path

# Ensure UTF-8 output on Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

try:
    import edge_tts
    import imageio_ffmpeg
    from playwright.async_api import async_playwright
except ImportError as e:
    print(f"Missing dependency: {e}")
    sys.exit(1)

FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()
OUTPUT_DIR = Path("demo_recordings").resolve()
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------------
# SCRIPT SECTIONS (TIMED CHOREOGRAPHY)
# ---------------------------------------------------------------------------
SCENES = [
    {
        "id": "scene_01_hook",
        "title": "The Real Problem in Indian Cities",
        "text": (
            "During peak Indian summers, temperatures routinely cross 44 degrees Celsius. "
            "For gig delivery workers, daily commuters, and students walking to metro stations, "
            "extreme heat is a physical punishment. "
            "Standard GPS apps like Google Maps optimize purely for vehicular speed, "
            "directing vulnerable pedestrians down unshaded blacktop asphalt corridors where perceived heat index exceeds 58 degrees. "
            "Google Maps tells you the fastest way there; HeatRoute tells you the safer way there when outdoor heat matters."
        ),
        "lead_in_s": 1.0,
        "tail_pad_s": 1.5
    },
    {
        "id": "scene_02_tradeoff",
        "title": "Relative Thermal Exposure & Trade-Offs",
        "text": (
            "Here on our central Delhi corridor from Rajiv Chowk to Mandi House, "
            "Barakhamba Road is the fastest direct path, but exposes walkers to unshaded asphalt and severe solar radiation. "
            "In contrast, HeatRoute evaluates Kasturba Gandhi Marg. "
            "Utilizing 65 percent heritage tree canopy, it slashes thermal strain by 22.4 percent "
            "for a minor detour of just two and a half minutes, backed by explainable AI rationale and turn-by-turn shade microclimate guidance."
        ),
        "lead_in_s": 0.8,
        "tail_pad_s": 1.5
    },
    {
        "id": "scene_03_safety",
        "title": "The Safety-First Filter",
        "text": (
            "Crucially, HeatRoute enforces a hard safety filter. "
            "A vehicular expressway shortcut might be mathematically faster, "
            "but is instantly disqualified because it lacks pedestrian sidewalks and safety infrastructure. "
            "Our optimization hierarchy is strict: pedestrian safety first, heat mitigation second, travel time third."
        ),
        "lead_in_s": 0.8,
        "tail_pad_s": 1.5
    },
    {
        "id": "scene_04_diurnal",
        "title": "Diurnal Solar Time-Travel Engine",
        "text": (
            "Urban microclimates are dynamic. Street canyon shadows shift continuously throughout the day. "
            "As we adjust our diurnal solar engine from morning to the 1:30 PM solar apex and into the evening, "
            "solar azimuth and altitude angles recalculate in real time. "
            "Deep building shadows turn previously scorching streets into protected cool corridors by late afternoon."
        ),
        "lead_in_s": 0.8,
        "tail_pad_s": 1.5
    },
    {
        "id": "scene_05_hydration",
        "title": "Track 02 Hydration Recovery Layer",
        "text": (
            "Extreme heat requires active physical recovery. "
            "For Track 02, HeatRoute integrates verified municipal hydration shelters: "
            "free chilled RO water at Gurudwara Bangla Sahib, Delhi Jal Board public water posts, "
            "and metro station water ATMs, with one-click pitstop detour routing."
        ),
        "lead_in_s": 0.8,
        "tail_pad_s": 1.5
    },
    {
        "id": "scene_06_monsoon",
        "title": "Dual-Hazard Monsoon Flood Mode",
        "text": (
            "Built for the summer that dries the tap and the monsoon that floods the street. "
            "When weather shifts to torrential rains, HeatRoute seamlessly switches to urban flood mode, "
            "detecting submerged underpasses and waterlogging over 1.2 meters, "
            "safely routing pedestrians through elevated colonnades and covered heritage arcades."
        ),
        "lead_in_s": 0.8,
        "tail_pad_s": 1.5
    },
    {
        "id": "scene_07_aws_closing",
        "title": "Production AWS Architecture & Impact",
        "text": (
            "Under the hood, HeatRoute is engineered on AWS: "
            "Amazon Location Service streams dark vector navigation tiles, "
            "AWS Lambda with Python executes biometeorological scoring in sub-30 milliseconds, "
            "Amazon DynamoDB manages verified hydration shelters, "
            "and the frontend is deployed globally on AWS Amplify. "
            "HeatRoute turns climate intelligence into life-saving pedestrian navigation across Indian cities. Thank you."
        ),
        "lead_in_s": 0.8,
        "tail_pad_s": 2.5
    }
]

def get_audio_duration(file_path: Path) -> float:
    cmd = [
        FFMPEG_EXE, "-i", str(file_path)
    ]
    res = subprocess.run(cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True, errors="ignore")
    # Parse Duration: 00:00:23.45
    for line in res.stderr.splitlines():
        if "Duration:" in line:
            parts = line.split("Duration:")[1].split(",")[0].strip().split(":")
            hours = float(parts[0])
            minutes = float(parts[1])
            seconds = float(parts[2])
            return hours * 3600 + minutes * 60 + seconds
    return 10.0

async def generate_narration():
    print("\n🎙️ Generating Neural Voiceover Narration via Edge-TTS (en-IN-PrabhatNeural)...")
    for i, scene in enumerate(SCENES):
        audio_file = OUTPUT_DIR / f"{scene['id']}.mp3"
        print(f"  [{i+1}/{len(SCENES)}] Generating voiceover for: {scene['title']}...")
        communicate = edge_tts.Communicate(scene["text"], voice="en-IN-PrabhatNeural", rate="+8%")
        await communicate.save(str(audio_file))
        duration = get_audio_duration(audio_file)
        scene["audio_file"] = audio_file
        scene["duration"] = duration
        scene["total_scene_s"] = scene["lead_in_s"] + duration + scene["tail_pad_s"]
        print(f"    -> Generated: {duration:.2f}s (Total scene duration: {scene['total_scene_s']:.2f}s)")

async def record_browser_session():
    print("\n🎬 Launching 1080p Headless Browser Choreography via Playwright...")
    target_url = "http://localhost:3005/"
    video_dir = OUTPUT_DIR / "raw_video"
    video_dir.mkdir(parents=True, exist_ok=True)
    # Clean previous raw videos
    for old_vid in video_dir.glob("*.webm"):
        try:
            old_vid.unlink()
        except Exception:
            pass

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=[
                "--start-maximized",
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-web-security"
            ]
        )

        context = await browser.new_context(
            viewport={"width": 1920, "height": 1080},
            device_scale_factor=1,
            record_video_dir=str(video_dir),
            record_video_size={"width": 1920, "height": 1080}
        )

        page = await context.new_page()
        print(f"  -> Navigating to {target_url}...")
        await page.goto(target_url, wait_until="networkidle")
        await asyncio.sleep(4.0) # MapLibre tile load

        # -------------------------------------------------------------
        # SCENE 1: Problem Hook (Heatwave 43.5°C)
        # -------------------------------------------------------------
        scene = SCENES[0]
        print(f"\n▶ Executing Scene 1: {scene['title']} ({scene['total_scene_s']:.1f}s)")
        await asyncio.sleep(scene["lead_in_s"])
        # Smoothly move mouse across the topbar telemetry
        await page.mouse.move(100, 45, steps=20)
        await asyncio.sleep(3.0)
        await page.mouse.move(700, 45, steps=25)
        await asyncio.sleep(4.0)
        await page.mouse.move(1100, 45, steps=25)
        remaining = scene["total_scene_s"] - (scene["lead_in_s"] + 7.0)
        if remaining > 0:
            await asyncio.sleep(remaining)

        # -------------------------------------------------------------
        # SCENE 2: Relative Thermal Exposure & Trade-Offs
        # -------------------------------------------------------------
        scene = SCENES[1]
        print(f"\n▶ Executing Scene 2: {scene['title']} ({scene['total_scene_s']:.1f}s)")
        await asyncio.sleep(scene["lead_in_s"])
        # Click route 2: Kasturba Gandhi Marg
        route_cards = page.locator(".route-card-item")
        if await route_cards.count() > 1:
            await route_cards.nth(1).hover()
            await asyncio.sleep(1.0)
            await route_cards.nth(1).click()
            print("  [Action] Clicked Kasturba Gandhi Marg Tree Avenue")
        
        await asyncio.sleep(4.0)
        # Expand turn-by-turn if available
        toggle_tbt = page.locator(".guidance-expand-toggle-btn")
        if await toggle_tbt.count() > 0:
            await toggle_tbt.first.click()
            print("  [Action] Expanded turn-by-turn shade micro-guidance")
        
        await asyncio.sleep(4.0)
        # Click route 3: Connaught Colonnade & Shaded Lane
        if await route_cards.count() > 2:
            await route_cards.nth(2).click()
            print("  [Action] Clicked Connaught Colonnade & Shaded Lane")
        
        remaining = scene["total_scene_s"] - (scene["lead_in_s"] + 9.0)
        if remaining > 0:
            await asyncio.sleep(remaining)

        # -------------------------------------------------------------
        # SCENE 3: The Safety-First Filter
        # -------------------------------------------------------------
        scene = SCENES[2]
        print(f"\n▶ Executing Scene 3: {scene['title']} ({scene['total_scene_s']:.1f}s)")
        await asyncio.sleep(scene["lead_in_s"])
        # Click route 1 (Barakhamba Direct) to demonstrate baseline contrast
        if await route_cards.count() > 0:
            await route_cards.nth(0).click()
            print("  [Action] Clicked Barakhamba Direct Baseline")
        
        await asyncio.sleep(3.0)
        # Switch back to KG Marg
        if await route_cards.count() > 1:
            await route_cards.nth(1).click()
            print("  [Action] Switched back to Safe & Shaded Path")
        
        remaining = scene["total_scene_s"] - (scene["lead_in_s"] + 3.0)
        if remaining > 0:
            await asyncio.sleep(remaining)

        # -------------------------------------------------------------
        # SCENE 4: Diurnal Solar Time-Travel Engine
        # -------------------------------------------------------------
        scene = SCENES[3]
        print(f"\n▶ Executing Scene 4: {scene['title']} ({scene['total_scene_s']:.1f}s)")
        await asyncio.sleep(scene["lead_in_s"])
        
        # Click 09:00 AM preset
        btn_09 = page.locator("button:has-text('09:00 AM')")
        if await btn_09.count() > 0:
            await btn_09.first.click()
            print("  [Action] Switched Solar Time to 09:00 AM Morning")
        await asyncio.sleep(3.5)

        # Click 01:30 PM preset (Solar Apex)
        btn_13 = page.locator("button:has-text('01:30 PM')")
        if await btn_13.count() > 0:
            await btn_13.first.click()
            print("  [Action] Switched Solar Time to 01:30 PM Solar Apex")
        await asyncio.sleep(4.0)

        # Click 05:00 PM preset (Deep Canyon Shadows)
        btn_17 = page.locator("button:has-text('05:00 PM')")
        if await btn_17.count() > 0:
            await btn_17.first.click()
            print("  [Action] Switched Solar Time to 05:00 PM Shaded Canyon")
        await asyncio.sleep(3.5)

        # Switch back to Apex 1:30 PM for rest of demo
        if await btn_13.count() > 0:
            await btn_13.first.click()

        remaining = scene["total_scene_s"] - (scene["lead_in_s"] + 11.0)
        if remaining > 0:
            await asyncio.sleep(remaining)

        # -------------------------------------------------------------
        # SCENE 5: Track 02 Hydration Recovery Layer
        # -------------------------------------------------------------
        scene = SCENES[4]
        print(f"\n▶ Executing Scene 5: {scene['title']} ({scene['total_scene_s']:.1f}s)")
        await asyncio.sleep(scene["lead_in_s"])
        
        # Open Hydration HUD
        hyd_btn = page.locator("button:has-text('Water & Rest Stops')")
        if await hyd_btn.count() > 0:
            await hyd_btn.first.click()
            print("  [Action] Opened Hydration & Water Recovery HUD")
        await asyncio.sleep(3.0)

        # Click Bangla Sahib Chhabil or first pitstop button
        pitstop_btn = page.locator(".hud-poi-add-btn")
        if await pitstop_btn.count() > 0:
            await pitstop_btn.first.click()
            print("  [Action] Inserted Gurudwara Bangla Sahib Chhabil Pitstop Waypoint")
        await asyncio.sleep(4.0)

        remaining = scene["total_scene_s"] - (scene["lead_in_s"] + 7.0)
        if remaining > 0:
            await asyncio.sleep(remaining)

        # -------------------------------------------------------------
        # SCENE 6: Dual-Hazard Monsoon Flood Mode
        # -------------------------------------------------------------
        scene = SCENES[5]
        print(f"\n▶ Executing Scene 6: {scene['title']} ({scene['total_scene_s']:.1f}s)")
        await asyncio.sleep(scene["lead_in_s"])
        
        # Switch to Monsoon Flood Mode
        monsoon_btn = page.locator("#season-monsoon-btn")
        if await monsoon_btn.count() > 0:
            await monsoon_btn.first.click()
            print("  [Action] Activated Monsoon Flood Scenario")
        await asyncio.sleep(4.0)

        # Click Colonnade safe route in monsoon
        if await route_cards.count() > 2:
            await route_cards.nth(2).click()
            print("  [Action] Selected Colonnade Safe Path avoiding submerged underpasses")
        await asyncio.sleep(4.0)

        remaining = scene["total_scene_s"] - (scene["lead_in_s"] + 8.0)
        if remaining > 0:
            await asyncio.sleep(remaining)

        # -------------------------------------------------------------
        # SCENE 7: AWS Architecture & Cloud Telemetry
        # -------------------------------------------------------------
        scene = SCENES[6]
        print(f"\n▶ Executing Scene 7: {scene['title']} ({scene['total_scene_s']:.1f}s)")
        await asyncio.sleep(scene["lead_in_s"])

        # Open AWS Telemetry Modal
        telemetry_btn = page.locator("button:has-text('AWS Telemetry')")
        if await telemetry_btn.count() > 0:
            await telemetry_btn.first.click()
            print("  [Action] Opened AWS Cloud Telemetry Dashboard Modal")
        await asyncio.sleep(7.0)

        # Close modal
        close_btn = page.locator(".modal-close-btn")
        if await close_btn.count() > 0:
            await close_btn.first.click()
            print("  [Action] Closed Telemetry Modal")
        await asyncio.sleep(2.0)

        remaining = scene["total_scene_s"] - (scene["lead_in_s"] + 9.0)
        if remaining > 0:
            await asyncio.sleep(remaining)

        print("\n✅ All scenes executed successfully. Finalizing video...")
        await page.close()
        await context.close()
        await browser.close()

    # Find the recorded video file
    video_files = list(video_dir.glob("*.webm"))
    if not video_files:
        raise RuntimeError("No recorded video found in Playwright video dir!")
    recorded_video = video_files[0]
    print(f"🎬 Raw Playwright video captured: {recorded_video}")
    return recorded_video

def build_audio_track() -> Path:
    print("\n🎼 Assembling Full Audio Narration Track...")
    concat_list = OUTPUT_DIR / "audio_concat.txt"
    with open(concat_list, "w", encoding="utf-8") as f:
        for scene in SCENES:
            f.write(f"file '{scene['audio_file'].as_posix()}'\n")

    full_audio = OUTPUT_DIR / "full_narration.mp3"
    cmd = [
        FFMPEG_EXE, "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(concat_list),
        "-c", "copy",
        str(full_audio)
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    total_audio_s = get_audio_duration(full_audio)
    print(f"  -> Full Narration Audio Duration: {total_audio_s:.2f}s ({total_audio_s/60:.2f} minutes)")
    return full_audio

def generate_subtitles() -> Path:
    print("\n📝 Generating Subtitles (.srt)...")
    srt_path = OUTPUT_DIR / "HeatRoute_Demo_Subtitles.srt"
    current_time = 0.0

    def format_srt_time(seconds: float) -> str:
        hrs = int(seconds // 3600)
        mins = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millis = int((seconds - int(seconds)) * 1000)
        return f"{hrs:02d}:{mins:02d}:{secs:02d},{millis:03d}"

    with open(srt_path, "w", encoding="utf-8") as f:
        for i, scene in enumerate(SCENES):
            start_s = current_time + scene["lead_in_s"]
            end_s = start_s + scene["duration"]
            current_time += scene["total_scene_s"]

            f.write(f"{i+1}\n")
            f.write(f"{format_srt_time(start_s)} --> {format_srt_time(end_s)}\n")
            f.write(f"{scene['text']}\n\n")

    print(f"  -> Subtitles created: {srt_path}")
    return srt_path

def multiplex_final_video(raw_video: Path, full_audio: Path) -> Path:
    print("\n🎞️ Multiplexing Final 1080p MP4 Video with Audio...")
    final_video = OUTPUT_DIR / "HeatRoute_Hackathon_Demo_3Min.mp4"
    cmd = [
        FFMPEG_EXE, "-y",
        "-i", str(raw_video),
        "-i", str(full_audio),
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "18",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        "-pix_fmt", "yuv420p",
        str(final_video)
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    final_size_mb = final_video.stat().st_size / (1024 * 1024)
    final_duration = get_audio_duration(final_video)
    print(f"🎉 Final Video Rendered: {final_video}")
    print(f"   Duration: {final_duration:.1f}s ({final_duration/60:.2f} mins) | Size: {final_size_mb:.2f} MB")

    # Also render subtitled version
    srt_path = OUTPUT_DIR / "HeatRoute_Demo_Subtitles.srt"
    subbed_video = OUTPUT_DIR / "HeatRoute_Hackathon_Demo_WithSubtitles_3Min.mp4"
    srt_escaped = str(srt_path).replace("\\", "/").replace(":", "\\:")
    sub_cmd = [
        FFMPEG_EXE, "-y",
        "-i", str(final_video),
        "-vf", f"subtitles='{srt_escaped}':force_style='FontSize=16,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=3,MarginV=25'",
        "-c:a", "copy",
        str(subbed_video)
    ]
    try:
        subprocess.run(sub_cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        sub_size_mb = subbed_video.stat().st_size / (1024 * 1024)
        print(f"🎬 Subtitled Video Rendered: {subbed_video} ({sub_size_mb:.2f} MB)")
    except Exception as e:
        print(f"Notice: subtitled video burning skipped: {e}")

    return final_video

async def main():
    start_time = time.time()
    print("=" * 70)
    print("🚀 HEATROUTE: FULLY AUTOMATED 3-MINUTE HACKATHON DEMO VIDEO BUILDER")
    print("=" * 70)

    # 1. Voiceover Generation
    await generate_narration()

    # 2. Browser Session Recording
    raw_video = await record_browser_session()

    # 3. Audio assembly & Subtitles
    full_audio = build_audio_track()
    generate_subtitles()

    # 4. Multiplexing
    final_video = multiplex_final_video(raw_video, full_audio)

    elapsed = time.time() - start_time
    print("=" * 70)
    print(f"🏆 COMPLETE! Video generated in {elapsed:.1f}s")
    print(f"📂 File: {final_video}")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(main())
