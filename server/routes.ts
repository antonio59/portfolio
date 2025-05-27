import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { z } from "zod";
import { storage } from "./storage";
import * as bcrypt from "bcrypt";
// Define the blog post schema using zod
const insertBlogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  slug: z.string().min(1, "Slug is required"),
  isPublished: z.boolean().default(false),
  publishedAt: z.date().optional(),
  authorId: z.number().int().positive(),
  categoryId: z.number().int().positive().optional(),
  tags: z.array(z.string()).default([]),
  featuredImage: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});
import { logger } from "./utils/logger";

// Extend Express session types
declare module "express-session" {
  interface SessionData {
    userId: number | undefined;
  }
}

// Extend Express types
declare global {
  // Extend Express namespace
  namespace Express {
    interface User {
      id: number;
      username: string;
    }

    interface Request {
      user?: User;
    }
  }
}

// Define schemas for request validation
const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// Login schema (commented out as it's not currently used)
// const loginSchema = z.object({
//   username: z.string().min(1, 'Username is required'),
//   password: z.string().min(1, 'Password is required')
// });

// Type for social media post result
interface SocialMediaPostResult {
  success: boolean;
  message: string;
  error?: string;
}

// Middleware to check if user is authenticated
const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).json({ success: false, message: "Not authenticated" });
  }
};

