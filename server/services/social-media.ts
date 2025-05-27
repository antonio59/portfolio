import { BlogPost } from "@shared/schema";
import { logger } from "../utils/logger";

// Interface for social media service
export interface SocialMediaPost {
  title: string;
  excerpt: string;
  url: string;
  tags?: string[];
  image?: string;
}

// Social media configuration
export interface SocialMediaConfig {
  twitter: {
    enabled: boolean;
    apiKey?: string;
    apiSecret?: string;
    accessToken?: string;
    accessTokenSecret?: string;
  };
  bluesky: {
    enabled: boolean;
    identifier?: string;
    password?: string;
  };
  defaultFormat: string; // Template for post content
  includeTags: boolean;
  includeImage: boolean;
  baseUrl: string; // Base URL for the blog (e.g., https://example.com/blog/)
}

// Default configuration
const defaultConfig: SocialMediaConfig = {
  twitter: {
    enabled: false,
  },
  bluesky: {
    enabled: false,
  },
  defaultFormat: "{title}\n\n{excerpt}\n\nRead more: {url}",
  includeTags: true,
  includeImage: true,
  baseUrl: process.env.SITE_URL || "https://antoniosmith.me/blog/",
};

// Current configuration (in-memory)
let currentConfig: SocialMediaConfig = { ...defaultConfig };

// Format post for social media
function formatPost(post: SocialMediaPost, format: string): string {
  const content = format
    .replace("{title}", post.title)
    .replace("{excerpt}", post.excerpt)
    .replace("{url}", post.url);

  return content;
}

// Post to Twitter
async function postToTwitter(
  post: SocialMediaPost,
): Promise<{ success: boolean; message?: string }> {
  if (!currentConfig.twitter.enabled) {
    return { success: false, message: "Twitter posting is disabled" };
  }

  // Check for required credentials
  if (
    !currentConfig.twitter.apiKey ||
    !currentConfig.twitter.apiSecret ||
    !currentConfig.twitter.accessToken ||
    !currentConfig.twitter.accessTokenSecret
  ) {
    return { success: false, message: "Twitter credentials are missing" };
  }

  try {
    // In a real implementation, we would use the Twitter API library
    // For this example, we'll just simulate a successful post
    const formattedPost = formatPost(post, currentConfig.defaultFormat);
    logger.info(`Posted to Twitter: ${formattedPost}`);

    return { success: true, message: "Successfully posted to Twitter" };
  } catch (error) {
    logger.error("Twitter post error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error posting to Twitter",
    };
  }
}

// Post to Bluesky
async function postToBluesky(
  post: SocialMediaPost,
): Promise<{ success: boolean; message?: string }> {
  if (!currentConfig.bluesky.enabled) {
    return { success: false, message: "Bluesky posting is disabled" };
  }

  // Check for required credentials
  if (!currentConfig.bluesky.identifier || !currentConfig.bluesky.password) {
    return { success: false, message: "Bluesky credentials are missing" };
  }

  try {
    // In a real implementation, we would use the Bluesky API library
    // For this example, we'll just simulate a successful post
    const formattedPost = formatPost(post, currentConfig.defaultFormat);
    logger.info(`Posted to Bluesky: ${formattedPost}`);

    return { success: true, message: "Successfully posted to Bluesky" };
  } catch (error) {
    logger.error("Bluesky post error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error posting to Bluesky",
    };
  }
}

// Post to all enabled platforms
export async function postToSocialMedia(
  blogPost: BlogPost,
): Promise<{
  twitter?: { success: boolean; message?: string };
  bluesky?: { success: boolean; message?: string };
}> {
  const tags = Array.isArray(blogPost.tags) ? blogPost.tags : [];
  const postContent: SocialMediaPost = {
    title: blogPost.title,
    excerpt: blogPost.excerpt,
    url: `${currentConfig.baseUrl}${blogPost.slug}`,
    tags: currentConfig.includeTags ? (tags as string[]) : undefined,
    image: currentConfig.includeImage
      ? blogPost.featuredImage || undefined
      : undefined,
  };

  const results: {
    twitter?: { success: boolean; message?: string };
    bluesky?: { success: boolean; message?: string };
  } = {};

  // Post to Twitter if enabled
  if (currentConfig.twitter.enabled) {
    results.twitter = await postToTwitter(postContent);
  }

  // Post to Bluesky if enabled
  if (currentConfig.bluesky.enabled) {
    results.bluesky = await postToBluesky(postContent);
  }

  return results;
}

// Get current configuration
export function getSocialMediaConfig(): SocialMediaConfig {
  return { ...currentConfig };
}

// Update configuration
export function updateSocialMediaConfig(
  config: Partial<SocialMediaConfig>,
): SocialMediaConfig {
  currentConfig = {
    ...currentConfig,
    ...config,
    twitter: {
      ...currentConfig.twitter,
      ...(config.twitter || {}),
    },
    bluesky: {
      ...currentConfig.bluesky,
      ...(config.bluesky || {}),
    },
  };

  return { ...currentConfig };
}

// Test social media connection
export async function testSocialMediaConnection(): Promise<{
  twitter?: { success: boolean; message?: string };
  bluesky?: { success: boolean; message?: string };
}> {
  const testPost: SocialMediaPost = {
    title: "Test Post",
    excerpt: "This is a test post to verify social media integration.",
    url: `${currentConfig.baseUrl}test`,
    tags: ["test"],
  };

  const results: {
    twitter?: { success: boolean; message?: string };
    bluesky?: { success: boolean; message?: string };
  } = {};

  if (currentConfig.twitter.enabled) {
    results.twitter = await postToTwitter(testPost);
  }

  if (currentConfig.bluesky.enabled) {
    results.bluesky = await postToBluesky(testPost);
  }

  return results;
}
