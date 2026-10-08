# HeatRoute ☀️ 💧
### *Thermal-Aware Pedestrian Navigation & Recovery Layer for Indian Cities*
**WeMakeDevs Bharat Builds Tour — Environmental Hacks**  
**Track 02 — Heat & Water**  
*“Too much water, too little of it, and the heat in between. Build for the monsoon that floods the street and the summer that dries the tap.”*

---

## 1. The Real-World Problem

During peak Indian summers, temperatures routinely cross 43°C to 46°C. For gig delivery riders, construction laborers, municipal workers, students, and pedestrians walking to metro stations, outdoor heat is not an inconvenience—it is a dangerous physical punishment.

Standard GPS navigation platforms (like Google Maps) optimize purely for **velocity, distance, and vehicular traffic**. They routinely recommend routes that send vulnerable pedestrians down 6-lane, unshaded blacktop asphalt corridors where ground surface emissions and direct solar radiation push perceived thermal stress above 58°C.

> **Google Maps tells you the fastest way there.**  
> **HeatRoute tells you the safer way there when outdoor heat matters.**

---

## 2. Core Positioning & Scientific Defense

HeatRoute is a **safety-constrained, explainable, thermal-aware pedestrian route optimization system**.

### The Non-Negotiable Scientific Principles:
1. **Relative Thermal Exposure (RTE) Over Fake Precision:**  
   HeatRoute never claims *"This road is exactly 39.4°C"*. We calculate explainable relative thermal exposure rankings across candidate routes with explicit confidence levels.
2. **Safety First $\to$ Heat Optimization Second $\to$ Travel-Time Third:**  
   A route through an unlit secluded alley or a vehicular expressway flyover without a sidewalk is **hard-filtered and disqualified in Phase 1**, regardless of how cool it may be.
3. **Detour Ceiling ($\le 25\%$):**  
   The coolest route must never require an absurd detour. Route trade-offs are strictly constrained to practical time additions (e.g., $+2.5 \text{ min walk} \to 24\text{–}32\% \text{ lower thermal strain}$).
4. **Time-Dependent Solar Geometry:**  
   Street canyon shadow geometry dynamically shifts as the sun's altitude and azimuth change. A route exposed at 1:30 PM can become heavily shaded by 4:45 PM.

---

## 3. Atmospheric & Biometeorological Formulation

### Base Heat Stress
$$\text{HI}_{base} = \text{Rothfusz}(T_{air}, \text{RH})$$

### Solar Geometry & Street Shadow Factor
Using astronomical solar vectors $(\theta_{sun}, \phi_{sun})$ and street axis bearing $\beta_i$:
$$S_i = \min\left(1.0, S_{canyon}(\text{Building } H/W, \Delta \theta) + S_{canopy}(\text{Trees}) + S_{structure}(\text{Colonnade})\right)$$

### Surface Thermal Re-Radiation
* **Blacktop Asphalt Roadway:** $+30\%$ thermal emission ($M = 1.30$)
* **Concrete Sidewalk:** $+10\%$ thermal emission ($M = 1.10$)
* **Covered Paver Arcades:** Neutral ($M = 0.95$)
* **Vegetated Park Trail:** $-30\%$ thermal relief ($M = 0.70$)

### Segment Thermal Exposure (STE)
$$\text{STE}_i = t_i \times \left[ 0.35 \cdot \text{HI}_{base} + \text{SolarLoad} \cdot (1 - S_i) \cdot \sin(\phi_{sun}) + \text{SurfaceHeat} - \text{WindRelief} \right]$$

---

## 4. Central Delhi Testbed: Microclimate Contrasts

The live demo focuses on the **Rajiv Chowk (Connaught Place) to Mandi House Metro Hub** corridor:
* **Barakhamba Road Direct (Fastest):** Direct arterial corridor with wide blacktop asphalt, low midday canopy, and high solar exposure ($877.3$ exposure points).
* **Kasturba Gandhi (KG) Marg (Balanced):** Dense heritage Neem and Peepal tree canopy ($68\text{–}75\%$ shade) slashing exposure by **$23.9\%$** for a minor $+3.3$ min walk.
* **Connaught Colonnade & Shaded Lane (Coolest):** $100\%$ covered heritage arcade walkways in CP blocking direct sun completely, delivering **$31.9\%$** lower thermal strain.
* **Expressway Flyover Shortcut (Rejected Unsafe):** Mathematically fastest (14.2 min), but **instantly disqualified** by the Safety Filter due to prohibited flyover classification without sidewalks.

