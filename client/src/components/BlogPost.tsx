import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { ArrowLeft, Calendar, Tag, User } from "lucide-react";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function BlogPost() {
  // Get the post slug from the URL
  const [, params] = useRoute<{ slug: string }>("/blog/:slug");
  const slug = params?.slug;

  // Fetch the blog post and categories
  const { 
    data: post, 
    isLoading: postLoading,
    error: postError
  } = useQuery<BlogPost>({
    queryKey: [`/api/blog/posts/${slug}`],
    enabled: !!slug,
  });

  const { 
    data: categories 
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

  if (postLoading) {
    return (
      <div className="container mx-auto py-12">
        <Button variant="ghost" className="mb-8" asChild>
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
          </Link>
        </Button>
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-64 w-full mb-8" />
          <div>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-full mb-4" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (postError || !post) {
    return (
      <div className="container mx-auto py-12">
        <Button variant="ghost" className="mb-8" asChild>
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
          </Link>
        </Button>
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link href="/blog">
              Return to Blog
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <Button variant="ghost" className="mb-8" asChild>
        <Link href="/blog">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
        </Link>
      </Button>
      
      <article className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-6">
            <Badge variant="outline">
              {getCategoryName(post.categoryId)}
            </Badge>
            
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" /> 
              {formatDate(post.publishDate)}
              {post.publishDate && ` (${Math.floor((new Date().getTime() - new Date(post.publishDate).getTime()) / (1000 * 60 * 60 * 24 * 30))}mo ago)`}
            </div>
            
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" /> 
              Admin
            </div>
            
            <div className="flex items-center">
              <span>{Math.max(1, Math.ceil(post.content.replace(/<[^>]*>?/gm, '').split(/\s+/).length / 200))} mins read</span>
            </div>
          </div>
          
          {post.featuredImage && (
            <div className="w-full rounded-lg overflow-hidden mb-8">
              <img 
                src={post.featuredImage} 
                alt={post.title} 
                className="w-full h-auto"
              />
            </div>
          )}
          
          <div className="text-lg font-medium text-muted-foreground mb-6">
            {post.excerpt}
          </div>
          
          <Separator className="mb-8" />
        </header>
        
        <div className="prose prose-lg max-w-none dark:prose-invert mb-8">
          {/* Using dangerouslySetInnerHTML here. In a real application, you'd want to use a proper HTML sanitizer
              library like DOMPurify or a Markdown renderer like react-markdown */}
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
        
        <footer className="mt-12 pt-6 border-t">
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-sm font-medium">Tags:</span>
              {post.tags.map((tag, i) => (
                <span key={i} className="text-sm px-3 py-1 bg-muted rounded-full flex items-center">
                  <Tag className="h-3 w-3 mr-1" /> {tag}
                </span>
              ))}
            </div>
          )}
        </footer>
      </article>
    </div>
  );
}