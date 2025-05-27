import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import {
  ArrowLeft,
  Calendar,
  Tag,
  User,
  Share2,
  Mail,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
  Heart,
  MessageCircle,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  // Get the post slug from the URL
  const [, params] = useRoute<{ slug: string }>("/blog/:slug");
  const slug = params?.slug;

  // Fetch the blog post data
  const {
    data: post = null,
    isLoading: postLoading,
    error: postError,
  } = useQuery<BlogPost>({
    queryKey: [`/api/blog/posts/${slug}`],
    enabled: !!slug,
  });

  // Fetch the blog categories
  const { data: categories = [] } = useQuery<BlogCategory[]>({
    queryKey: ["/api/blog/categories"],
    enabled: true,
  });

  // Redirect to blog list if no slug is provided
  if (!slug && typeof window !== "undefined") {
    window.location.replace("/blog");
    return null;
  }

  // Function to get category name by ID
  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId || !categories) return "Uncategorized";
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Uncategorized";
  };

  // Function to format date
  const formatDate = (date: Date) => {
    if (!date) return "";
    return format(new Date(date), "MMMM d, yyyy");
  };

  // Copy URL to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (postLoading) {
    return (
      <div className="bg-[#fafafa] min-h-screen">
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
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-full mb-4" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (postError || !post) {
    return (
      <div className="bg-[#fafafa] min-h-screen">
        <div className="container mx-auto py-12">
          <Button variant="ghost" className="mb-8" asChild>
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
            </Link>
          </Button>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
            <p className="text-gray-600 mb-8">
              The blog post you're looking for doesn't exist or has been
              removed.
            </p>
            <Button asChild>
              <Link href="/blog">Return to Blog</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate reading time (about 200 words per minute)
  const calculateReadingTime = (content: string): number => {
    const wordCount = content.replace(/<[^>]*>?/gm, "").split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    return readingTime;
  };

  const readingTime = calculateReadingTime(post.content);

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <div className="container mx-auto py-12">
        <div className="max-w-4xl mx-auto mb-8">
          <Button variant="ghost" className="mb-4" asChild>
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
            </Link>
          </Button>

          <article className="bg-white rounded-xl shadow-sm overflow-hidden">
            <header className="p-8 border-b">
              {/* Category */}
              <div className="mb-4">
                <Badge variant="outline" className="text-blue-600 font-medium">
                  {getCategoryName(post.categoryId)}
                </Badge>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                {post.title}
              </h1>

              {/* Post meta */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-6">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  John Smith
                </div>

                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(post.publishDate)}
                </div>

                <div className="flex items-center">
                  <span>{readingTime} min read</span>
                </div>
              </div>

              {/* Excerpt */}
              <div className="text-lg text-gray-600 mb-6 italic">
                {post.excerpt}
              </div>

              {/* Featured image */}
              {post.featuredImage && (
                <div className="w-full rounded-lg overflow-hidden mb-6">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-auto"
                  />
                </div>
              )}

              {/* Share buttons */}
              <div className="flex items-center justify-between border-t pt-6">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">
                    Share:
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                        >
                          <Twitter className="h-4 w-4 text-[#1DA1F2]" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Share on Twitter</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                        >
                          <Facebook className="h-4 w-4 text-[#1877F2]" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Share on Facebook</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                        >
                          <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Share on LinkedIn</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={copyToClipboard}
                        >
                          <Copy
                            className={`h-4 w-4 ${copied ? "text-green-500" : "text-gray-600"}`}
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {copied ? "Copied!" : "Copy link"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex items-center gap-1 rounded-full px-3 ${liked ? "text-red-500" : "text-gray-500"}`}
                    onClick={() => setLiked(!liked)}
                  >
                    <Heart
                      className={`h-4 w-4 ${liked ? "fill-red-500" : ""}`}
                    />
                    <span>{liked ? "43" : "42"}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 rounded-full px-3 text-gray-500"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>12</span>
                  </Button>
                </div>
              </div>
            </header>

            {/* Post content */}
            <div className="p-8">
              <div className="prose prose-lg max-w-none">
                {/* Using dangerouslySetInnerHTML here. In a real application, you'd want to use a proper HTML sanitizer
                    library like DOMPurify or a Markdown renderer like react-markdown */}
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </div>
            </div>

            {/* Post footer */}
            <footer className="px-8 py-6 bg-gray-50 border-t">
              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mb-6">
                  <div className="text-sm font-medium text-gray-500 mb-2">
                    <Tag className="h-4 w-4 inline mr-1" /> Tags
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-gray-100"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Newsletter signup */}
              <Card className="p-6 bg-white">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2">
                      Subscribe to my newsletter
                    </h3>
                    <p className="text-gray-600">
                      Get notified when I publish new articles and case studies.
                    </p>
                  </div>
                  <Button className="bg-black hover:bg-gray-800 text-white">
                    <Mail className="mr-2 h-4 w-4" /> Subscribe
                  </Button>
                </div>
              </Card>
            </footer>
          </article>
        </div>
      </div>
    </div>
  );
}
