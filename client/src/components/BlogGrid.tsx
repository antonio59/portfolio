/**
 * Modern Blog Grid - Inspired by devwtf.in
 * Clean card-based layout with search and filters
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { format } from "date-fns";
import { Search, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  template?: string;
  status?: string;
  published_at?: string;
  created: string;
}

export default function BlogGrid() {
  const [search, setSearch] = useState("");

  // Fetch blog posts
  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { getBlogPosts } = await import("@/lib/pocketbase");
      return getBlogPosts();
    },
  });

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    if (!search) return true;
    return (
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Calculate reading time
  const calculateReadingTime = (content: string): number => {
    const wordCount = content.replace(/<[^>]*>?/gm, "").split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  };

  // Format date
  const formatDate = (date: string) => {
    if (!date) return "";
    return format(new Date(date), "MMM d, yyyy");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h1 className="text-5xl font-bold mb-4">Writing</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Thoughts on projects, AI, and technology
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg h-48 mb-4"></div>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              {search ? "No articles found matching your search." : "No articles yet. Check back soon!"}
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/blog/${post.slug}`}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                    <CardHeader className="space-y-3">
                      {/* Template Badge */}
                      {post.template && post.template !== "standard" && (
                        <Badge variant="secondary" className="w-fit capitalize">
                          {post.template.replace("_", " ")}
                        </Badge>
                      )}

                      {/* Title */}
                      <h2 className="text-2xl font-bold group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h2>

                      {/* Excerpt */}
                      {post.excerpt && (
                        <p className="text-muted-foreground line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                    </CardHeader>

                    <CardContent>
                      {/* Meta Info */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {calculateReadingTime(post.content)} min read
                        </div>
                        <span>•</span>
                        <span>{formatDate(post.published_at || post.created)}</span>
                      </div>
                    </CardContent>

                    <CardFooter>
                      <div className="flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                        Read more
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
