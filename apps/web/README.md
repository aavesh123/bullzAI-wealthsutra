# WealthSutra Frontend

SolidJS frontend application for WealthSutra AI Financial Planner MVP.

## Features

- Landing page with persona selection
- Dashboard with financial summary
- Plan generation and display
- Coach messages with personalized advice
- SMS simulation (browser mock + Android WebView bridge)

## Setup

```bash
npm install
npm run dev
```

The app will run on `http://localhost:3000`

## Environment Variables

Create a `.env` file (optional):

```
VITE_API_BASE_URL=http://localhost:4000/api
```

## Project Structure

- `src/routes/` - Page components
- `src/components/` - Reusable UI components
- `src/lib/` - API client, SMS bridge, mock data
- `src/store/` - Global state management
- `src/styles/` - Global styles

## Android WebView Integration

The app supports Android WebView via JS bridge:
- `window.AndroidInterface.requestSimulation(type)` - Request simulation from Android
- `window.handleSmsEvents(payload)` - Receive SMS events from Android

When Android bridge is not available, the app falls back to local mock data.

