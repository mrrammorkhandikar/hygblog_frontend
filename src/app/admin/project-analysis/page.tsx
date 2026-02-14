'use client';
import { useEffect, useState } from 'react';
import { apiGet } from '../api';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, Eye, Heart, MessageCircle, Users, Package, BarChart3, Calendar, ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface DashboardAnalytics {
  overview: {
    totalPosts: number;
    publishedPosts: number;
    totalLikes: number;
    totalComments: number;
    totalSubscribers: number;
    totalProducts: number;
    estimatedVisits: number;
  };
  recentActivity: {
    posts: number;
    comments: number;
    likes: number;
    subscribers: number;
  };
  subscriberGrowth: {
    total: number;
    recent: number;
    growth: number;
  };
  topBlogs: Array<{
    id: string;
    title: string;
    likes: number;
    comments: number;
    engagement: number;
  }>;
  blogPerformanceByCategory: { [key: string]: number };
  growthMetrics: {
    postGrowth: number;
    engagementGrowth: number;
  };
}

export default function ProjectAnalysis() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'blogs' | 'engagement' | 'growth'>('overview');

  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    if (!token) {
      router.push('/admin/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiGet<DashboardAnalytics>('/analytics/dashboard', token);
      setAnalytics(data);
    } catch (err: any) {
      console.error('Failed to load analytics:', err);
      setError('Failed to load analytics data. Please try again.');
      if (err.status === 401) {
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const StatCard = ({ title, value, icon: Icon, description, trend }: {
    title: string;
    value: number | string;
    icon: any;
    description?: string;
    trend?: number;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{typeof value === 'number' ? formatNumber(value) : value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend !== undefined && (
          <div className={`flex items-center text-xs mt-2 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? <ArrowUpIcon className="h-3 w-3 mr-1" /> : <ArrowDownIcon className="h-3 w-3 mr-1" />}
            {Math.abs(trend)}% from last month
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
        <p className="text-black text-center">Loading project analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <p className="text-red-700 font-medium">{error}</p>
          <button
            onClick={loadAnalytics}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) return null;

  // Prepare pie chart data for categories
  const categoryData = Object.entries(analytics.blogPerformanceByCategory).map(([category, count]) => ({
    name: category,
    value: count,
    percentage: Math.round((count / analytics.overview.publishedPosts) * 100)
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">Project Analysis</h1>
          <p className="text-muted-foreground text-black">
            Comprehensive analytics and insights for your blog project
          </p>
        </div>
        <button
          onClick={loadAnalytics}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          Refresh Data
        </button>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="blogs">Blog Performance</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="growth">Growth Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-black">
            <StatCard
              title="Website Visits"
              value={analytics.overview.estimatedVisits}
              icon={Eye}
              description="Estimated monthly visits"
            />
            <StatCard
              title="Total Posts"
              value={analytics.overview.totalPosts}
              icon={BarChart3}
              description={`${analytics.overview.publishedPosts} published`}
            />
            <StatCard
              title="Subscribers"
              value={analytics.overview.totalSubscribers}
              icon={Users}
              description={`${analytics.subscriberGrowth.recent} new this week`}
            />
            <StatCard
              title="Products"
              value={analytics.overview.totalProducts}
              icon={Package}
              description="Available in store"
            />
          </div>

          {/* Engagement Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-black">
            <StatCard
              title="Total Likes"
              value={analytics.overview.totalLikes}
              icon={Heart}
              description="Across all posts"
            />
            <StatCard
              title="Total Comments"
              value={analytics.overview.totalComments}
              icon={MessageCircle}
              description="User engagement"
            />
            <StatCard
              title="Engagement Rate"
              value={`${analytics.overview.totalLikes + analytics.overview.totalComments > 0 ?
                Math.round(((analytics.overview.totalLikes + analytics.overview.totalComments) / analytics.overview.publishedPosts) * 100) / 100 : 0} per post`}
              icon={TrendingUp}
              description="Average engagement per published post"
            />
          </div>

          {/* Recent Activity */}
          <Card className='text-black'>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Activity (Last 30 Days)
              </CardTitle>
              <CardDescription>Activity metrics for the past month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">{analytics.recentActivity.posts}</div>
                  <div className="text-sm text-black">New Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">{analytics.recentActivity.likes}</div>
                  <div className="text-sm text-black">New Likes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">{analytics.recentActivity.comments}</div>
                  <div className="text-sm text-black">New Comments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">{analytics.recentActivity.subscribers}</div>
                  <div className="text-sm text-black">New Subscribers</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blog Performance Tab */}
        <TabsContent value="blogs" className="space-y-6">
          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Blog Distribution by Category</CardTitle>
              <CardDescription>How your published posts are distributed across categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryData.map((category) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{category.value} posts</span>
                      <Badge variant="secondary">{category.percentage}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Blogs */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Blogs</CardTitle>
              <CardDescription>Most engaging posts based on likes and comments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Likes</TableHead>
                    <TableHead>Comments</TableHead>
                    <TableHead>Total Engagement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.topBlogs.map((blog) => (
                    <TableRow key={blog.id}>
                      <TableCell className="font-medium max-w-xs truncate">{blog.title}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4 text-red-500" />
                          <span>{blog.likes}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-4 w-4 text-blue-500" />
                          <span>{blog.comments}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={blog.engagement > 10 ? "default" : "secondary"}>
                          {blog.engagement}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Engagement Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Overview</CardTitle>
                <CardDescription>Total engagement across your blog</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Likes</span>
                    <span className="font-bold text-black">{analytics.overview.totalLikes}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Comments</span>
                    <span className="font-bold text-black">{analytics.overview.totalComments}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2">
                    <span className="font-medium">Total Engagement</span>
                    <span className="font-bold text-black">
                      {analytics.overview.totalLikes + analytics.overview.totalComments}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-black">
                    <span>Average per Post</span>
                    <span>
                      {analytics.overview.publishedPosts > 0
                        ? Math.round((analytics.overview.totalLikes + analytics.overview.totalComments) / analytics.overview.publishedPosts * 10) / 10
                        : 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscriber Growth */}
            <Card>
              <CardHeader>
                <CardTitle>Subscriber Growth</CardTitle>
                <CardDescription>Newsletter subscriber statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Subscribers</span>
                    <span className="font-bold text-black">{analytics.subscriberGrowth.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>New This Week</span>
                    <span className="font-bold text-black">{analytics.subscriberGrowth.recent}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2">
                    <span>Growth Rate</span>
                    <span className={`font-bold text-black`}>
                      {analytics.subscriberGrowth.growth}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Growth Trends Tab */}
        <TabsContent value="growth" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Growth Metrics</CardTitle>
              <CardDescription>Key growth indicators for the past 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Content Growth</h4>
                  <div className="flex justify-between items-center">
                    <span>New Posts</span>
                    <span className="font-bold">{analytics.growthMetrics.postGrowth}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Published Rate</span>
                    <span className="font-bold">
                      {analytics.overview.totalPosts > 0
                        ? Math.round((analytics.overview.publishedPosts / analytics.overview.totalPosts) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Engagement Growth</h4>
                  <div className="flex justify-between items-center">
                    <span>New Engagement</span>
                    <span className="font-bold text-black">{analytics.growthMetrics.engagementGrowth}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Engagement Rate</span>
                    <span className="font-bold">
                      {analytics.recentActivity.posts > 0
                        ? Math.round(analytics.growthMetrics.engagementGrowth / analytics.recentActivity.posts)
                        : 0} per post
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
