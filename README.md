# Personal News Dashboard

A production-ready news aggregator that fetches headlines from multiple RSS feeds, performs intelligent duplicate detection, and displays them in a beautiful dashboard with auto-refresh capabilities.

## Features

- **Multi-source RSS aggregation**: Fetches from Times of India, CNN, Rediff, and NDTV
- **Duplicate detection**: Uses text similarity algorithm (85% threshold) to filter duplicate headlines
- **MongoDB storage**: Stores unique news items with title, link, source, and timestamps
- **Auto-refresh**: Dashboard refreshes every 60 seconds automatically
- **Manual fetch**: Button to manually trigger news fetching
- **Responsive design**: Beautiful, modern UI built with shadcn/ui
- **Automated cron**: Vercel cron job fetches news every 10 minutes in production

## Tech Stack

- **Frontend**: React with Next.js 13 (App Router)
- **Backend**: Next.js API Routes
- **Database**: MongoDB (official Node.js driver)
- **Deployment**: Vercel
- **RSS Parsing**: rss-parser
- **Duplicate Detection**: string-similarity

## Folder Structure

```
.
├── app/
│   ├── api/
│   │   ├── fetch-news/
│   │   │   └── route.js          # Fetches RSS feeds, deduplicates, stores
│   │   └── news/
│   │       └── route.js          # Returns stored news items
│   ├── page.tsx                   # Main dashboard UI
│   ├── layout.tsx                 # Root layout
│   └── globals.css               # Global styles
├── lib/
│   └── mongodb.js                # MongoDB connection helper
├── components/
│   └── ui/                       # shadcn/ui components
├── .env.local                    # Environment variables (not in git)
├── .env.local.example            # Example env file
├── vercel.json                   # Vercel config with cron
├── package.json
└── README.md
```

## Local Development Setup

### Prerequisites

- Node.js 18+ installed
- MongoDB database (MongoDB Atlas free tier works great)
- npm or yarn package manager

### Step 1: Install Dependencies

The project already has all dependencies installed. If you need to reinstall:

```bash
npm install
```

### Step 2: Set Up MongoDB

1. Create a free MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier is sufficient)
3. Create a database user with read/write permissions
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

### Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your MongoDB connection string:

```env
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/newsdb?retryWrites=true&w=majority
```

### Step 4: Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Step 5: Fetch Your First News

1. Click the "Fetch Latest News" button in the dashboard
2. Wait a few seconds while it fetches from all RSS sources
3. The dashboard will display the unique news items
4. News auto-refreshes every 60 seconds

## API Routes

### GET /api/fetch-news

Fetches news from all RSS feeds, performs duplicate detection, and stores unique items.

**Response:**
```json
{
  "success": true,
  "inserted": 45,
  "message": "Successfully inserted 45 new unique news items"
}
```

### GET /api/news

Returns the latest 100 stored news items, ordered by newest first.

**Response:**
```json
{
  "success": true,
  "count": 87,
  "news": [
    {
      "id": "...",
      "title": "Breaking: Major Event Happens",
      "link": "https://...",
      "source": "CNN",
      "published": "2024-03-04T10:30:00.000Z",
      "createdAt": "2024-03-04T10:31:23.456Z"
    }
  ]
}
```

## Database Schema

**Collection**: `news` (in `newsdb` database)

```javascript
{
  _id: ObjectId,
  title: String,           // Original headline
  link: String,            // URL to the article
  source: String,          // "CNN", "NDTV", etc.
  published: Date,         // Publication date from RSS
  createdAt: Date         // When we stored it
}
```

## Duplicate Detection Logic

The system uses a sophisticated duplicate detection algorithm:

1. **Normalization**: Converts titles to lowercase, removes punctuation and extra spaces
2. **Similarity Comparison**: Uses Dice's coefficient string similarity
3. **Threshold**: 85% similarity is considered a duplicate
4. **Cross-source**: Compares across all sources and existing database entries
5. **Batch deduplication**: Also prevents duplicates within the same fetch batch

## Deployment to Vercel

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/news-dashboard.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: ./
   - **Build Command**: `next build` (default)
   - **Output Directory**: `.next` (default)

### Step 3: Add Environment Variables

In Vercel project settings:

1. Go to Settings → Environment Variables
2. Add `MONGODB_URI` with your MongoDB connection string
3. Make sure it's available for Production, Preview, and Development

### Step 4: Deploy

Click "Deploy" and wait for the build to complete.

### Step 5: Verify Cron Job

The `vercel.json` configuration automatically sets up a cron job that calls `/api/fetch-news` every 10 minutes.

To verify:
1. Go to your Vercel project dashboard
2. Navigate to Settings → Crons
3. You should see the cron job listed with schedule `*/10 * * * *`

## Cron Schedule Explanation

```json
{
  "schedule": "*/10 * * * *"
}
```

This runs every 10 minutes. Cron format: `minute hour day month weekday`

**Other schedule examples:**
- `*/5 * * * *` - Every 5 minutes
- `0 * * * *` - Every hour
- `0 */2 * * *` - Every 2 hours
- `0 0 * * *` - Once daily at midnight

## Testing

### Test Locally

```bash
# Fetch news manually
curl http://localhost:3000/api/fetch-news

# Get stored news
curl http://localhost:3000/api/news
```

### Test in Production

```bash
# Fetch news manually
curl https://your-app.vercel.app/api/fetch-news

# Get stored news
curl https://your-app.vercel.app/api/news
```

## Troubleshooting

### "Please add your MONGODB_URI to .env.local"

Make sure you've created `.env.local` with a valid MongoDB connection string.

### RSS Feed Not Loading

Some RSS feeds may have CORS restrictions or be temporarily unavailable. The app will continue to fetch from other sources.

### No News Showing

Click "Fetch Latest News" to populate the database for the first time.

### Vercel Cron Not Working

Cron jobs only work on Vercel Pro plans or higher. For free tier, you can:
- Use external services like cron-job.org to ping your endpoint
- Manually trigger fetches when you visit the dashboard

## Customization

### Add More RSS Feeds

Edit `app/api/fetch-news/route.js`:

```javascript
const RSS_FEEDS = [
  // Add your feeds here
  {
    name: 'Your Source Name',
    url: 'https://your-rss-feed-url.xml',
  },
];
```

### Change Duplicate Threshold

Edit the constant in `app/api/fetch-news/route.js`:

```javascript
const SIMILARITY_THRESHOLD = 0.85; // 85% similarity
```

Lower values (e.g., 0.70) will catch more duplicates but might filter unique stories.
Higher values (e.g., 0.95) will be more permissive.

### Adjust Auto-Refresh Interval

Edit `app/page.tsx`:

```javascript
const interval = setInterval(() => {
  fetchNews();
}, 60000); // 60000ms = 60 seconds
```

### Change Number of Displayed Articles

Edit `app/api/news/route.js`:

```javascript
.limit(100) // Change to your desired number
```

## License

MIT - Feel free to use for personal or commercial projects.

## Support

For issues or questions, please check:
1. MongoDB connection string is correct
2. Environment variables are properly set
3. RSS feeds are accessible from your server location

## Future Enhancements

Potential improvements you could add:
- User authentication
- Favorite/bookmark articles
- Category filtering
- Search functionality
- Email digest notifications
- More RSS sources
- Article content extraction
- Sentiment analysis
