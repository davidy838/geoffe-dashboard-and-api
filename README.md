# Geoffe Dashboard Project

A full-stack application for calculating healthcare facility distances and costs, with separate backend and frontend deployments.

## Project Structure

```
geoffe-dashboard-and-api/
├── Backend/               # Flask API backend (deployed to Render)
│   ├── app.py            # Main Flask application
│   ├── api.py            # API routes and logic
│   ├── requirements.txt  # Python dependencies
│   ├── gunicorn.conf.py # Gunicorn configuration
│   ├── render.yaml      # Render deployment config
│   └── README.md        # Backend deployment instructions
├── Frontend/             # Frontend application (deployed to Vercel)
│   └── (frontend files will go here)
└── README.md             # This file
```

## Backend (Flask API)

The backend is a Flask API that provides endpoints for:

- Calculating distances between communities and clinics
- Merging community costs with encounter data
- Comprehensive cost analysis

**Deployment**: Render (Python Web Service)
**API Base URL**: `https://your-service-name.onrender.com/api`

### Key Endpoints

- `POST /api/calculate-distances-and-merge-costs` - Combined distance and cost calculation

## Frontend

The frontend will be a web application that:

- Provides a user interface for uploading CSV files
- Displays results and visualizations
- Interacts with the backend API

**Deployment**: Vercel
**Status**: Coming soon

## Development Workflow

1. **Backend Development**:

   - Work in the `Backend/` folder
   - Test locally with `cd Backend && python app.py`
   - Deploy to Render for production

2. **Frontend Development**:

   - Work in the `Frontend/` folder
   - Build and test locally
   - Deploy to Vercel for production

3. **API Integration**:
   - Frontend will make requests to the Render-deployed backend
   - CORS is enabled for cross-origin requests

## Getting Started

### Backend Setup

```bash
cd Backend
pip install -r requirements.txt
python app.py
```

### Frontend Setup

```bash
cd Frontend
# Frontend setup instructions will go here
```

## Deployment

- **Backend**: Automatically deploys to Render when you push to Git
- **Frontend**: Will deploy to Vercel when ready

## Contributing

1. Make changes in the appropriate folder (Backend or Frontend)
2. Test locally
3. Commit and push changes
4. Automatic deployment will handle the rest

## Notes

- Backend and frontend are completely separate and can be developed independently
- API endpoints are designed to work with any frontend framework
- CORS is enabled for development and production use
