// Script to add blog posts to the database
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { storage } from "./server/storage.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createBlogPost() {
  try {
    // Create a blog post
    const post = await storage.createBlogPost({
      title: "Building a Self-Hosted Home Automation System with Node.js",
      slug: "self-hosted-home-automation",
      excerpt:
        "A complete guide to creating your own smart home system without relying on third-party services.",
      content: `<p>When I first started exploring home automation, I was drawn to the convenience of smart home products but concerned about privacy, reliability, and vendor lock-in. After trying several commercial solutions, I decided to build my own system that would run entirely on my local network.</p>
      
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
      </ul>`,
      categoryId: 1,
      featuredImage:
        "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
      tags: ["IoT", "Home Automation", "Node.js", "Self-Hosted"],
      publishDate: new Date("2025-05-01"),
      status: "published",
      userId: 1,
    });

    console.log("Blog post created:", post);

    // Create another blog post
    const post2 = await storage.createBlogPost({
      title: "How I Built a Portfolio Site with React and TypeScript",
      slug: "portfolio-react-typescript",
      excerpt:
        "A deep dive into the architecture and design decisions behind my personal portfolio website.",
      content: `<p>After years of having a basic portfolio website, I decided it was time for a complete overhaul. As a developer who works with React daily, I wanted to create something that would showcase both my design sensibilities and technical capabilities.</p>
      
      <h2>Design Philosophy</h2>
      
      <p>For this project, I embraced minimalism with purpose. My goals were:</p>
      
      <ul>
        <li>Focus on content and projects rather than flashy animations</li>
        <li>Create a responsive design that works beautifully on all devices</li>
        <li>Implement accessibility best practices from the ground up</li>
        <li>Optimize for performance and SEO</li>
      </ul>
      
      <h2>Technical Stack</h2>
      
      <p>I chose the following technologies:</p>
      
      <ul>
        <li>React with TypeScript for type safety</li>
        <li>Tailwind CSS for styling</li>
        <li>React Query for data fetching</li>
        <li>Express backend with Node.js</li>
      </ul>
      
      <p>TypeScript was particularly valuable as it helped me catch errors early and made refactoring much safer.</p>`,
      categoryId: 2,
      featuredImage:
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1469&q=80",
      tags: ["React", "TypeScript", "Portfolio", "Web Development"],
      publishDate: new Date("2025-04-15"),
      status: "published",
      userId: 1,
    });

    console.log("Blog post 2 created:", post2);

    const post3 = await storage.createBlogPost({
      title: "Migrating from AWS to a Self-Hosted Solution: A Case Study",
      slug: "aws-to-self-hosted",
      excerpt:
        "How I reduced costs and increased control by moving my projects from AWS to a self-hosted environment.",
      content: `<p>After several years of running my projects on AWS, I started to notice my monthly bills creeping up. While AWS provides excellent services, for my personal projects the costs were becoming difficult to justify. This led me to explore self-hosting alternatives.</p>
      
      <h2>The AWS Setup</h2>
      
      <p>My original setup included:</p>
      
      <ul>
        <li>Multiple EC2 instances for different applications</li>
        <li>RDS for databases</li>
        <li>S3 for static content and backups</li>
        <li>CloudFront for content delivery</li>
        <li>Route 53 for DNS management</li>
      </ul>
      
      <p>While this infrastructure worked well, the monthly costs were approaching $200, which felt excessive for personal projects.</p>
      
      <h2>The Self-Hosted Alternative</h2>
      
      <p>After researching options, I settled on:</p>
      
      <ul>
        <li>A mid-range dedicated server from Hetzner ($39/month)</li>
        <li>Docker containers for application isolation</li>
        <li>PostgreSQL and MongoDB running in containers</li>
        <li>Nginx as a reverse proxy with Let's Encrypt SSL</li>
        <li>Cloudflare for DNS and basic DDoS protection (free tier)</li>
        <li>Backblaze B2 for backups ($5/month)</li>
      </ul>
      
      <p>This reduced my monthly infrastructure costs to approximately $45 total.</p>`,
      categoryId: 3,
      featuredImage:
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1472&q=80",
      tags: ["AWS", "Self-Hosted", "DevOps", "Cost Optimization"],
      publishDate: new Date("2025-04-01"),
      status: "published",
      userId: 1,
    });

    console.log("Blog post 3 created:", post3);
  } catch (error) {
    console.error("Error creating blog posts:", error);
  }
}

// Execute the function
createBlogPost();
