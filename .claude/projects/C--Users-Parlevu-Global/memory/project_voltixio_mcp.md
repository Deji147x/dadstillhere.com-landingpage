---
name: voltixio-mcp project
description: VoltixIO custom MCP server — GHL credentials, pipeline stage IDs, and project status
type: project
---

Private GitHub repo: https://github.com/Deji147x/voltixio-mcp
Local path: C:/Users/Parlevu_Global/voltixio-mcp

## GHL Credentials
- GHL_API_KEY: pit-7f9e9ab3-77e2-4b95-9713-151e0ce78bf6
- GHL_LOCATION_ID: 8BlvEgHfpyevZboFrRry
- GHL_PIPELINE_ID: 2lRqOaimG91aKfBHBHww (pipeline name: "Delta Division")
- GHL_USER_ID: HPDiSjzLLDeNWJuZpjm6

## Pipeline Stages (Delta Division)
- New Lead:              dc30b314-dcb3-44d4-8360-063d48e15c7d
- AI Demo:               ee268dee-e27f-489c-9d30-d90d39a35e1b
- Booked Appt:           913ba190-7ea7-4981-a7fd-60ab3400c761
- Onboarding:            0c34f3ce-2e21-45e0-9546-d2adcc59cc82
- AI Follow Up Calendar: 595c2a2d-b206-4c74-92bd-7258187d20ea

## Build Status (as of 2026-03-23)
All src/ files built, dry run passed, README added, pushed to GitHub (commit b7039d7).
Server runs — "8 tools ready". Dry run confirmed pipeline boots end-to-end.
**Only blocker to go live: GOOGLE_PLACES_API_KEY** (SMTP + Twilio also needed for outreach/reports).
Continued next session.

**Why:** Lead gen automation MCP server that scrapes SMB leads via Google Places, enriches/scores them, pushes to GHL CRM "Delta Division" pipeline, and sends multi-channel outreach (email/SMS/WhatsApp/LinkedIn).
**How to apply:** Use these credentials when working on any voltixio-mcp files or GHL API calls.
