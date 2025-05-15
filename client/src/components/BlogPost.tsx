import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { ArrowLeft, Calendar, Tag, User, Share2, Mail, Twitter, Facebook, Linkedin, Copy, Heart, MessageCircle } from "lucide-react";
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
  const slug = params?.slug || "self-hosted-home-automation"; // Default to a sample post for preview

  // Sample post data for demo purposes 
  const samplePost: BlogPost = {
    id: 1,
    title: "Building a Self-Hosted Home Automation System with Node.js",
    slug: "self-hosted-home-automation",
    excerpt: "A complete guide to creating your own smart home system without relying on third-party services.",
    content: `
      <p>When I first started exploring home automation, I was drawn to the convenience of smart home products but concerned about privacy, reliability, and vendor lock-in. After trying several commercial solutions, I decided to build my own system that would run entirely on my local network.</p>
      
      <h2>Why Self-Host Your Home Automation?</h2>
      
      <p>Commercial smart home platforms like Google Home or Amazon Alexa are convenient, but they come with drawbacks:</p>
      
      <ul>
        <li>Privacy concerns - your data and usage patterns are stored on third-party servers</li>
        <li>Internet dependency - if your connection goes down, your smart home may become unavailable</li>
        <li>Limited customization - you're restricted to the features and integrations the vendor chooses to support</li>
        <li>Subscription costs - many platforms are moving toward subscription models</li>
      </ul>
      
      <p>By self-hosting, you maintain complete control over your smart home system, data, and can customize it to your exact needs.</p>
      
      <h2>The Architecture of My Solution</h2>
      
      <p>I settled on a modular system built with Node.js that includes:</p>
      
      <ul>
        <li>A central hub running on a Raspberry Pi 4</li>
        <li>MQTT for lightweight messaging between devices</li>
        <li>Node-RED for visual automation workflows</li>
        <li>Custom Z-Wave and Zigbee bridges</li>
        <li>A React-based dashboard for monitoring and control</li>
      </ul>
      
      <p>One of the key advantages of this approach is flexibility. You can integrate practically any smart device on the market, including those that don't normally work together. If you can connect to it via an API or protocol, you can include it in your system.</p>
      
      <h2>Getting Started</h2>
      
      <p>To build a similar system, you'll need:</p>
      
      <ul>
        <li>A Raspberry Pi 4 (or other small computer)</li>
        <li>Z-Wave/Zigbee USB sticks (if using those protocols)</li>
        <li>Basic knowledge of JavaScript/Node.js</li>
        <li>Some smart devices to control</li>
      </ul>
      
      <p>In the next part of this series, I'll walk through the setup process step-by-step, including code samples and configuration files.</p>
      
      <h2>Challenges and Lessons Learned</h2>
      
      <p>The biggest challenge was dealing with the inconsistency of device protocols and APIs. Some devices use standard protocols like Z-Wave or Zigbee, while others rely on proprietary cloud APIs that need to be reverse-engineered.</p>
      
      <p>I found that starting with a small set of compatible devices and gradually expanding was the most manageable approach.</p>
      
      <h2>Results and Benefits</h2>
      
      <p>After a year of running this system, the benefits have been substantial:</p>
      
      <ul>
        <li>Complete privacy - all data stays on my local network</li>
        <li>Reliability - even when the internet is down, the system continues working</li>
        <li>Customization - I've implemented features that don't exist in commercial platforms</li>
        <li>Lower long-term costs - no subscriptions or cloud fees</li>
        <li>Learning opportunity - I've gained valuable skills in IoT development</li>
      </ul>
      
      <p>The system now controls lighting, climate, security, and entertainment throughout my home, and I'm constantly adding new capabilities.</p>
      
      <h2>Next Steps</h2>
      
      <p>In future articles, I'll dive deeper into specific aspects of building a self-hosted home automation system, including:</p>
      
      <ul>
        <li>Setting up a secure local API</li>
        <li>Building voice control without cloud services</li>
        <li>Creating automation rules and scenes</li>
        <li>Designing a responsive dashboard UI</li>
      </ul>
      
      <p>Stay tuned for the next installment where I'll provide a detailed guide on setting up the hardware and base system.</p>
    `,
    categoryId: 1,
    featuredImage: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    tags: ["IoT", "Home Automation", "Node.js", "Self-Hosted"],
    publishDate: new Date("2025-05-01"),
    status: "published",
    userId: 1,
    createdAt: new Date("2025-05-01"),
    updatedAt: new Date("2025-05-01")
  };

  // Sample categories data for demo purposes
  const sampleCategories: BlogCategory[] = [
    { id: 1, name: "Self-Hosted Solutions", slug: "self-hosted", description: "Projects and guides for hosting your own applications" },
    { id: 2, name: "Web Development", slug: "web-dev", description: "All about building great websites and web applications" },
    { id: 3, name: "DevOps", slug: "devops", description: "Streamlining development and operations" }
  ];

  // Use the real data if available, otherwise use the sample data
  const { 
    data: post = null, 
    isLoading: postLoading,
    error: postError
  } = useQuery<BlogPost>({
    queryKey: [`/api/blog/posts/${slug}`],
    enabled: true,
    placeholderData: samplePost // Use sample post as placeholder while loading
  });

  const { 
    data: categories = []
  } = useQuery<BlogCategory[]>({
    queryKey: ["/api/blog/categories"],
    enabled: true,
    placeholderData: sampleCategories // Use sample categories as placeholder while loading
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
              The blog post you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/blog">
                Return to Blog
              </Link>
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
              <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{post.title}</h1>
              
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
                  <span className="text-sm font-medium text-gray-700">Share:</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <Twitter className="h-4 w-4 text-[#1DA1F2]" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Share on Twitter</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <Facebook className="h-4 w-4 text-[#1877F2]" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Share on Facebook</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
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
                          <Copy className={`h-4 w-4 ${copied ? 'text-green-500' : 'text-gray-600'}`} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{copied ? 'Copied!' : 'Copy link'}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`flex items-center gap-1 rounded-full px-3 ${liked ? 'text-red-500' : 'text-gray-500'}`}
                    onClick={() => setLiked(!liked)}
                  >
                    <Heart className={`h-4 w-4 ${liked ? 'fill-red-500' : ''}`} />
                    <span>{liked ? '43' : '42'}</span>
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="flex items-center gap-1 rounded-full px-3 text-gray-500">
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
            <footer className="p-8 border-t bg-gray-50">
              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, i) => (
                      <Badge key={i} variant="outline" className="bg-white hover:bg-gray-100 transition-colors">
                        <Tag className="h-3 w-3 mr-1" /> {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Subscribe card */}
              <Card className="bg-white p-6 border shadow-sm">
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">Subscribe to John's Coding Journal</h3>
                  <p className="text-gray-600 mb-4">
                    Get new posts about self-hosted projects and development insights delivered to your inbox.
                  </p>
                  <div className="flex justify-center">
                    <Button className="bg-black hover:bg-gray-800 text-white">
                      <Mail className="mr-2 h-4 w-4" /> Subscribe
                    </Button>
                  </div>
                </div>
              </Card>
            </footer>
          </article>
        </div>
        
        {/* Author bio card */}
        <div className="max-w-4xl mx-auto mt-8">
          <Card className="bg-white p-6 border shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80" 
                  alt="John Smith" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold">John Smith</h3>
                <p className="text-gray-600 text-sm">
                  Software developer specializing in self-hosted solutions and web applications. 
                  I write about my projects, tech insights, and development adventures.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}