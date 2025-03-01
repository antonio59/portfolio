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

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Blog</h1>
        
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
          <div className="space-y-8">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden transition-all hover:shadow-md">
                <Link href={`/blog/${post.slug}`} className="block">
                    {post.featuredImage && (
                      <div className="w-full h-48 overflow-hidden">
                        <img 
                          src={post.featuredImage} 
                          alt={post.title} 
                          className="w-full h-full object-cover transition-transform hover:scale-105"
                        />
                      </div>
                    )}
                    
                    <CardHeader className={post.featuredImage ? "pt-4" : "pt-6"}>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">
                          {getCategoryName(post.categoryId)}
                        </Badge>
                        
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(post.publishDate)}
                        </span>
                      </div>
                      <CardTitle className="text-2xl hover:text-primary transition-colors">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 mt-2">
                        {post.excerpt}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="line-clamp-3 text-muted-foreground">
                        {/* Strip HTML tags for the content preview */}
                        {post.content.replace(/<[^>]*>?/gm, '').substring(0, 200)}...
                      </div>
                    </CardContent>
                    
                    <CardFooter className="flex justify-between items-center pt-0 pb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="h-3 w-3 mr-1" />
                        Admin
                      </div>
                      
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-end">
                          {post.tags.slice(0, 3).map((tag, i) => (
                            <span 
                              key={i} 
                              className="text-xs px-2 py-1 bg-muted rounded-full flex items-center"
                            >
                              <Tag className="h-2 w-2 mr-1" />
                              {tag}
                            </span>
                          ))}
                          {post.tags.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{post.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </CardFooter>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}