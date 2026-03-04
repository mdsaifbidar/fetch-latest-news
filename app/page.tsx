'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Newspaper, RefreshCw, Loader as Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

interface NewsItem {
  id: string;
  title: string;
  link: string;
  source: string;
  published: string;
  createdAt: string;
}

export default function NewsDashboard() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const { toast } = useToast();

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news');
      const data = await response.json();
      if (data.success) {
        setNews(data.news);
      }
    } catch (error) {
      console.error('Error loading news:', error);
      toast({
        title: 'Error',
        description: 'Failed to load news',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestNews = async () => {
    setFetching(true);
    try {
      const response = await fetch('/api/fetch-news');
      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: data.message,
        });
        await fetchNews();
      } else {
        throw new Error(data.error || 'Failed to fetch news');
      }
    } catch (error) {
      console.error('Error fetching latest news:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch latest news',
        variant: 'destructive',
      });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchNews();

    const interval = setInterval(() => {
      fetchNews();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  const getSourceColor = (source: string) => {
    const colors: { [key: string]: string } = {
      'The Times of India': 'bg-blue-100 text-blue-800',
      'CNN': 'bg-red-100 text-red-800',
      'Rediff': 'bg-green-100 text-green-800',
      'NDTV': 'bg-amber-100 text-amber-800',
    };
    return colors[source] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-3 rounded-lg">
                <Newspaper className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-900">
                  News Dashboard
                </h1>
                <p className="text-slate-600 mt-1">
                  Latest headlines from top sources
                </p>
              </div>
            </div>
            <Button
              onClick={fetchLatestNews}
              disabled={fetching}
              size="lg"
              className="bg-slate-900 hover:bg-slate-800"
            >
              {fetching ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Fetching...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Fetch Latest News
                </>
              )}
            </Button>
          </div>

          <Card className="bg-white shadow-sm border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-slate-600">
                    Auto-refresh every 60 seconds
                  </span>
                </div>
                <span className="text-slate-600 font-medium">
                  {news.length} articles loaded
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-slate-400" />
          </div>
        ) : news.length === 0 ? (
          <Card className="bg-white shadow-sm border-slate-200">
            <CardContent className="py-12 text-center">
              <Newspaper className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No news available
              </h3>
              <p className="text-slate-600 mb-6">
                Click the button above to fetch the latest news
              </p>
              <Button
                onClick={fetchLatestNews}
                disabled={fetching}
                className="bg-slate-900 hover:bg-slate-800"
              >
                {fetching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Fetch News Now
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {news.map((item) => (
              <Card
                key={item.id}
                className="bg-white shadow-sm border-slate-200 hover:shadow-md transition-shadow duration-200"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group"
                      >
                        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug mb-3">
                          {item.title}
                        </h3>
                      </a>
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge
                          className={`${getSourceColor(item.source)} font-medium`}
                        >
                          {item.source}
                        </Badge>
                        <span className="text-sm text-slate-500">
                          {formatDate(item.published)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
}
