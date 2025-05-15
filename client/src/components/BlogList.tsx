import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useState } from "react";
import { format } from "date-fns";
import { Calendar, User, Tag, Search, Filter, ChevronRight, ChevronDown, Mail, Share2 } from "lucide-react";

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
import { Separator } from "@/components/ui/separator";

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
  const [showAllCategories, setShowAllCategories] = useState(false);
  // Fetch real data from the API
  const { 
    data: posts = [], 
    isLoading: postsLoading,
    error: postsError
  } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog/posts"],
    enabled: true
  });
  
  const { 
    data: categories = [], 
    isLoading: categoriesLoading 
  } = useQuery<BlogCategory[]>({
    queryKey: ["/api/blog/categories"],
    enabled: true
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
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-14 w-3/4 mb-4 mx-auto" />
          <Skeleton className="h-6 w-2/4 mb-12 mx-auto" />
          
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-10 w-[200px]" />
            <Skeleton className="h-10 w-[150px]" />
          </div>
          
          {[...Array(3)].map((_, i) => (
            <div key={i} className="mb-12">
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/4 mb-6" />
              <Skeleton className="h-[300px] w-full mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-6" />
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
        <div className="max-w-4xl mx-auto text-center">
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
    <div className="bg-[#fafafa] min-h-screen">
      <div className="container mx-auto py-12">
        <div className="max-w-4xl mx-auto">
          {/* Blog Header - Substack style */}
          <div className="text-center mb-16 pt-8 md:pt-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">John's Coding Journal</h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Insights on self-hosted projects, development, and tech explorations
            </p>
            
            <div className="flex justify-center gap-4">
              <Button className="bg-black hover:bg-gray-800 text-white" size="lg">
                <Mail className="mr-2 h-4 w-4" /> Subscribe
              </Button>
              <Button variant="outline" size="lg">
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left sidebar */}
            <div className="md:col-span-1 order-2 md:order-1">
              <div className="sticky top-8">
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                  <h3 className="font-bold text-lg mb-4">About this blog</h3>
                  <p className="text-gray-600 mb-4">
                    I write about my experiences building and maintaining self-hosted applications, projects I'm working on, and technology insights.
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/">View Portfolio</Link>
                  </Button>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Categories</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowAllCategories(!showAllCategories)}
                      className="p-0 h-8 w-8"
                    >
                      {showAllCategories ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  <ul className="space-y-2">
                    <li>
                      <Button 
                        variant={categoryFilter === "all" ? "default" : "ghost"} 
                        className="w-full justify-start" 
                        onClick={() => setCategoryFilter("all")}
                      >
                        All Posts
                      </Button>
                    </li>
                    {categories.slice(0, showAllCategories ? categories.length : 3).map((category) => (
                      <li key={category.id}>
                        <Button 
                          variant={categoryFilter === category.id.toString() ? "default" : "ghost"} 
                          className="w-full justify-start" 
                          onClick={() => setCategoryFilter(category.id.toString())}
                        >
                          {category.name}
                        </Button>
                      </li>
                    ))}
                    {!showAllCategories && categories.length > 3 && (
                      <li>
                        <Button 
                          variant="link" 
                          className="w-full justify-start text-blue-600" 
                          onClick={() => setShowAllCategories(true)}
                        >
                          Show all ({categories.length})
                        </Button>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Main content */}
            <div className="md:col-span-2 order-1 md:order-2">
              {/* Search */}
              <div className="relative mb-8">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search posts..."
                  className="pl-10 bg-white"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              
              {/* Blog posts */}
              {filteredPosts.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                  <h2 className="text-xl font-semibold mb-2">No Posts Found</h2>
                  <p className="text-gray-500 mb-4">
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
                <div className="space-y-12">
                  {filteredPosts.map((post, index) => (
                    <Card key={post.id} className="border-0 shadow-sm overflow-hidden bg-white">
                      <Link href={`/blog/${post.slug}`} className="block">
                        <CardHeader className="p-6">
                          <div className="text-sm text-gray-500 mb-2 flex items-center">
                            <span className="mr-3">
                              {formatDate(post.publishDate)}
                            </span>
                            ·
                            <span className="mx-3">
                              {calculateReadingTime(post.content)} min read
                            </span>
                            {post.categoryId && (
                              <>
                                ·
                                <Badge variant="outline" className="ml-3">
                                  {getCategoryName(post.categoryId)}
                                </Badge>
                              </>
                            )}
                          </div>
                          
                          <CardTitle className="text-2xl font-bold hover:text-blue-600 transition-colors">
                            {post.title}
                          </CardTitle>
                          
                          <CardDescription className="text-base text-gray-600 mt-2">
                            {post.excerpt}
                          </CardDescription>
                        </CardHeader>
                        
                        {post.featuredImage && (
                          <div className="px-6">
                            <div className="w-full aspect-[16/9] rounded-lg overflow-hidden">
                              <img 
                                src={post.featuredImage} 
                                alt={post.title} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        )}
                        
                        <CardContent className="py-4 px-6">
                          <div className="line-clamp-3 text-gray-700">
                            {post.content.replace(/<[^>]*>?/gm, '')}
                          </div>
                        </CardContent>
                        
                        <CardFooter className="px-6 pb-6 pt-2 justify-between items-center">
                          <div className="flex gap-2 flex-wrap">
                            {post.tags && post.tags.slice(0, 3).map((tag, i) => (
                              <span key={i} className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                                {tag}
                              </span>
                            ))}
                            {post.tags && post.tags.length > 3 && (
                              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                                +{post.tags.length - 3} more
                              </span>
                            )}
                          </div>
                          
                          <Button variant="ghost" size="sm" className="text-blue-600 font-medium">
                            Read more <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Link>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}