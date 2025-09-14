# AI Visualizer - Render Deployment Guide

This guide will help you deploy the AI Visualizer application to Render for free.

## Prerequisites

1. A GitHub account with your AI Visualizer repository
2. A Render account (free tier available)
3. A Google Gemini API key (free tier available)

## Step 1: Get Your API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key for Gemini
3. Copy the API key (you'll need it for deployment)

## Step 2: Deploy to Render

### Deploy Backend Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the backend service:
   - **Name**: `ai-visualizer-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free

5. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `FRONTEND_URL`: `https://ai-visualizer-frontend.onrender.com` (update after frontend deployment)
   - `GEMINI_API_KEY`: `your_actual_gemini_api_key_here`
   - `JWT_SECRET`: `your-super-secret-jwt-key-change-in-production`

6. Click "Create Web Service"

### Deploy Frontend Service

1. In Render Dashboard, click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure the frontend service:
   - **Name**: `ai-visualizer-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/build`
   - **Plan**: Free

4. Add Environment Variables:
   - `REACT_APP_API_URL`: `https://ai-visualizer-backend.onrender.com` (update with your actual backend URL)

5. Click "Create Static Site"

## Step 3: Update URLs

After both services are deployed:

1. Note the URLs provided by Render:
   - Backend URL: `https://ai-visualizer-backend.onrender.com`
   - Frontend URL: `https://ai-visualizer-frontend.onrender.com`

2. Update the environment variables:
   - In backend service: Update `FRONTEND_URL` to your frontend URL
   - In frontend service: Update `REACT_APP_API_URL` to your backend URL

3. Redeploy both services

## Step 4: Access Your App

Your AI Visualizer will be available at your frontend URL (e.g., `https://ai-visualizer-frontend.onrender.com`)

## Important Notes

- **Free Tier Limitations**: Render's free tier has some limitations:
  - Services may sleep after 15 minutes of inactivity
  - Cold starts may take 30-60 seconds
  - Limited bandwidth and build minutes

- **API Key Security**: Never commit your actual API keys to the repository. Always use environment variables.

- **Database**: The app uses SQLite which will reset on each deployment. For production, consider using a persistent database.

## Troubleshooting

1. **Build Failures**: Check the build logs in Render dashboard
2. **CORS Issues**: Ensure `FRONTEND_URL` is correctly set in backend
3. **API Connection**: Verify `REACT_APP_API_URL` is correctly set in frontend
4. **Cold Starts**: First request after inactivity may be slow (normal for free tier)

## Cost

This deployment uses Render's free tier, which includes:
- 750 hours/month of service time
- 100GB bandwidth/month
- 500 build minutes/month

Perfect for development, testing, and small projects!