export async function registerRoutes(expressApp: Express): Promise<Express> {
  // Use the provided expressApp for all route registrations
  // Set up session and passport for authentication
  expressApp.use(
    session({
      secret: process.env["SESSION_SECRET"] || "your-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    }),
  );

  expressApp.use(express.json());
  expressApp.use(express.urlencoded({ extended: true }));

  // Initialize passport
  expressApp.use(passport.initialize());
  expressApp.use(passport.session());

  // Simple in-memory user store (replace with your actual user store)
  const users = [
    { id: 1, username: "admin", password: bcrypt.hashSync("password123", 10) },
  ];

  // Passport configuration
  passport.use(
    new LocalStrategy(async (username: string, password: string, done) => {
      try {
        const user = users.find((u) => u.username === username);
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect password." });
        }

        return done(null, { id: user.id, username: user.username });
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error("Authentication error");
        return done(err);
      }
    }),
  );

  // Initialize Passport and restore authentication state, if any, from the session
  expressApp.use(passport.initialize());
  expressApp.use(passport.session());

  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id: number, done) => {
    const user = users.find((u) => u.id === id);
    done(null, user ? { id: user.id, username: user.username } : null);
  });

  // Login route
  expressApp.post(
    "/api/login",
    (
      req: Request<unknown, unknown, { username?: string; password?: string }>,
      res: Response,
      next: NextFunction,
    ) => {
      try {
        const { username, password } = req.body;
        logger.info("Login attempt for user: %s", username);

        if (!username || !password) {
          res
            .status(400)
            .json({
              success: false,
              message: "Username and password are required",
            });
          return;
        }

        passport.authenticate(
          "local",
          (
            err: Error | null,
            user?: Express.User,
            info?: { message: string },
          ) => {
            if (err) {
              logger.error("Authentication error: %s", err);
              res
                .status(500)
                .json({ success: false, message: "Authentication error" });
              return;
            }

            if (!user) {
              res.status(401).json({
                success: false,
                message: info?.message || "Authentication failed",
              });
              return;
            }

            req.logIn(user, (loginErr) => {
              if (loginErr) {
                logger.error("Login error: %s", loginErr);
                res
                  .status(500)
                  .json({ success: false, message: "Login error" });
                return;
              }

              res.json({
                success: true,
                message: "Login successful",
                user: { id: user.id, username: user.username },
              });
            });
          },
        )(req, res, next);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        logger.error("Login error: %s", errorMessage);
        res.status(500).json({ success: false, message: "Login error" });
      }
    },
  );

  // Logout route
  expressApp.post("/api/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        logger.error("Error during logout: %s", err);
        res
          .status(500)
          .json({ success: false, message: "Error during logout" });
        return;
      }
      res
        .status(200)
        .json({ success: true, message: "Logged out successfully" });
    });
  });

  // Session check route
  expressApp.get("/api/session", (req: Request, res: Response) => {
    if (req.isAuthenticated() && req.user) {
      res.json({
        isAuthenticated: true,
        user: { id: req.user.id, username: req.user.username },
      });
    } else {
      res.json({ isAuthenticated: false });
    }
  });

  // Subscribe to blog
  expressApp.post("/api/subscribe", async (req: Request, res: Response) => {
    if (req.isAuthenticated() && req.user) {
      res.json({
        isAuthenticated: true,
        user: { id: req.user.id, username: req.user.username },
      });
    } else {
      res.json({ isAuthenticated: false });
    }
  });

  // Handle contact form submission
  expressApp.post(
    "/api/contact",
    async (req: Request, res: Response): Promise<void> => {
      try {
        const result = contactFormSchema.safeParse(req.body);

        if (!result.success) {
          res.status(400).json({
            success: false,
            message: "Validation error",
            errors: result.error.errors,
          });
          return;
        }

        // Process the contact form data here
        logger.info("Contact form submitted: %o", result.data);

        res.status(200).json({
          success: true,
          message: "Contact form submitted successfully",
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        logger.error("Error processing contact form: %s", errorMessage);
        res.status(500).json({
          success: false,
          message: "Error processing contact form",
        });
      }
    },
  );

  // Get all blog posts (public)
  expressApp.get(
    "/api/blog/posts",
    async (_req: Request, res: Response): Promise<void> => {
      try {
        // Using a default ID since getBlogPost requires an ID parameter
        // In a real application, you might want to implement a proper getBlogPosts method
        const post = await storage.getBlogPost(1);
        res.json([post]); // Return as an array for consistency
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        logger.error("Error getting blog posts: %s", errorMessage);
        res.status(500).json({
          success: false,
          message: "Error getting blog posts",
        });
      }
    },
  );

  // Helper function to post to social media
  const postToSocialMedia = async (
    post: unknown,
    category: unknown,
  ): Promise<SocialMediaPostResult> => {
    // Use the parameters to avoid unused variable warnings
    void post;
    void category;
    try {
      // This is a placeholder. In a real app, you would post to social media platforms here
      // and return the results.
      return {
        success: true,
        message: "Successfully posted to social media",
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      logger.error("Error posting to social media: %s", errorMessage);
      return {
        success: false,
        message: "Failed to post to social media",
        error: errorMessage,
      };
    }
  };

  // Create a new blog post (admin only)
  expressApp.post(
    "/api/admin/blog/posts",
    isAuthenticated,
    async (req: Request, res: Response): Promise<void> => {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Not authenticated" });
        return;
      }

      try {
        const validatedData = insertBlogPostSchema.parse(req.body);
        const newPost = await storage.createBlogPost({
          ...validatedData,
          authorId: req.user.id,
          slug: validatedData.title
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]+/g, ""),
          isPublished: false,
          publishedAt: new Date(),
        });

        res.status(201).json(newPost);
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json({
            success: false,
            message: "Validation error",
            errors: error.errors,
          });
          return;
        }

        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        logger.error("Error creating blog post: %s", errorMessage);
        res.status(500).json({
          success: false,
          message: "Error creating blog post",
        });
      }
    },
  );

  expressApp.put(
    "/api/admin/blog/posts/:id",
    isAuthenticated,
    async (req: Request, res: Response): Promise<void> => {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Not authenticated" });
        return;
      }

      try {
        const id = parseInt(req.params["id"] as string, 10);
        const updateSchema = z.object({
          title: z.string().min(1, "Title is required").optional(),
          content: z.string().min(1, "Content is required").optional(),
          excerpt: z.string().optional(),
          slug: z.string().min(1, "Slug is required").optional(),
          published: z.boolean().optional(),
          publishedAt: z.date().optional(),
          status: z.string().optional(),
          authorId: z.number().int().positive().optional(),
        });

        const validatedData = updateSchema.parse(req.body);

        // Get the existing post to check if status is changing to published
        const existingPost = await storage.getBlogPost(id);
        if (!existingPost) {
          res.status(404).json({
            success: false,
            message: "Blog post not found",
          });
          return;
        }

        const updatedPost = await storage.updateBlogPost(id, validatedData);
        if (!updatedPost) {
          res.status(404).json({
            success: false,
            message: "Blog post not found",
          });
          return;
        }

        // If status is changing to published, post to social media
        const statusChangedToPublished =
          existingPost.publishedAt && validatedData.published === true;

        if (statusChangedToPublished) {
          try {
            const category = updatedPost.categoryId
              ? await storage.getBlogCategory(updatedPost.categoryId)
              : undefined;

            const socialMediaResults = await postToSocialMedia(
              updatedPost,
              category,
            );

            // Add social media results to the response
            res.json({
              ...updatedPost,
              socialMedia: socialMediaResults,
            } as const);
          } catch (socialError) {
            const socialErrorMessage =
              socialError instanceof Error
                ? socialError.message
                : "Unknown error";
            logger.error(
              "Error posting to social media: %s",
              socialErrorMessage,
            );
            // Still return success for update even if social media posting fails
            res.json({
              ...updatedPost,
              socialMedia: {
                error: "Failed to post to social media platforms",
              },
            });
            return;
          }
        }

        res.json(updatedPost);
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json({
            success: false,
            message: "Validation error",
            errors: error.errors,
          });
          return;
        }

        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        logger.error("Error updating blog post: %s", errorMessage);
        res.status(500).json({
          success: false,
          message: "Error updating blog post",
        });
      }
    },
  );

  expressApp.delete(
    "/api/admin/blog/posts/:id",
    isAuthenticated,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const id = parseInt(req.params["id"] as string, 10);
        const success = await storage.deleteBlogPost(id);
        if (!success) {
          res.status(404).json({
            success: false,
            message: "Blog post not found",
          });
          return;
        }
        res.json({ success: true, message: "Blog post deleted successfully" });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        logger.error("Error deleting blog post: %s", errorMessage);
        res.status(500).json({
          success: false,
          message: "Error deleting blog post",
        });
      }
    },
  );

  expressApp.get(
    "/api/blog/unsubscribe/:email",
    async (
      req: Request<{ email: string }>,
      res: Response<{ success: boolean; message: string }>,
    ): Promise<void> => {
      try {
        const email = req.params.email as string;
        if (!email) {
          res.status(400).json({
            success: false,
            message: "Email parameter is required",
          });
          return;
        }
        const subscription = await storage.getBlogSubscriptionByEmail(email);
        if (!subscription) {
          res.status(404).json({
            success: false,
            message: "Subscription not found",
          });
          return;
        }

        // Update subscription status to unsubscribed
        await storage.updateBlogSubscription(subscription.id, {
          status: "unsubscribed",
        });

        res.json({ success: true, message: "Unsubscribed successfully" });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        logger.error("Error unsubscribing from blog: %s", errorMessage);
        res.status(500).json({
          success: false,
          message: "Error unsubscribing from blog",
        });
      }
    },
  );
  // Blog post routes - update existing post
  expressApp.put(
    "/api/admin/blog/posts/:id",
    isAuthenticated,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const id = parseInt(req.params["id"] as string, 10);
        if (!id) {
          res
            .status(400)
            .json({ success: false, message: "Post ID is required" });
          return;
        }

        const updateSchema = z.object({
          title: z.string().min(1, "Title is required").optional(),
          content: z.string().min(1, "Content is required").optional(),
          excerpt: z.string().optional(),
          slug: z.string().min(1, "Slug is required").optional(),
          published: z.boolean().optional(),
          publishedAt: z.date().optional(),
          status: z.string().optional(),
          authorId: z.number().int().positive().optional(),
        });

        const validatedData = updateSchema.parse(req.body);

        // Get the existing post to check if status is changing to published
        const existingPost = await storage.getBlogPost(id);
        if (!existingPost) {
          res.status(404).json({
            success: false,
            message: "Blog post not found",
          });
          return;
        }

        const updatedPost = await storage.updateBlogPost(id, validatedData);
        if (!updatedPost) {
          res.status(404).json({
            success: false,
            message: "Blog post not found",
          });
          return;
        }

        // If status is changing to published, post to social media
        const statusChangedToPublished =
          existingPost.publishedAt && validatedData.published === true;

        if (statusChangedToPublished) {
          try {
            // Get category if needed for future social media integration
            await (updatedPost.categoryId
              ? storage.getBlogCategory(updatedPost.categoryId)
              : Promise.resolve());

            // Add social media results to the response
            res.json({
              ...updatedPost,
              socialMedia: {
                success: true,
                message: "Post published successfully",
              },
            });
          } catch (socialError) {
            const socialErrorMessage =
              socialError instanceof Error
                ? socialError.message
                : "Unknown error";
            logger.error(
              "Error posting to social media: %s",
              socialErrorMessage,
            );
            // Still return success for update even if social media posting fails
            res.json({
              ...updatedPost,
              socialMedia: {
                error: "Failed to post to social media platforms",
              },
            });
            return;
          }
        }

        res.json(updatedPost);
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json({
            success: false,
            message: "Validation error",
            errors: error.errors,
          });
          return;
        }

        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        logger.error("Error updating blog post: %s", errorMessage);
        res.status(500).json({
          success: false,
          message: "Error updating blog post",
        });
      }
    },
  );

  expressApp.delete(
    "/api/admin/blog/posts/:id",
    isAuthenticated,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const id = parseInt(req.params["id"] as string, 10);
        const success = await storage.deleteBlogPost(id);
        if (!success) {
          res.status(404).json({
            success: false,
            message: "Blog post not found",
          });
          return;
        }
        res.json({ success: true, message: "Blog post deleted successfully" });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        logger.error("Error deleting blog post: %s", errorMessage);
        res.status(500).json({
          success: false,
          message: "Error deleting blog post",
        });
      }
    },
  );

  expressApp.get(
    "/api/blog/unsubscribe/:email",
    async (
      req: Request<{ email: string }>,
      res: Response<{ success: boolean; message: string }>,
    ): Promise<void> => {
      try {
        const email = req.params.email as string;
        if (!email) {
          res.status(400).json({
            success: false,
            message: "Email parameter is required",
          });
          return;
        }
        const subscription = await storage.getBlogSubscriptionByEmail(email);
        if (!subscription) {
          res.status(404).json({
            success: false,
            message: "Subscription not found",
          });
          return;
        }

        // Update subscription status to unsubscribed
        await storage.updateBlogSubscription(subscription.id, {
          status: "unsubscribed",
        });

        res.json({ success: true, message: "Unsubscribed successfully" });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        logger.error("Error unsubscribing from blog: %s", errorMessage);
        res.status(500).json({
          success: false,
          message: "Error unsubscribing from blog",
        });
      }
    },
  );

  return expressApp;
}

// Export the isAuthenticated middleware for use in other files
export { isAuthenticated };

// Export the registerRoutes function as default
export default registerRoutes;