---

## 5. Track 02 Integration: Hydration & Recovery Layer 💧

Extreme outdoor heat requires physical recovery. HeatRoute integrates active drinking water points directly into the journey:
* **Gurudwara Bangla Sahib Cold Water Chhabil:** 24x7 free chilled RO water & rest shelter.
* **Delhi Jal Board (DJB) Public Water Posts:** Municipal potable water on KG Marg.
* **Metro Water ATMs:** Rajiv Chowk Gate 2, Barakhamba, and Mandi House stations.
* **Central Park Shaded Cooling Pavilion:** Pergola shade and water misting fountains.

---

## 6. AWS Cloud Architecture

```text
               [ React + MapLibre GL Web Client ]
                               │
                               ▼
                    [ Amazon API Gateway ]
                               │
                               ▼
                 [ AWS Lambda (Python 3.11) ]
                 ├── Solar Geometry & Azimuth Engine
                 ├── Pedestrian Safety Rules Engine
                 └── Biometeorological RTE Scoring
                               │
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
   [ Amazon S3 ]       [ Amazon DynamoDB ]   [ Amazon CloudWatch ]
   - Fallback route    - Verified Hydration  - Metric: ThermalStress-
     cache GeoJSON       POIs (Pyaus, ATMs)    HoursAvoided (Telemetry)
   - 100% Demo Uptime  - Low latency lookup  - Lambda Execution Latency
```

### Demonstrable AWS Services:
* **AWS Lambda (Python 3.11 + Mangum):** Executes stateless biometeorological calculations at sub-30ms latency.
* **Amazon API Gateway:** Exposes managed REST endpoints with CORS and rate throttling.
* **Amazon DynamoDB:** Stores active hydration and rest recovery locations (`HeatRoute-Hydration-POIs`).
* **Amazon S3:** Hosts deterministic route fallback bundles ensuring the demo **never crashes** if network or external APIs drop.
* **Amazon CloudWatch:** Tracks cumulative community thermal stress hours avoided (`ThermalStressHoursAvoided`).
* **AWS SAM (`infra/template.yaml`):** Production Infrastructure-as-Code ready for automated cloud deployment.

---

## 7. Quick Start & Local Run

### Prerequisites
* Node.js v18+ & npm
* Python 3.10+

### 1. Start Backend API
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate   # On Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
API Documentation will be live at: `http://127.0.0.1:8000/docs`

### 2. Start Frontend UI
```bash
cd frontend
npm install
npm run dev
```
Interactive Web Application will be live at: `http://127.0.0.1:3000/`

---

## 8. 3-Minute Demo Sequence (For Judges)

1. **The Problem (0:00 - 0:25):** 44°C Delhi summer. Walking Rajiv Chowk to Mandi House at 1:30 PM.
2. **The Trade-Off (0:25 - 1:15):** Compare Fastest (Barakhamba asphalt, High Exposure) vs Balanced/Coolest (KG Marg tree canopy & CP colonnades saving $24\text{–}32\%$ heat strain).
3. **Safety Proof (1:15 - 1:30):** Show the 14-minute Flyover Shortcut rejected with violation warning: *“Prohibited pedestrian highway classification”*.
4. **The Solar Time-Travel Slider (1:30 - 2:05):** Drag slider from 1:30 PM to 4:45 PM. Show solar altitude drop and building canyon shadows automatically turning Barakhamba Road into Low Exposure.
5. **The Water Layer (2:05 - 2:30):** Toggle Hydration POIs (Bangla Sahib Chhabil, DJB kiosks, Metro water ATMs).
6. **AWS Infrastructure (2:30 - 3:00):** Open the AWS Telemetry modal showing live Lambda execution time, DynamoDB POIs, and CloudWatch heat-avoided counter.

---

## 9. Team & Track Submission
* **Event:** WeMakeDevs Bharat Builds Tour
* **Track:** Track 02 — Heat & Water
* **Project:** HeatRoute
