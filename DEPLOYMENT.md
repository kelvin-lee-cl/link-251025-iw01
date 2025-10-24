# 🚀 Render.com Deployment Guide

This guide will help you deploy your AI Storytelling Workshop to Render.com.

## 📋 Prerequisites

- GitHub account
- Render.com account
- API keys for DeepSeek and Recraft AI
- Firebase project with Firestore and Storage enabled

## 🔧 Step-by-Step Deployment

### 1. Prepare Your Environment Variables

Create a `.env` file in your project root with the following variables:

```bash
# Copy the template
cp env.template .env
```

Then edit `.env` with your actual values:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# API Keys
DEEPSEEK_API_KEY=your_deepseek_api_key_here
RECRAFT_API_KEY=your_recraft_api_key_here

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key_here
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
FIREBASE_APP_ID=your_app_id_here
FIREBASE_MEASUREMENT_ID=your_measurement_id_here

# Application Settings
APP_NAME=AI Storytelling Workshop
APP_VERSION=1.0.0
```

### 2. Deploy to Render.com

#### Option A: Using Render Dashboard (Recommended)

1. **Go to [render.com](https://render.com)** and sign up/login

2. **Click "New +"** → **"Web Service"**

3. **Connect your GitHub repository**:
   - Select your repository: `kelvin-lee-cl/link-251025-iw01`
   - Or fork it to your account first

4. **Configure the service**:
   - **Name**: `ai-storytelling-workshop`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `master`
   - **Root Directory**: Leave empty
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

5. **Set Environment Variables**:
   ```
   NODE_ENV=production
   PORT=3000
   DEEPSEEK_API_KEY=your_actual_deepseek_key
   RECRAFT_API_KEY=your_actual_recraft_key
   FIREBASE_API_KEY=your_actual_firebase_key
   FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   FIREBASE_APP_ID=your_app_id
   FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

6. **Click "Create Web Service"**

#### Option B: Using render.yaml (Advanced)

If you prefer using the `render.yaml` file:

1. **Fork the repository** to your GitHub account
2. **Connect to Render** and it will automatically detect the `render.yaml`
3. **Set your environment variables** in the Render dashboard

### 3. Configure Firebase Security Rules

After deployment, update your Firebase security rules:

#### Firestore Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /stories/{document} {
      allow read, write: if true;
    }
  }
}
```

#### Storage Rules:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /ai_generated/{allPaths=**} {
      allow read, write: if true;
    }
    match /gallery/{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

### 4. Test Your Deployment

1. **Wait for the build to complete** (usually 2-5 minutes)
2. **Visit your Render URL** (e.g., `https://ai-storytelling-workshop.onrender.com`)
3. **Test the features**:
   - Login with user ID 1-20, passcode 001-020
   - Generate an image in AI Art Studio
   - Create a story in Story Generator
   - View content in Teacher Dashboard

## 🔍 Troubleshooting

### Common Issues:

#### 1. **Build Fails**
- Check that all dependencies are in `package.json`
- Ensure `dotenv` is included in dependencies
- Check the build logs in Render dashboard

#### 2. **Environment Variables Not Working**
- Verify all environment variables are set in Render dashboard
- Check that variable names match exactly (case-sensitive)
- Restart the service after adding new variables

#### 3. **Firebase Connection Issues**
- Verify Firebase configuration in Render environment variables
- Check Firebase security rules
- Ensure Firestore and Storage are enabled in Firebase console

#### 4. **API Key Issues**
- Verify API keys are correct and active
- Check API quotas and billing
- Test API keys locally first

### Debug Commands:

```bash
# Check if environment variables are loaded
console.log('Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY ? 'Set' : 'Missing',
  RECRAFT_API_KEY: process.env.RECRAFT_API_KEY ? 'Set' : 'Missing'
});
```

## 📊 Monitoring

### Render Dashboard:
- **Logs**: View real-time application logs
- **Metrics**: Monitor CPU, memory, and response times
- **Deployments**: Track deployment history

### Application Health:
- **Health Check**: `GET /` should return 200
- **API Status**: Check `/api/generate-image` and `/api/generate-text`
- **Firebase**: Verify database and storage connections

## 🔄 Updates and Maintenance

### Updating Your Application:

1. **Make changes** to your code
2. **Commit and push** to GitHub
3. **Render auto-deploys** from your repository
4. **Monitor the deployment** in Render dashboard

### Scaling:

- **Free Tier**: 750 hours/month, sleeps after 15 minutes of inactivity
- **Paid Plans**: Always-on, better performance, custom domains

## 🎯 Production Checklist

- [ ] All environment variables configured
- [ ] Firebase security rules updated
- [ ] API keys tested and working
- [ ] Application accessible via Render URL
- [ ] All features working (login, image generation, story creation, gallery)
- [ ] Performance acceptable
- [ ] Error handling working
- [ ] Logs monitoring set up

## 🆘 Support

If you encounter issues:

1. **Check Render logs** in the dashboard
2. **Verify environment variables** are set correctly
3. **Test API keys** independently
4. **Check Firebase console** for errors
5. **Review this guide** for common solutions

## 🎉 Success!

Once deployed, your AI Storytelling Workshop will be available at your Render URL and ready for educational use!

**Example URL**: `https://ai-storytelling-workshop.onrender.com`
