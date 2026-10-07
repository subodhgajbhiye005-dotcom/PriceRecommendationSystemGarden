# HyperX Price Recommendation System

A comprehensive price recommendation system with both Python (FastAPI) and Node.js backends, featuring a modern web interface and SQLite database.

## Features

- 🌱 Price recommendations based on user, gardener, and location data
- 📊 Machine learning models for demand forecasting and price optimization
- 💾 SQLite database for data persistence
- 🌐 Modern web interface with separate CSS and JavaScript files
- 🔄 RESTful APIs (both Python FastAPI and Node.js Express)
- 📱 Responsive design

## Project Structure

```
HyperX/
├── app.py                 # Python FastAPI server
├── server.js              # Node.js Express server
├── database_schema.sql    # SQLite database schema
├── price_recommendation.db # SQLite database file
├── static/
│   ├── styles.css         # CSS styles
│   └── script.js          # JavaScript functionality
├── data_sources/          # Data source modules
├── features/              # Feature engineering
├── models/                # ML models
├── decision_engine/       # Decision logic
├── requirements.txt       # Python dependencies
├── package.json           # Node.js dependencies
└── README.md             # This file
```

## Database Schema

The system uses SQLite with the following main tables:
- `users` - User information
- `gardeners` - Gardener/service provider data
- `locations` - Geographic location data
- `price_recommendations` - Historical recommendations
- `external_data_cache` - Cached external market data
- `internal_data_cache` - Cached internal performance data

## Running the Application

### Option 1: Python FastAPI Server (Recommended for ML features)

```bash
# Install Python dependencies
pip install -r requirements.txt

# Run the FastAPI server
python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Access at: http://localhost:8000

### Option 2: Node.js Express Server (Lightweight API)

```bash
# Install Node.js dependencies
npm install

# Run the Node.js server
npm start
# or for development
npm run dev
```

Access at: http://localhost:3000

## Google OAuth Setup

To enable Google login functionality:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create an OAuth 2.0 Client ID
5. Set authorized redirect URIs to: `http://localhost:3000/auth/google/callback`
6. Copy the Client ID and Client Secret
7. Update the `.env` file with your credentials:
   ```
   GOOGLE_CLIENT_ID=your-actual-client-id
   GOOGLE_CLIENT_SECRET=your-actual-client-secret
   ```

## API Endpoints

### Python FastAPI
- `GET /` - Web interface
- `POST /price-recommendation` - Get price recommendation
- `GET /docs` - Interactive API documentation

### Node.js Express
- `GET /` - Web interface
- `GET /api/users` - Get all users
- `GET /api/gardeners` - Get all gardeners
- `POST /api/price-recommendation` - Get price recommendation
- `GET /api/recommendations` - Get recommendation history
- `GET /api/health` - Health check

## Web Interface

The web interface provides:
- Clean, responsive form for inputting user/gardener/location data
- Real-time price recommendations
- Loading states and error handling
- Mobile-friendly design

## Sample API Usage

```bash
# Python FastAPI
curl -X POST "http://localhost:8000/price-recommendation" \
     -H "Content-Type: application/json" \
     -d '{"user_id": 1, "gardener_id": 1, "location": "New York"}'

# Node.js Express
curl -X POST "http://localhost:3000/api/price-recommendation" \
     -H "Content-Type: application/json" \
     -d '{"user_id": 1, "gardener_id": 1, "location": "New York"}'
```

## Technologies Used

- **Backend**: Python FastAPI, Node.js Express
- **Database**: SQLite
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **ML**: Custom models for demand forecasting and price optimization
- **Deployment**: Uvicorn (Python), Native Node.js

## Development

To modify the web interface:
1. Edit `static/styles.css` for styling
2. Edit `static/script.js` for functionality
3. The HTML is served dynamically by the backend servers

## License

MIT License