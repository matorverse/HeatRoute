"""
Generate high-fidelity, submission-grade PDF for HeatRoute OBS Demo Recording Playbook.
Uses Playwright Chromium for pixel-perfect PDF rendering.
"""

import os
from playwright.sync_api import sync_playwright

OUTPUT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML_PATH = os.path.join(os.path.dirname(__file__), "demo_playbook.html")
PDF_PATH = os.path.join(OUTPUT_DIR, "HEATROUTE_DEMO_RECORDING_PLAYBOOK.pdf")

HTML_CONTENT = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>HeatRoute — 3-Minute Hackathon Demo Playbook & OBS Script</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

    @page {
      size: A4 portrait;
      margin: 14mm 12mm 14mm 12mm;
      @bottom-right {
        content: "Page " counter(page) " of " counter(pages);
        font-family: 'Inter', sans-serif;
        font-size: 8pt;
        color: #64748B;
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0F172A;
      background: #FFFFFF;
      font-size: 9.5pt;
      line-height: 1.45;
      -webkit-font-smoothing: antialiased;
    }

    .header-banner {
      border-bottom: 2px solid #0284C7;
      padding-bottom: 12px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .title-group h1 {
      font-size: 19pt;
      font-weight: 800;
      color: #0369A1;
      letter-spacing: -0.5px;
      line-height: 1.15;
    }

    .title-group h2 {
      font-size: 11pt;
      font-weight: 600;
      color: #334155;
      margin-top: 3px;
    }

    .meta-badges {
      text-align: right;
    }

    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .badge-primary { background: #E0F2FE; color: #0369A1; border: 1px solid #BAE6FD; }
    .badge-alert { background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; }
    .badge-aws { background: #FFFBEB; color: #D97706; border: 1px solid #FDE68A; }

    .section-title {
      font-size: 12pt;
      font-weight: 700;
      color: #0F172A;
      border-left: 3.5px solid #0284C7;
      padding-left: 8px;
      margin: 16px 0 10px 0;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      padding: 10px 12px;
      margin-bottom: 12px;
    }

    .card-title {
      font-weight: 700;
      font-size: 9.5pt;
      color: #0369A1;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .obs-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 12px;
    }

    .checklist-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 5px;
      font-size: 8.5pt;
      line-height: 1.35;
    }

    .check-box {
      width: 12px;
      height: 12px;
      border: 1.5px solid #0284C7;
      border-radius: 2px;
      margin-right: 7px;
      margin-top: 1px;
      flex-shrink: 0;
    }

    /* Timeline Table */
    table.timeline-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      margin-bottom: 14px;
    }

    table.timeline-table th {
      background: #0F172A;
      color: #FFFFFF;
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 7px 8px;
      text-align: left;
    }

    table.timeline-table td {
      border-bottom: 1px solid #E2E8F0;
      padding: 9px 8px;
      vertical-align: top;
      font-size: 8.8pt;
      line-height: 1.38;
    }

    table.timeline-table tr:nth-child(even) td {
      background: #F8FAFC;
    }

    .time-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8pt;
      font-weight: 700;
      background: #0284C7;
      color: #FFFFFF;
      padding: 2px 5px;
      border-radius: 3px;
      display: inline-block;
      white-space: nowrap;
    }

    .scene-title {
      font-weight: 700;
      color: #0F172A;
      font-size: 8.5pt;
      margin-top: 3px;
    }

    .action-box {
      background: #EFF6FF;
      border: 1px solid #DBEAFE;
      border-radius: 4px;
      padding: 5px 7px;
      font-size: 8.2pt;
      color: #1E40AF;
      font-weight: 500;
    }

    .action-icon {
      font-weight: 700;
      color: #2563EB;
    }

    .script-text {
      color: #0F172A;
      font-size: 9pt;
      line-height: 1.42;
    }

    .script-text em {
      font-style: normal;
      background: #FEF08A;
      font-weight: 600;
      padding: 0 2px;
      border-radius: 2px;
    }

    .script-text strong {
      font-weight: 700;
      color: #0369A1;
    }

    .judge-tag {
      font-size: 7.8pt;
      color: #059669;
      background: #ECFDF5;
      border: 1px solid #A7F3D0;
      padding: 2px 5px;
      border-radius: 3px;
      display: inline-block;
      margin-top: 4px;
      font-weight: 600;
    }

    .page-break {
      page-break-before: always;
    }

    .footer-note {
      margin-top: 10px;
      padding: 8px 10px;
      border-left: 3px solid #10B981;
      background: #ECFDF5;
      font-size: 8pt;
      color: #065F46;
      line-height: 1.35;
    }

    .code-pill {
      font-family: 'JetBrains Mono', monospace;
      background: #E2E8F0;
      padding: 1px 4px;
      border-radius: 3px;
      font-size: 7.8pt;
    }
  </style>
</head>
<body>

  <!-- PAGE 1: HEADER & OBS SETUP -->
  <div class="header-banner">
    <div class="title-group">
      <h1>HEATROUTE — DEMO RECORDING MASTER PLAYBOOK</h1>
      <h2>Bharat Build Tour · Track 02 (Heat & Water) · 3-Minute Video Production Guide</h2>
    </div>
    <div class="meta-badges">
      <div class="badge badge-primary">Target: 02:45 – 02:55</div><br/>
      <div class="badge badge-alert">Max Limit: 03:00</div><br/>
      <div class="badge badge-aws">AWS Cloud Native</div>
    </div>
  </div>

  <div class="section-title">Part 1: OBS Studio Master Configuration (5 Minutes to Set Up)</div>
  <div class="obs-grid">
    <div class="card">
      <div class="card-title">📹 OBS Video & Canvas Settings</div>
      <div class="checklist-item"><div class="check-box"></div><span><strong>Base & Output Resolution:</strong> 1920x1080 (16:9 Full HD).</span></div>
      <div class="checklist-item"><div class="check-box"></div><span><strong>Framerate:</strong> 30 FPS or 60 FPS (steady, no dropped frames).</span></div>
      <div class="checklist-item"><div class="check-box"></div><span><strong>Output Format:</strong> MP4 or MKV (with Auto-Remux to MP4 enabled in Advanced Settings).</span></div>
      <div class="checklist-item"><div class="check-box"></div><span><strong>Encoder:</strong> Hardware (NVENC / AMD / Intel QSV) or x264 Quality: CRF 18–20 (approx 6,000–8,000 Kbps).</span></div>
      <div class="checklist-item"><div class="check-box"></div><span><strong>Capture Source:</strong> <em>Window Capture</em> on Google Chrome / Edge (capture cursor ON, avoid messy desktop icons).</span></div>
    </div>

    <div class="card">
      <div class="card-title">🎙️ Microphone Audio Filter Chain (OBS)</div>
      <div class="checklist-item"><div class="check-box"></div><span><strong>Filter 1 — Noise Suppression:</strong> Method: <em>RNNoise</em> (good quality, removes fan & PC hum).</span></div>
      <div class="checklist-item"><div class="check-box"></div><span><strong>Filter 2 — Noise Gate:</strong> Close threshold: -42 dB, Open threshold: -35 dB (eliminates keyboard clicks).</span></div>
      <div class="checklist-item"><div class="check-box"></div><span><strong>Filter 3 — Compressor:</strong> Ratio: 3:1, Attack: 6ms, Release: 60ms (keeps voice consistently audible).</span></div>
      <div class="checklist-item"><div class="check-box"></div><span><strong>Filter 4 — Gain / Limiter:</strong> Limiter at -1.5 dB (prevents harsh distortion/peaking).</span></div>
      <div class="checklist-item"><div class="check-box"></div><span><strong>Mic Distance:</strong> 6 to 8 inches from mouth with pop filter or slight off-axis angle.</span></div>
    </div>
  </div>

  <div class="card">
    <div class="card-title">🚀 Browser Pre-Flight Checklist (1 Minute Before Hitting Record)</div>
    <div class="obs-grid" style="margin-bottom: 0;">
      <div>
        <div class="checklist-item"><div class="check-box"></div><span><strong>URL:</strong> Open <span class="code-pill">http://localhost:3005/</span> (or live Amplify URL) in Chrome/Brave/Edge.</span></div>
        <div class="checklist-item"><div class="check-box"></div><span><strong>Clean Screen:</strong> Press <span class="code-pill">F11</span> (Fullscreen) or hide bookmarks bar (<span class="code-pill">Ctrl+Shift+B</span>).</span></div>
        <div class="checklist-item"><div class="check-box"></div><span><strong>Zoom Level:</strong> Reset zoom to <strong>100%</strong> (<span class="code-pill">Ctrl+0</span>).</span></div>
      </div>
      <div>
        <div class="checklist-item"><div class="check-box"></div><span><strong>Initial State:</strong> Season = <strong>Peak Heatwave</strong>, Time = <strong>1:30 PM (Apex)</strong>, Corridor = <strong>Rajiv Chowk</strong>.</span></div>
        <div class="checklist-item"><div class="check-box"></div><span><strong>Audio Mute:</strong> Make sure system sounds/Slack/WhatsApp notifications are on Do Not Disturb.</span></div>
        <div class="checklist-item"><div class="check-box"></div><span><strong>Hotkeys:</strong> Set OBS Start/Stop Recording hotkey to <span class="code-pill">F9</span> or keep OBS on a second monitor.</span></div>
      </div>
    </div>
  </div>

  <div class="section-title">Part 2: 3-Minute Master Choreography & Spoken Script</div>
  <p style="font-size: 8.5pt; color: #475569; margin-bottom: 8px;">
    Follow this exact second-by-second timeline. Practice speaking at a measured, confident speed (~130 words per minute). The script is tuned to finish between <strong>2 minutes 45 seconds and 2 minutes 55 seconds</strong>.
  </p>

  <table class="timeline-table">
    <thead>
      <tr>
        <th style="width: 14%;">Timestamp</th>
        <th style="width: 28%;">On-Screen Actions (What You Do)</th>
        <th style="width: 44%;">Word-for-Word Spoken Script (What You Say)</th>
        <th style="width: 14%;">Judge Rubric</th>
      </tr>
    </thead>
    <tbody>
      <!-- ACT 1 -->
      <tr>
        <td>
          <span class="time-badge">0:00 – 0:25</span>
          <div class="scene-title">ACT 1: The Problem Hook</div>
        </td>
        <td>
          <div class="action-box">
            <span class="action-icon">🖱️ ACTION:</span><br/>
            Hover mouse slowly over the top climate banner:
            highlight <strong>43.5°C Air Temp</strong> and the flashing <strong>59.8°C Heat Index Red Alert</strong> badge. Keep map centered on Connaught Place.
          </div>
        </td>
        <td>
          <div class="script-text">
            "During peak Indian summers, ambient temperatures routinely exceed 44 degrees Celsius. For delivery gig workers, daily commuters, and pedestrians walking to metro stations, standard navigation apps optimize purely for <em>vehicular speed</em>. They route vulnerable walkers through unshaded asphalt corridors where the perceived heat index crosses 58 degrees.<br/><br/>
            <strong>Google Maps tells you the fastest way there; HeatRoute tells you the safest way there when heat kills.</strong>"
          </div>
        </td>
        <td>
          <div class="judge-tag">Problem Clarity</div><br/>
          <div class="judge-tag">Track Alignment</div>
        </td>
      </tr>

      <!-- ACT 2 -->
      <tr>
        <td>
          <span class="time-badge">0:25 – 0:55</span>
          <div class="scene-title">ACT 2: The Core Innovation</div>
        </td>
        <td>
          <div class="action-box">
            <span class="action-icon">🖱️ ACTION:</span><br/>
            1. Click <strong>Barakhamba Road Direct</strong> card (turns red/amber, high exposure).<br/>
            2. Click <strong>Kasturba Gandhi Marg</strong> or <strong>CP Colonnade</strong> card (turns green, shaded).<br/>
            3. Hover over <strong>65% Canopy</strong> and <strong>-22.4% Heat Exposure</strong> badge.
          </div>
        </td>
        <td>
          <div class="script-text">
            "Here on our central Delhi testbed from Rajiv Chowk to Mandi House, Barakhamba Road is the shortest path, but exposes walkers to wide blacktop asphalt radiating extreme ground heat.<br/><br/>
            In contrast, HeatRoute’s microclimate engine evaluates Kasturba Gandhi Marg. By dynamically computing <em>65% tree canopy coverage and building shadows</em>, it <strong>slashes thermal strain by 22.4%</strong> for a minor detour of just two and a half minutes."
          </div>
        </td>
        <td>
          <div class="judge-tag">Technical Depth</div><br/>
          <div class="judge-tag">Core Value Prop</div>
        </td>
      </tr>
    </tbody>
  </table>

  <!-- PAGE BREAK FOR CLEAN PRINTING -->
  <div class="page-break"></div>

  <div class="header-banner" style="margin-top: 6px;">
    <div class="title-group">
      <h2 style="font-size: 13pt; color: #0369A1;">HEATROUTE — 3-MINUTE DEMO SCRIPT (CONTINUED)</h2>
      <p style="font-size: 8.5pt; color: #64748B;">Acts 3 through 7 · Production Execution & Closing</p>
    </div>
    <div class="meta-badges">
      <div class="badge badge-primary">Acts 3 – 7</div>
    </div>
  </div>

  <table class="timeline-table">
    <thead>
      <tr>
        <th style="width: 14%;">Timestamp</th>
        <th style="width: 28%;">On-Screen Actions (What You Do)</th>
        <th style="width: 44%;">Word-for-Word Spoken Script (What You Say)</th>
        <th style="width: 14%;">Judge Rubric</th>
      </tr>
    </thead>
    <tbody>
      <!-- ACT 3 -->
      <tr>
        <td>
          <span class="time-badge">0:55 – 1:20</span>
          <div class="scene-title">ACT 3: Safety-First Hard Filters</div>
        </td>
        <td>
          <div class="action-box">
            <span class="action-icon">🖱️ ACTION:</span><br/>
            Scroll sidebar down slightly to show the greyed-out <strong>Vehicular Flyover Shortcut (REJECTED_UNSAFE)</strong> card. Hover over the red violation badge: <em>"Prohibited pedestrian highway"</em>.
          </div>
        </td>
        <td>
          <div class="script-text">
            "Crucially, HeatRoute is grounded in real-world pedestrian reality. A vehicular expressway flyover shortcut might be mathematically shorter, but our <em>Hard Safety Filter</em> instantly disqualifies it because it lacks sidewalks and segregated pedestrian infrastructure.<br/><br/>
            <strong>Our hierarchy is strict: Safety first, thermal comfort second, travel speed third.</strong>"
          </div>
        </td>
        <td>
          <div class="judge-tag">Algorithmic Rigor</div><br/>
          <div class="judge-tag">Real-World Safety</div>
        </td>
      </tr>

      <!-- ACT 4 -->
      <tr>
        <td>
          <span class="time-badge">1:20 – 1:50</span>
          <div class="scene-title">ACT 4: Diurnal Time-Travel</div>
        </td>
        <td>
          <div class="action-box">
            <span class="action-icon">🖱️ ACTION:</span><br/>
            1. Drag time slider at the bottom from <strong>1:30 PM</strong> backward to <strong>09:00 AM</strong>.<br/>
            2. Pause 1 second, then smoothly drag forward to <strong>05:00 PM</strong>.<br/>
            3. Point cursor to how solar altitude angles, route shade %, and advisory update in real time.
          </div>
        </td>
        <td>
          <div class="script-text">
            "Urban microclimates are not static. Watch our diurnal solar engine in action: as I adjust the departure time slider, our backend re-computes solar altitude and azimuth angles in real time.<br/><br/>
            Notice how at 5:00 PM, <em>lengthening building shadows</em> turn previously scorched streets into protected corridors. HeatRoute recalculates candidate routes to match the exact hour you walk."
          </div>
        </td>
        <td>
          <div class="judge-tag">Solar Geometry</div><br/>
          <div class="judge-tag">Dynamic UI Reactivity</div>
        </td>
      </tr>

      <!-- ACT 5 -->
      <tr>
        <td>
          <span class="time-badge">1:50 – 2:15</span>
          <div class="scene-title">ACT 5: Track 02 Hydration Layer</div>
        </td>
        <td>
          <div class="action-box">
            <span class="action-icon">🖱️ ACTION:</span><br/>
            1. Click <strong>Water & Rest Stops</strong> toggle button on the map (top-right of map).<br/>
            2. Click a water droplet pin on map (e.g., <strong>Delhi Jal Board Public Water Post</strong> or <strong>Bangla Sahib</strong>).<br/>
            3. Click <strong>+ Add Route Waypoint</strong> inside popup — show polyline snap to pitstop!
          </div>
        </td>
        <td>
          <div class="script-text">
            "Heat resilience requires active physical hydration. Fulfilling Track 02 requirements, HeatRoute integrates a verified network of municipal water kiosks, Delhi Jal Board posts, and community shelters like Gurudwara Bangla Sahib.<br/><br/>
            With one click, walkers can insert a verified drinking water stop directly into their walking route with automatic dwell-time adjustments."
          </div>
        </td>
        <td>
          <div class="judge-tag">Track 02 Core Feature</div><br/>
          <div class="judge-tag">Municipal GIS</div>
        </td>
      </tr>

      <!-- ACT 6 -->
      <tr>
        <td>
          <span class="time-badge">2:15 – 2:40</span>
          <div class="scene-title">ACT 6: Dual-Season Monsoon Mode</div>
        </td>
        <td>
          <div class="action-box">
            <span class="action-icon">🖱️ ACTION:</span><br/>
            1. In the header bar, click <strong>Monsoon Flood</strong> seasonal toggle.<br/>
            2. Notice interface switches to rain mode.<br/>
            3. Show <strong>Minto Road Sunken Underpass</strong> getting rejected with flood hazard warning (1.8m inundation).<br/>
            4. Show route rerouting via covered colonnades.
          </div>
        </td>
        <td>
          <div class="script-text">
            "Climate vulnerability in Indian cities is dual-season: scorching heatwaves are followed by torrential monsoon downpours.<br/><br/>
            With a single toggle, HeatRoute activates <em>Monsoon Flood Mode</em>. It immediately flags waterlogged sunken underpasses—like Delhi's infamous Minto Bridge—and reroutes pedestrians through covered colonnades and elevated sidewalks with zero standing water."
          </div>
        </td>
        <td>
          <div class="judge-tag">Dual-Hazard Innovation</div><br/>
          <div class="judge-tag">Disaster Resilience</div>
        </td>
      </tr>

      <!-- ACT 7 -->
      <tr>
        <td>
          <span class="time-badge">2:40 – 3:00</span>
          <div class="scene-title">ACT 7: AWS Architecture & Closing</div>
        </td>
        <td>
          <div class="action-box">
            <span class="action-icon">🖱️ ACTION:</span><br/>
            1. Click <strong>AWS Architecture Telemetry</strong> pill in top-right.<br/>
            2. Modal opens displaying Amazon Location Service, AWS Lambda Mangum, DynamoDB, and CloudWatch metrics.<br/>
            3. End with cursor on the bold HeatRoute logo.
          </div>
        </td>
        <td>
          <div class="script-text">
            "Under the hood, HeatRoute is built cloud-native on AWS: <em>Amazon Location Service</em> streams dark vector navigation maps, <em>AWS Lambda</em> executes our thermal engine in milliseconds, <em>DynamoDB</em> stores verified water kiosks, and our frontend is hosted on <em>AWS Amplify</em>.<br/><br/>
            <strong>HeatRoute: Built for the heat that dries the tap, and the monsoon that floods the street. Thank you!</strong>"
          </div>
        </td>
        <td>
          <div class="judge-tag">AWS Cloud Native</div><br/>
          <div class="judge-tag">Memorable Closing</div>
        </td>
      </tr>
    </tbody>
  </table>

  <!-- PAGE BREAK FOR REFERENCE CHEATSHEET -->
  <div class="page-break"></div>

  <div class="header-banner" style="margin-top: 6px;">
    <div class="title-group">
      <h2 style="font-size: 13pt; color: #0369A1;">PART 3: LIVE RECORDING SECRETS & SUBMISSION CHEATSHEET</h2>
      <p style="font-size: 8.5pt; color: #64748B;">Pro-Tips, Pronunciation Guide, and Hackathon Submission Fields</p>
    </div>
    <div class="meta-badges">
      <div class="badge badge-primary">Submission Kit</div>
    </div>
  </div>

  <div class="obs-grid">
    <div class="card">
      <div class="card-title">🎙️ Speaking & Vocal Delivery Rules</div>
      <div class="checklist-item"><div class="check-box"></div><span><strong>Energy Level:</strong> Sound excited and purposeful, not like you are reading off a paper. Lean slightly forward.</span></div>
      <div class="checklist-item"><div class="check-box"></div><span><strong>Pronunciation:</strong>
        <br/>• <em>Connaught Place:</em> "Kuh-NOT Place" (or CP).
        <br/>• <em>Mandi House:</em> "Mun-dee House".
        <br/>• <em>Barakhamba:</em> "Barah-kham-ba".
        <br/>• <em>Diurnal:</em> "Die-er-nuhl" (daily cycle of sun).
      </span></div>
      <div class="checklist-item"><div class="check-box"></div><span><strong>Mouse Movement:</strong> Move mouse deliberately. Never shake or circle the mouse rapidly. Hover over an element for at least 1.5 seconds so judges can read it.</span></div>
      <div class="checklist-item"><div class="check-box"></div><span><strong>If You Stumble:</strong> Don't restart from 0:00! Pause for 2 seconds in silence, re-say the sentence cleanly, and trim the 2 seconds out in a quick editor (like Clipchamp/CapCut) later if needed.</span></div>
    </div>

    <div class="card">
      <div class="card-title">📦 Hackathon Submission Metadata (Copy-Paste)</div>
      <div class="checklist-item"><span><strong>Project Title:</strong> HeatRoute — Thermal-Aware Pedestrian Navigation & Recovery Layer</span></div>
      <div class="checklist-item"><span><strong>Tagline:</strong> Heat-aware pedestrian routing and microclimate intelligence for Indian cities, built on AWS.</span></div>
      <div class="checklist-item"><span><strong>Track:</strong> Track 02 — Heat & Water (WeMakeDevs Bharat Build Tour)</span></div>
      <div class="checklist-item"><span><strong>Live Amplify URL:</strong> <span class="code-pill">https://main.d1n8kxpr67xo92.amplifyapp.com</span></span></div>
      <div class="checklist-item"><span><strong>AWS Services Used:</strong> Amazon Location Service, AWS Lambda, Amazon DynamoDB, Amazon CloudWatch, AWS Amplify.</span></div>
      <div class="checklist-item"><span><strong>Tech Stack:</strong> React + Vite, MapLibre GL JS, FastAPI (Python 3.11), Pydantic, Rothfusz Heat Index Equation.</span></div>
    </div>
  </div>

  <div class="card">
    <div class="card-title">⏱️ Recording Time Budget Table (Strict 3-Minute Limit)</div>
    <table style="width: 100%; font-size: 8.5pt; border-collapse: collapse;">
      <tr style="background: #F1F5F9; font-weight: 700;">
        <td style="padding: 5px;">Act #</td>
        <td style="padding: 5px;">Key Topic</td>
        <td style="padding: 5px;">Target Start</td>
        <td style="padding: 5px;">Target End</td>
        <td style="padding: 5px;">Duration</td>
      </tr>
      <tr><td style="padding: 4px;">Act 1</td><td>Problem Hook & Urban Heat Gap</td><td>0:00</td><td>0:25</td><td>25s</td></tr>
      <tr><td style="padding: 4px;">Act 2</td><td>Core Route Comparison (Canopy vs Asphalt)</td><td>0:25</td><td>0:55</td><td>30s</td></tr>
      <tr><td style="padding: 4px;">Act 3</td><td>Safety Filters & Disqualified Flyovers</td><td>0:55</td><td>1:20</td><td>25s</td></tr>
      <tr><td style="padding: 4px;">Act 4</td><td>Diurnal Sun Position & Shadow Shift</td><td>1:20</td><td>1:50</td><td>30s</td></tr>
      <tr><td style="padding: 4px;">Act 5</td><td>Track 02 Hydration POIs & Pitstop Waypoints</td><td>1:50</td><td>2:15</td><td>25s</td></tr>
      <tr><td style="padding: 4px;">Act 6</td><td>Monsoon Flood Mode (Minto Hazard)</td><td>2:15</td><td>2:40</td><td>25s</td></tr>
      <tr><td style="padding: 4px;">Act 7</td><td>AWS Cloud Architecture & Strong Closing</td><td>2:40</td><td>2:55</td><td>15s</td></tr>
      <tr style="background: #E0F2FE; font-weight: 700; color: #0369A1;">
        <td style="padding: 5px;" colspan="2">TOTAL RUNTIME</td>
        <td style="padding: 5px;">0:00</td>
        <td style="padding: 5px;">02:55</td>
        <td style="padding: 5px;">175s (Buffer: 5s under 3:00 max)</td>
      </tr>
    </table>
  </div>

  <div class="footer-note">
    <strong>💡 Final Golden Rule for Hackathon Submission:</strong> Evaluators review dozens of videos. The opening 20 seconds determine their interest, and the live demonstration of Track 02 (Hydration Waypoint + Monsoon Mode) guarantees full points on the challenge theme. Keep your energy high, hit your marks, and stop the recording at <strong>2:55</strong>!
  </div>

</body>
</html>
"""

def generate_pdf():
    print(f"Writing HTML playbook template to: {HTML_PATH}")
    with open(HTML_PATH, "w", encoding="utf-8") as f:
        f.write(HTML_CONTENT)

    print(f"Rendering high-quality printable PDF via Playwright...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_content(HTML_CONTENT, wait_until="networkidle")
        page.pdf(
            path=PDF_PATH,
            format="A4",
            print_background=True,
            margin={"top": "12mm", "bottom": "12mm", "left": "10mm", "right": "10mm"}
        )
        browser.close()

    if os.path.exists(PDF_PATH):
        file_size_kb = os.path.getsize(PDF_PATH) / 1024.0
        print(f"SUCCESS: PDF generated successfully at:\n{PDF_PATH} ({file_size_kb:.1f} KB)")
        return PDF_PATH
    else:
        raise RuntimeError("PDF generation failed: output file not found")

if __name__ == "__main__":
    generate_pdf()
