import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('newsdb');
    const collection = db.collection('news');

    const news = await collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({
      success: true,
      count: news.length,
      news: news.map((item) => ({
        id: item._id.toString(),
        title: item.title,
        link: item.link,
        source: item.source,
        published: item.published,
        createdAt: item.createdAt,
      })),
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
