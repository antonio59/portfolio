import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useState } from "react";
import { format } from "date-fns";
import { Calendar, User, Tag, Search, Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

// Define types for blog data
interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: number | null;
  featuredImage: string | null;
  tags: string[];
  publishDate: Date;
  status: string;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function BlogList() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  // Fetch blog posts and categories
  const { 
    data: posts = [], 
    isLoading: postsLoading,
    error: postsError
  } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog/posts"],
  });
  
  const { 
    data: categories = [], 
    isLoading: categoriesLoading 
  } = useQuery<BlogCategory[]>({
    queryKey: ["/api/blog/categories"],
  });

  // Format date helper function
  const formatDate = (date: Date) => {
    if (!date) return "";
    return format(new Date(date), "MMMM d, yyyy");
  };

  // Function to get category name by ID
  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return "Uncategorized";
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "Uncategorized";
  };

  // Filter posts based on search and category
  const filteredPosts = posts.filter(post => {
    const matchesSearch = search === "" || 
      post.title.toLowerCase().includes(search.toLowerCase()) || 
      post.excerpt.toLowerCase().includes(search.toLowerCase()) ||
      (post.tags && post.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())));
      
    const matchesCategory = categoryFilter === "all" || categoryFilter === "" || 
      (categoryFilter === "uncategorized" && !post.categoryId) ||
      (post.categoryId && post.categoryId.toString() === categoryFilter);
      
    return matchesSearch && matchesCategory;
  });

  // Show loading skeleton
  if (postsLoading || categoriesLoading) {
    return (
      <div className="container mx-auto py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">Blog</h1>
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <Skeleton className="h-10 flex-grow" />
            <Skeleton className="h-10 w-[150px]" />
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="mb-6">
              <Skeleton className="h-[250px] w-full mb-4" />
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show error message
  if (postsError) {
    return (
      <div className="container mx-auto py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">Blog</h1>
          <div className="bg-destructive/10 text-destructive p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Error Loading Blog Posts</h2>
            <p className="mb-4">We're having trouble loading the blog content. Please try again later.</p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate reading time (about 200 words per minute)
  const calculateReadingTime = (content: string): number => {
    const wordCount = content.replace(/<[^>]*>?/gm, '').split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    return readingTime;
  };
  
  return (
    <div className="container mx-auto py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">My thoughts on ... everything</h1>
          
          <p className="text-lg max-w-2xl mx-auto mb-6">
            I love writing about tech, programming, and life in general. I hope
            you will click on them by mistake. Here are a few of my latest
            articles. You can find more on my <Link href="/blog" className="text-primary hover:underline">blog page</Link>.
          </p>
        </div>
        
        {/* Search and filtering */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-[200px]">
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-full">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="All Categories" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="uncategorized">Uncategorized</SelectItem>
                {categories.map((category) => (
                  <SelectItem 
                    key={category.id} 
                    value={category.id.toString()}
                  >
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Blog posts */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">No Posts Found</h2>
            <p className="text-muted-foreground mb-4">
              {search || (categoryFilter && categoryFilter !== "all") 
                ? "Try a different search term or category filter."
                : "There are no blog posts published yet. Check back later!"}
            </p>
            {(search || (categoryFilter && categoryFilter !== "all")) && (
              <Button
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("all");
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post, index) => (
              <div key={post.id} className="flex border-b border-border pb-4 last:border-0">
                <Link href={`/blog/${post.slug}`} className="block w-full">
                  <div className="flex items-start gap-4">
                    {/* Post image */}
                    <div className="flex-shrink-0 w-16 h-16 overflow-hidden rounded-md border">
                      <img 
                        src={post.featuredImage || `/blog-placeholder-${(index % 4) + 1}.svg`} 
                        alt={post.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `/blog-placeholder-${(index % 4) + 1}.svg`;
                        }}
                      />
                    </div>
                    
                    {/* Post content */}
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between mb-1">
                        <h3 className="text-xl font-bold hover:text-primary transition-colors">{post.title}</h3>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">{calculateReadingTime(post.content)} mins read</span>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-2">
                        {formatDate(post.publishDate)}
                        {post.publishDate && ` (${Math.floor((new Date().getTime() - new Date(post.publishDate).getTime()) / (1000 * 60 * 60 * 24 * 30))}mo ago)`}
                      </div>
                      
                      <p className="text-muted-foreground line-clamp-2">
                        {post.excerpt || post.content.replace(/<[^>]*>?/gm, '').substring(0, 120) + '...'}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}