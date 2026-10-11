# 🎙️ HEATROUTE — 3-MINUTE HACKATHON DEMO MASTER PLAYBOOK & OBS SCRIPT
### Event: WeMakeDevs Bharat Build Tour | Track 02 — Heat & Water
### Target Duration: 02:45 – 02:55 (Strict Hard Ceiling: 03:00 / 180 Seconds)
### Formats Available:
- **PDF Playbook:** [HEATROUTE_DEMO_RECORDING_PLAYBOOK.pdf](file:///c:/Projects/Projects/Bharat%20Build%20Tour/HEATROUTE_DEMO_RECORDING_PLAYBOOK.pdf) (Print-ready, formatted table with timestamp badges)
- **Interactive App (Local):** `http://localhost:3005/`
- **Hosted Cloud App (AWS):** `https://main.d1n8kxpr67xo92.amplifyapp.com`

---

## 🛠️ PART 1: OBS STUDIO 5-MINUTE SETUP GUIDE

### 1. Video & Canvas Settings
- **Base (Canvas) Resolution:** `1920x1080`
- **Output (Scaled) Resolution:** `1920x1080` (Aspect Ratio: 16:9)
- **Downscale Filter:** Lanczos (Sharpened scaling, 36 samples)
- **Common FPS Value:** `30` or `60` FPS (Steady, no stutter)

### 2. Output & Recording Format
- **Output Mode:** Simple or Advanced
- **Recording Quality:** High Quality, Medium File Size (or Indistinguishable Quality)
- **Recording Format:** `MP4` or `MKV` *(If using MKV, enable "Automatically remux to mp4" in Settings > Advanced)*
- **Video Encoder:** Hardware Encoder (`NVIDIA NVENC H.264`, `AMD HW H.264`, or `Intel QuickSync`) to ensure 0% CPU strain while running the app.

### 3. Microphone Audio Filters (Right-click Mic/Aux > Filters in OBS)
Apply these 4 audio filters in order to make your voice sound like a studio podcast:
1. **Noise Suppression:** Method: `RNNoise (higher quality, more CPU)` — instantly removes PC fan hum, room echo, and air conditioning noise.
2. **Noise Gate:** Close Threshold: `-42 dB`, Open Threshold: `-35 dB` — cuts keyboard clicking when you are silent.
3. **Compressor:** Ratio: `3.00:1`, Threshold: `-18 dB`, Attack: `6 ms`, Release: `60 ms`, Output Gain: `+2.5 dB` — balances loud and quiet speaking parts so you are always clear.
4. **Limiter:** Threshold: `-1.5 dB`, Release: `60 ms` — prevents voice distortion when you speak with enthusiasm.

### 4. Browser Window Prep (Clean View)
1. Open Chrome/Edge at `http://localhost:3005/` (or the live Amplify URL).
2. Press **`F11`** (Fullscreen) to hide the Windows taskbar and browser URL/tab bar.
3. Make sure browser zoom is at **100%** (`Ctrl + 0`).
4. In OBS, add a **Window Capture** source pointing to your browser window. Check **"Capture Cursor: ON"**.
5. Set OBS Start/Stop recording hotkey to **`F9`**.

---

## ⏱️ PART 2: 3-MINUTE CHOREOGRAPHY & SPOKEN SCRIPT TABLE

| Timestamp | Act / Scene | 🖱️ On-Screen Action (What to Do) | 🎙️ Word-for-Word Spoken Script (What to Say) | 💡 Judge Rubric / Hook |
| :--- | :--- | :--- | :--- | :--- |
| **0:00 – 0:25** | **ACT 1: The Problem Hook** | • Center map on Connaught Place.<br/>• Move cursor slowly over top climate banner: highlight **43.5°C Air Temp** and red **59.8°C Heat Index Alert**. | *"During peak Indian summers, ambient temperatures routinely exceed 44 degrees Celsius. For delivery gig workers, daily commuters, and pedestrians walking to metro stations, standard navigation apps optimize purely for vehicular speed. They route vulnerable walkers through unshaded asphalt corridors where the perceived heat index crosses 58 degrees.<br/><br/>**Google Maps tells you the fastest way there; HeatRoute tells you the safest way there when heat kills.**"* | **Problem Clarity & Track Hook:** Immediately establishes why Google Maps fails pedestrians during extreme heatwaves. |
| **0:25 – 0:55** | **ACT 2: The Core Innovation (Canopy vs Asphalt)** | • Click **Barakhamba Road Direct** card (red/amber badge).<br/>• Click **Kasturba Gandhi Marg** card (emerald badge).<br/>• Hover over **65% Canopy** and **-22.4% Thermal Load** badge. | *"Here on our central Delhi testbed from Rajiv Chowk to Mandi House, Barakhamba Road is the shortest path, but exposes walkers to wide blacktop asphalt radiating extreme ground heat.<br/><br/>In contrast, HeatRoute’s microclimate engine evaluates Kasturba Gandhi Marg. By dynamically computing 65% tree canopy coverage and building shadows, it slashes thermal strain by 22.4% for a minor detour of just two and a half minutes."* | **Algorithmic Differentiator:** Clear evidence of trade-off: minor +2.5 min walk time for -22.4% heat stress. |
| **0:55 – 1:20** | **ACT 3: Safety-First Hard Filters** | • Scroll sidebar down slightly to show greyed-out **Vehicular Flyover Shortcut (REJECTED_UNSAFE)** card.<br/>• Hover over violation tooltip: *"Prohibited pedestrian highway"*. | *"Crucially, HeatRoute is grounded in real-world pedestrian reality. A vehicular expressway flyover shortcut might be mathematically shorter, but our Hard Safety Filter instantly disqualifies it because it lacks sidewalks and segregated pedestrian infrastructure.<br/><br/>Our hierarchy is strict: Safety first, thermal comfort second, travel speed third."* | **Real-World Rigor:** Shows safety constraints precede heat optimization. |
| **1:20 – 1:50** | **ACT 4: Diurnal Time-Travel (Moving Shadows)** | • Drag bottom time slider from **1:30 PM** back to **09:00 AM**.<br/>• Pause 1s, then smoothly slide forward to **05:00 PM**.<br/>• Point out changing solar altitude angle and route shade % updates. | *"Urban microclimates are not static. Watch our diurnal solar engine in action: as I adjust the departure time slider, our backend re-computes solar altitude and azimuth angles in real time.<br/><br/>Notice how at 5:00 PM, lengthening building shadows turn previously scorched streets into protected corridors. HeatRoute recalculates candidate routes to match the exact hour you walk."* | **Biometeorology & Solar Math:** Proves dynamic calculation rather than static pre-computed data. |
| **1:50 – 2:15** | **ACT 5: Track 02 Hydration & Recovery** | • Click **Water & Rest Stops** toggle on map.<br/>• Click a water droplet pin (e.g., **Delhi Jal Board Public Water Post** or **Bangla Sahib**).<br/>• Click **+ Add Route Waypoint** inside popup (polyline dynamically snaps to pitstop!). | *"Heat resilience requires active physical hydration. Fulfilling Track 02 requirements, HeatRoute integrates a verified network of municipal water kiosks, Delhi Jal Board posts, and community shelters like Gurudwara Bangla Sahib.<br/><br/>With one click, walkers can insert a verified drinking water stop directly into their walking route with automatic dwell-time adjustments."* | **Track 02 Core Delivery:** Directly answers the "Heat & Water" hackathon brief. |
| **2:15 – 2:40** | **ACT 6: Dual-Season Monsoon Inundation Mode** | • Click **Monsoon Flood** toggle in top header.<br/>• Theme shifts into storm mode.<br/>• Point to **Minto Sunken Underpass** being disqualified (1.8m flood hazard).<br/>• Show dry covered colonnade routing. | *"Climate vulnerability in Indian cities is dual-season: scorching heatwaves are followed by torrential monsoon downpours.<br/><br/>With a single toggle, HeatRoute activates Monsoon Flood Mode. It immediately flags waterlogged sunken underpasses—like Delhi's infamous Minto Bridge—and reroutes pedestrians through covered colonnades and elevated sidewalks with zero standing water."* | **Dual-Hazard Innovation:** Solves urban flooding and heat within one unified geospatial interface. |
| **2:40 – 2:55** | **ACT 7: AWS Architecture & Strong Closing** | • Click **AWS Telemetry** badge in top-right.<br/>• Modal displays Amazon Location Service, AWS Lambda Mangum, DynamoDB, and CloudWatch.<br/>• Rest cursor on HeatRoute brand. | *"Under the hood, HeatRoute is built cloud-native on AWS: Amazon Location Service streams dark vector navigation maps, AWS Lambda executes our thermal engine in milliseconds, DynamoDB stores verified water kiosks, and our frontend is hosted on AWS Amplify.<br/><br/>**HeatRoute: Built for the heat that dries the tap, and the monsoon that floods the street. Thank you!**"* | **Cloud Engineering & Memorable Close:** Clean architecture proof + crisp, punchy sign-off. |

---

## 🎙️ PART 3: PRO-TIPS FOR YOUR VOICE & PRESENTATION

1. **Pacing:** Speak at a confident, deliberate pace (~130–140 words per minute). Don't rush. The words are budgeted to leave 5 seconds of buffer before the 3:00 cutoff.
2. **Mouse Discipline:** Never shake or swirl your mouse erratically. Move your cursor smoothly to the element you are talking about, rest it there for 2 seconds, and then click.
3. **If You Stumble On a Word:** DO NOT start over from 0:00! Pause in silence for 2 seconds, take a breath, re-say that specific sentence cleanly, and keep going. You can either leave it as is or trim the 2-second silence in Windows Video Editor, Clipchamp, or CapCut in 30 seconds.
4. **Energy Level:** Sound like a founder presenting a revolutionary civic innovation to investors, not a student reading notes. Emphasize punchy phrases like:
   - *"Google Maps tells you the fastest way; HeatRoute tells you the safest way."*
   - *"Safety first, heat second, speed third."*
   - *"Built for the heat that dries the tap, and the monsoon that floods the street."*

---

## 📋 PART 4: HACKATHON SUBMISSION COPY-PASTE METADATA

When submitting on Devpost / the Hackathon portal:

- **Project Name:** `HeatRoute — Thermal-Aware Pedestrian Navigation & Microclimate Layer`
- **Short Tagline:** `Heat-aware pedestrian routing, solar microclimate intelligence, and hydration recovery layer for Indian cities, built on AWS.`
- **Track:** `Track 02: Heat & Water`
- **Live Demo Link:** `https://main.d1n8kxpr67xo92.amplifyapp.com`
- **GitHub Repository:** Provide your repository link.
- **AWS Services Implemented:**
  - `Amazon Location Service` — Dark vector basemap tiles & geospatial coordinates
  - `AWS Lambda (Python 3.11 + Mangum)` — Serverless thermal scoring & route optimization engine
  - `Amazon DynamoDB` — Storage & low-latency indexing of verified municipal water kiosks and cooling shelters
  - `Amazon CloudWatch` — Real-time telemetry monitoring `ThermalStressHoursAvoided` and flood hazards bypassed
  - `AWS Amplify` — Continuous deployment and global hosting of the frontend application
