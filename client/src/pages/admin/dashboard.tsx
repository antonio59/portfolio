/**
 * Admin Dashboard
 */

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FileText, Briefcase, Award, MessageSquare, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/components/admin/AdminLayout';
import { pb } from '@/lib/pocketbase';

export default function AdminDashboard() {
  // Get counts from PocketBase
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [blogPosts, projects, experiences, testimonials] = await Promise.all([
        pb.collection('blog_posts').getList(1, 1),
        pb.collection('projects').getList(1, 1),
        pb.collection('experiences').getList(1, 1),
        pb.collection('testimonials').getList(1, 1),
      ]);

      return {
        blogPosts: blogPosts.totalItems,
        projects: projects.totalItems,
        experiences: experiences.totalItems,
        testimonials: testimonials.totalItems,
      };
    },
  });

  const statCards = [
    {
      title: 'Blog Posts',
      value: stats?.blogPosts || 0,
      icon: FileText,
      description: 'Published articles',
      color: 'text-blue-500',
    },
    {
      title: 'Projects',
      value: stats?.projects || 0,
      icon: Briefcase,
      description: 'Portfolio projects',
      color: 'text-green-500',
    },
    {
      title: 'Experiences',
      value: stats?.experiences || 0,
      icon: Award,
      description: 'Work history',
      color: 'text-purple-500',
    },
    {
      title: 'Testimonials',
      value: stats?.testimonials || 0,
      icon: MessageSquare,
      description: 'Client feedback',
      color: 'text-orange-500',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here's an overview of your portfolio.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to manage your portfolio
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <a
              href="/admin/blog"
              className="flex items-center gap-3 rounded-lg border p-4 hover:bg-accent transition-colors"
            >
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">Write a Blog Post</p>
                <p className="text-sm text-muted-foreground">
                  Create new content with templates
                </p>
              </div>
            </a>
            <a
              href="/admin/projects"
              className="flex items-center gap-3 rounded-lg border p-4 hover:bg-accent transition-colors"
            >
              <Briefcase className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">Add a Project</p>
                <p className="text-sm text-muted-foreground">
                  Showcase your latest work
                </p>
              </div>
            </a>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
