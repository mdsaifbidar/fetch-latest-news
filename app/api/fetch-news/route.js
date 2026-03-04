import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { compareTwoStrings } from 'string-similarity';
import clientPromise from '@/lib/mongodb';

const RSS_FEEDS = [
  {
    name: 'The Times of India',
    url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',
  },
  {
    name: 'CNN',
    url: 'http://rss.cnn.com/rss/edition.rss',
  },
  {
    name: 'Rediff',
    url: 'https://www.rediff.com/rss/newsrss.xml',
  },
  {
    name: 'NDTV',
    url: 'https://feeds.feedburner.com/ndtvnews-top-stories',
  },
];

const SIMILARITY_THRESHOLD = 0.85;

function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function isDuplicate(normalizedTitle, existingTitles) {
  for (const existingTitle of existingTitles) {
    const similarity = compareTwoStrings(normalizedTitle, existingTitle);
    if (similarity >= SIMILARITY_THRESHOLD) {
      return true;
    }
  }
  return false;
}

export async function GET() {
  try {
    const parser = new Parser({
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsAggregator/1.0)',
      },
    });

    const client = await clientPromise;
    const db = client.db('newsdb');
    const collection = db.collection('news');

    const existingNews = await collection
      .find({}, { projection: { title: 1 } })
      .toArray();
    const existingNormalizedTitles = existingNews.map((item) =>
      normalizeTitle(item.title)
    );

    const allNewsItems = [];

    for (const feed of RSS_FEEDS) {
      try {
        const feedData = await parser.parseURL(feed.url);

        for (const item of feedData.items) {
          if (item.title && item.link) {
            const normalizedTitle = normalizeTitle(item.title);

            const isAlreadyStored = await isDuplicate(
              normalizedTitle,
              existingNormalizedTitles
            );

            const isDuplicateInCurrentBatch = await isDuplicate(
              normalizedTitle,
              allNewsItems.map((n) => normalizeTitle(n.title))
            );

            if (!isAlreadyStored && !isDuplicateInCurrentBatch) {
              allNewsItems.push({
                title: item.title,
                link: item.link,
                source: feed.name,
                published: item.pubDate
                  ? new Date(item.pubDate)
                  : new Date(),
                createdAt: new Date(),
              });
              existingNormalizedTitles.push(normalizedTitle);
            }
          }
        }
      } catch (feedError) {
        console.error(`Error fetching ${feed.name}:`, feedError.message);
      }
    }

    let insertedCount = 0;
    if (allNewsItems.length > 0) {
      const result = await collection.insertMany(allNewsItems);
      insertedCount = result.insertedCount;
    }

    return NextResponse.json({
      success: true,
      inserted: insertedCount,
      message: `Successfully inserted ${insertedCount} new unique news items`,
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
