# Quick Setup Guide

## 5-Minute Local Setup

### 1. Get MongoDB Connection String

**Option A: MongoDB Atlas (Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free (no credit card required)
3. Create a new cluster (M0 Free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster...`)

**Option B: Local MongoDB**
```bash
# Install MongoDB locally or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
# Connection string: mongodb://localhost:27017/newsdb
```

### 2. Configure Environment

```bash
# Create .env.local file
cp .env.local.example .env.local

# Edit .env.local and add your MongoDB URI
# MONGODB_URI=mongodb+srv://your_connection_string_here
```

### 3. Run the Application

```bash
# The packages are already installed
npm run dev
```

Open http://localhost:3000

### 4. Fetch Your First News

Click the "Fetch Latest News" button on the dashboard!

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Add environment variable:
   - Name: `MONGODB_URI`
   - Value: Your MongoDB connection string
5. Click "Deploy"

### 3. Verify Cron Job

The cron job is automatically configured in `vercel.json` to run every 10 minutes.

**Note**: Cron jobs require a Vercel Pro plan. On the free tier, news will only update when you manually click the button or visit the site.

## Folder Structure

```
app/
  ├── api/
  │   ├── fetch-news/route.js  # Fetches & stores news
  │   └── news/route.js         # Returns stored news
  └── page.tsx                   # Dashboard UI
lib/
  └── mongodb.js                 # MongoDB connection
vercel.json                      # Cron configuration
```

## Troubleshooting

**Build fails with "Please add your MONGODB_URI"**
- For local builds, create .env.local with a valid MongoDB URI
- For Vercel deployment, add the environment variable in project settings

**No news showing**
- Click "Fetch Latest News" to populate the database
- Check browser console for error messages

**RSS feeds timing out**
- Some feeds may be temporarily unavailable
- The app will continue with available feeds

## What's Next?

See README.md for:
- Detailed documentation
- API reference
- Customization options
- RSS feed configuration
- Database schema details
