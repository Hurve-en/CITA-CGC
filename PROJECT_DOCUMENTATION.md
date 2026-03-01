# CITA-CGC
AI-Powered Coral Reef Health Monitoring System

## 1. Overview
CITA-CGC is a web platform for community-driven coral reef monitoring in Cebu, Philippines. It combines AI image analysis, citizen reporting, interactive reef visualization, and bilingual assistant support to shorten the response time between reef damage detection and government action.

## 2. Problem Statement
Cebu is surrounded by world-class reef systems such as Moalboal, Malapascua, Pescador Island, and Mactan. These reefs support fisherfolk livelihoods and tourism, but they are under pressure from bleaching, illegal fishing, anchor damage, crown-of-thorns outbreaks, and rising sea temperatures.

The operational gap is timing:
- damage is seen in the field first by local communities
- reporting is fragmented and delayed
- official intervention often starts too late

There is no widely used, real-time, centralized reef health reporting workflow that is easy for local communities to use.

## 3. Solution Summary
CITA-CGC enables anyone with a phone camera to upload underwater reef photos and generate structured AI-assisted reef reports in seconds, then save and track them in a shared dashboard.

Core value:
- faster detection
- faster reporting
- more accessible marine monitoring
- better prioritization for LGUs and BFAR Region 7

## 4. How the System Works
Step 1: Upload
- A diver, fisherfolk member, or community volunteer uploads a reef photo.

Step 2: AI Analysis
- Gemini analyzes image content and returns:
- health score (0-100)
- status (Healthy / At Risk / Critical)
- bleaching percentage
- coral coverage estimate
- likely threat
- species clue (if visible)
- actionable recommendation

Step 3: Report Persistence
- The report is stored in Supabase (table + storage bucket).
- If cloud services are unavailable, local fallback storage preserves usability.

Step 4: Visualization and Action
- Reports appear in dashboard and reef views.
- Users and stakeholders monitor patterns and prioritize interventions.

## 5. Key Features
- AI reef image analysis (Gemini)
- ReefBot bilingual chatbot (English + Cebuano/Bisaya)
- Reports dashboard with delete and clear operations
- Reef map and overview feed
- Cebu marine fallback feed when user reports are unavailable

## 6. Target Users
- Fisherfolk
- Divers
- LGU coastal/environment offices
- BFAR Region 7 stakeholders
- Tourists and volunteers
- Researchers and student groups

## 7. Why AI in This Project
Manual monitoring is expert-heavy and slow. CITA-CGC lowers the barrier so communities can contribute consistent signals rapidly, while authorities receive structured data they can triage faster.

AI in CITA-CGC is assistive, not absolute:
- report output supports decision-making
- field validation remains important for enforcement and policy action

## 8. SDG Alignment
Primary alignment:
- SDG 14: Life Below Water

Contributions:
- ecosystem protection support
- community-powered scientific data collection
- better response timing for marine threats

## 9. Tech Stack
- Frontend: React + Vite + Tailwind utility usage
- AI: Google Gemini (analysis + chatbot)
- Backend/Data: Supabase (Postgres + Storage)
- Mapping: React Leaflet + OpenStreetMap
- Deployment target: Vercel

## 10. Data Sources and Reliability Notes
Primary operational source:
- User-submitted reef reports stored in Supabase

Fallback source:
- Open-Meteo Marine API (sea surface temperature signal)

Important note:
- Thermal fallback values are labeled as estimates and should not be interpreted as full ecological surveys.

## 11. Current Backend Flow
- `Analyze` page creates AI result object
- report + image are submitted via Supabase client
- report rows are saved in `reef_reports`
- image files are saved in `reef-photos` bucket
- reports pages read latest records and render metrics

## 12. Supabase Requirements
Use the provided SQL:
- `coralguard/SUPABASE_SETUP.sql`

It configures:
- `reef_reports` table
- indexes
- row-level security policies
- `reef-photos` bucket
- storage policies for select/insert/delete

## 13. Environment Variables
Required in `coralguard/.env`:
- `VITE_GEMINI_API_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Template:
- `coralguard/.env.example`

## 14. Local Development
1. Copy env template and set real values.
2. Run Supabase SQL setup.
3. Start app:
- `cd coralguard`
- `npm install`
- `npm run dev`

## 15. Impact Potential
- broader reef visibility across Cebu
- faster incident reporting cycle
- stronger community participation in conservation
- practical monitoring support for local agencies

## 16. Product Vision
CITA-CGC is designed to start in Cebu, then scale to other Philippine coastal communities with the same pattern:
- community capture
- AI-assisted triage
- structured reporting
- faster conservation response
