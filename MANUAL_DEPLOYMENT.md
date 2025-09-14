# Manual Render Deployment Guide

This guide will help you manually deploy your AI Visualizer to Render step by step.

## Prerequisites
- Google Gemini API Key
- Render account
- GitHub repository connected

## Step 1: Deploy Backend Service

### 1.1 Create Web Service
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Click "Connect a repository"
4. Select "AI-Visualizer" repository
5. Click "Connect"

### 1.2 Configure Backend
Fill in these exact settings:

```
Name: ai-visualizer-backend
Environment: Node
Region: Oregon (US West)
Branch: main
Root Directory: (leave empty)
Build Command: cd backend && npm install
Start Command: cd backend && npm start
```

### 1.3 Set Plan
- Select "Free" plan

### 1.4 Add Environment Variables
Click "Add Environment Variable" and add these one by one:

```
NODE_ENV = production
PORT = 10000
FRONTEND_URL = https://ai-visualizer-frontend.onrender.com
GEMINI_API_KEY = [your actual API key here]
JWT_SECRET = your-super-secret-jwt-key-change-in-production
```

### 1.5 Deploy
- Click "Create Web Service"
- Wait for deployment (5-10 minutes)
- **Copy the URL** (e.g., `https://ai-visualizer-backend.onrender.com`)

## Step 2: Deploy Frontend Service

### 2.1 Create Static Site
1. In Render dashboard, click "New +"
2. Select "Static Site"
3. Click "Connect a repository"
4. Select "AI-Visualizer" repository
5. Click "Connect"

### 2.2 Configure Frontend
Fill in these exact settings:

```
Name: ai-visualizer-frontend
Branch: main
Root Directory: (leave empty)
Build Command: cd frontend && npm install && npm run build
Publish Directory: frontend/build
```

### 2.3 Set Plan
- Select "Free" plan

### 2.4 Add Environment Variables
Click "Add Environment Variable" and add:

```
REACT_APP_API_URL = https://ai-visualizer-backend.onrender.com
```
(Use your actual backend URL from Step 1.5)

### 2.5 Deploy
- Click "Create Static Site"
- Wait for deployment (3-5 minutes)
- **Copy the URL** (e.g., `https://ai-visualizer-frontend.onrender.com`)

## Step 3: Update Environment Variables

### 3.1 Update Backend
1. Go to your backend service in Render dashboard
2. Click "Environment" tab
3. Update `FRONTEND_URL` to your actual frontend URL:
   ```
   FRONTEND_URL = https://ai-visualizer-frontend.onrender.com
   ```
4. Click "Save Changes"
5. Wait for redeployment

### 3.2 Update Frontend
1. Go to your frontend service in Render dashboard
2. Click "Environment" tab
3. Update `REACT_APP_API_URL` to your actual backend URL:
   ```
   REACT_APP_API_URL = https://ai-visualizer-backend.onrender.com
   ```
4. Click "Save Changes"
5. Wait for redeployment

## Step 4: Test Deployment

### 4.1 Test Backend
Visit: `https://your-backend-url.onrender.com/api/health`
You should see: `{"status":"OK","timestamp":"..."}`

### 4.2 Test Frontend
Visit: `https://your-frontend-url.onrender.com`
You should see your AI Visualizer app

### 4.3 Test Full App
- Try asking a question in the chat
- Check if the app loads properly
- Test creating new sessions

## Troubleshooting

### Backend Issues
- **"Cannot GET /api/health"**: Check if backend is deployed and running
- **Build failures**: Check build logs in Render dashboard
- **Environment variables**: Ensure all required variables are set

### Frontend Issues
- **"Frontend not found"**: Check if frontend is deployed and built successfully
- **API connection errors**: Verify `REACT_APP_API_URL` is correct
- **Build failures**: Check build logs for npm install/build errors

### Common Solutions
1. **Check service status**: Ensure both services show "Live" status
2. **View logs**: Check deployment and runtime logs in Render dashboard
3. **Redeploy**: Try redeploying if there are issues
4. **Environment variables**: Double-check all environment variables are set correctly

## Important Notes

- **Free tier limitations**: Services may sleep after 15 minutes of inactivity
- **Cold starts**: First request after sleep may take 30-60 seconds
- **Build time**: Free tier includes 500 build minutes/month
- **Bandwidth**: Free tier includes 100GB bandwidth/month

## Your URLs
After successful deployment, you'll have:
- **Backend**: `https://ai-visualizer-backend.onrender.com`
- **Frontend**: `https://ai-visualizer-frontend.onrender.com`
- **Main App**: Use the frontend URL to access your AI Visualizer
