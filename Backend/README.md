# Geoffe Dashboard API - Backend

This folder contains the Flask API backend for the Geoffe Dashboard project.

## Project Structure

```
Backend/
├── app.py                 # Main Flask application
├── api.py                 # API routes and logic
├── requirements.txt       # Python dependencies
├── gunicorn.conf.py      # Gunicorn configuration
├── render.yaml           # Render deployment config
└── README.md            # This file
```

## API Endpoints

### POST /api/calculate-distances-and-merge-costs

Combined endpoint that calculates distances and merges costs in one operation.

**Required Files:**

- `community_file`: CSV with Title, Latitude, Longitude
- `clinic_file`: CSV with Facility, latitude, longitude
- `charlie_file`: CSV with community_name, age_group encounters
- `costs_file`: CSV with cost equations

## Deployment to Render

### Prerequisites

1. A Render account
2. Git repository with your code

### Deployment Steps

1. **Push your code to Git:**

   ```bash
   git add .
   git commit -m "Backend ready for Render deployment"
   git push origin main
   ```

2. **Connect to Render:**

   - Go to [render.com](https://render.com)
   - Sign in and click "New +"
   - Select "Web Service"
   - Connect your Git repository

3. **Configure the service:**

   - **Name**: `geoffe-dashboard-api` (or your preferred name)
   - **Environment**: `Python`
   - **Root Directory**: `Backend` (important!)
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Plan**: Free (or choose your preferred plan)

4. **Deploy:**
   - Click "Create Web Service"
   - Render will automatically build and deploy your application

### Environment Variables

The following environment variables are automatically set by Render:

- `PORT`: Port number (automatically managed)
- `PYTHON_VERSION`: Python version (set to 3.9.16)

### API URL

After deployment, your API will be available at:

```
https://your-service-name.onrender.com/api/calculate-distances-and-merge-costs
```

## Local Development

1. **Navigate to Backend folder:**

   ```bash
   cd Backend
   ```

2. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

3. **Run locally:**

   ```bash
   python app.py
   ```

4. **Test the API:**
   - The API will be available at `http://localhost:5000/api/calculate-distances-and-merge-costs`
   - Use tools like Postman or curl to test with CSV files

## Notes

- The API creates a `reports/` directory for output files
- All calculations are performed in memory and results are returned as CSV downloads
- The API supports multiple CSV encodings for robust file handling
- CORS is enabled for cross-origin requests
- This backend is designed to work with a separate frontend deployed on Vercel
