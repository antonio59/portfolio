import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight, Calendar, Tag } from "lucide-react";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  // Fetch blog posts and categories
  const { 
    data: posts, 
    isLoading: postsLoading 
  } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog/posts"],
  });

  const { 
    data: categories, 
    isLoading: categoriesLoading 
  } = useQuery<BlogCategory[]>({
    queryKey: ["/api/blog/categories"],
  });

  // Function to get category name by ID
  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId || !categories) return "Uncategorized";
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "Uncategorized";
  };

  // Function to format date
  const formatDate = (date: Date) => {
    if (!date) return "";
    return format(new Date(date), "MMMM d, yyyy");
  };

  if (postsLoading || categoriesLoading) {
    return (
      <div className="container mx-auto py-12">
        <h2 className="text-3xl font-bold mb-8">Blog</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="w-full h-[400px]">
              <CardHeader>
                <Skeleton className="h-5 w-1/3 mb-2" />
                <Skeleton className="h-8 w-2/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-28 w-full" />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-10 w-1/4" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // If there are no posts yet
  if (!posts || posts.length === 0) {
    return (
      <div className="container mx-auto py-12">
        <h2 className="text-3xl font-bold mb-8">Blog</h2>
        <Card className="w-full">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground py-12">
              No blog posts published yet. Check back soon!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <h2 className="text-3xl font-bold mb-2">Blog</h2>
      <p className="text-muted-foreground mb-8">
        Read the latest articles, insights and updates
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden flex flex-col h-full">
            {post.featuredImage && (
              <div className="w-full h-48 overflow-hidden">
                <img 
                  src={post.featuredImage} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            )}
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">
                  {getCategoryName(post.categoryId)}
                </Badge>
                <Separator orientation="vertical" className="h-4" />
                <span className="text-xs text-muted-foreground flex items-center">
                  <Calendar className="h-3 w-3 mr-1" /> 
                  {formatDate(post.publishDate)}
                </span>
              </div>
              <CardTitle className="line-clamp-2">
                <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                  {post.title}
                </Link>
              </CardTitle>
              <CardDescription className="line-clamp-3">
                {post.excerpt}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {post.tags.map((tag, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-muted rounded-full flex items-center">
                      <Tag className="h-3 w-3 mr-1" /> {tag}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="link" className="p-0" asChild>
                <Link href={`/blog/${post.slug}`}>
                  Read More <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}