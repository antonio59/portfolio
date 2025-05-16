import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { 
  insertSectionSchema, 
  insertProjectSchema, 
  insertExperienceSchema,
  insertCertificationSchema,
  insertBlogCategorySchema,
  insertBlogPostSchema,
  insertBlogSubscriptionSchema,
  insertCaseStudyDetailSchema
} from "@shared/schema";
// Import the data sync function and specific certification creation function
import { syncAllData, createSampleCertifications } from "../client/src/utils/syncFrontendData";
// Import social media services
import { 
  getSocialMediaConfig, 
  updateSocialMediaConfig, 
  testSocialMediaConnection,
  postToSocialMedia 
} from "./services/social-media";

// Define contact form schema for validation
const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  subject: z.string().min(3, "Subject must be at least 3 characters."),
  message: z.string().min(10, "Message must be at least 10 characters.")
});

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters."),
  password: z.string().min(6, "Password must be at least 6 characters.")
});

// Middleware to check if user is authenticated
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session?.userId) {
    return next();
  }
  res.status(401).json({ success: false, message: "Unauthorized" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session and passport for authentication
  app.use(
    session({
      secret: "portfolio-admin-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { 
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }
    })
  );
  
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Configure Passport with local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username or password" });
        }
        
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          return done(null, false, { message: "Incorrect username or password" });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );
  
  // Serialize/deserialize user for session management
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  
  // Simple authentication route without passport
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log(`Login attempt: ${username}`);
      
      // Validate request body
      try {
        loginSchema.parse(req.body);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ 
            success: false, 
            message: "Validation error", 
            errors: error.errors 
          });
        }
      }
      
      // Fixed credentials for admin
      if (username === "admin" && password === "password123") {
        // Set session
        req.session.userId = 1;
        
        console.log("Login successful");
        return res.status(200).json({ 
          success: true, 
          message: "Login successful",
          user: { id: 1, username: "admin" }
        });
      }
      
      console.log("Invalid credentials");
      return res.status(401).json({ 
        success: false, 
        message: "Invalid username or password" 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Server error during login" 
      });
    }
  });
  
  app.get("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Error during logout" });
      }
      res.status(200).json({ success: true, message: "Logged out successfully" });
    });
  });
  
  app.get("/api/session", (req, res) => {
    if (req.session.userId) {
      return res.json({ 
        isAuthenticated: true, 
        user: { id: 1, username: "admin" } 
      });
    }
    res.json({ isAuthenticated: false });
  });

  // Handle contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      // Validate the request body against our schema
      const validatedData = contactFormSchema.parse(req.body);
      
      // Log the contact form submission (in a real app, you might save this to a database or send an email)
      console.log("Contact form submission:", validatedData);
      
      // Send a success response
      res.status(200).json({ 
        success: true, 
        message: "Your message has been received. We'll get back to you soon!" 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Return validation errors
        return res.status(400).json({ 
          success: false, 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      // Return a generic error for other issues
      res.status(500).json({ 
        success: false, 
        message: "Something went wrong. Please try again later." 
      });
    }
  });
  
  // *** ADMIN API ROUTES - Protected by authentication ***
  
  // Sections CRUD
  app.get("/api/admin/sections", isAuthenticated, async (req, res) => {
    try {
      const sections = await storage.getAllSections();
      res.json(sections);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Error fetching sections" 
      });
    }
  });
  
  app.get("/api/admin/sections/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const section = await storage.getSection(id);
      if (!section) {
        return res.status(404).json({ 
          success: false, 
          message: "Section not found" 
        });
      }
      res.json(section);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Error fetching section" 
      });
    }
  });
  
  app.post("/api/admin/sections", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertSectionSchema.parse(req.body);
      const section = await storage.createSection(validatedData);
      res.status(201).json(section);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: "Error creating section" 
      });
    }
  });
  
  app.put("/api/admin/sections/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // Partial validation of the update data
      const updateSchema = insertSectionSchema.partial();
      const validatedData = updateSchema.parse(req.body);
      
      const updatedSection = await storage.updateSection(id, validatedData);
      if (!updatedSection) {
        return res.status(404).json({ 
          success: false, 
          message: "Section not found" 
        });
      }
      
      res.json(updatedSection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: "Error updating section" 
      });
    }
  });
  
  app.delete("/api/admin/sections/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSection(id);
      if (!success) {
        return res.status(404).json({ 
          success: false, 
          message: "Section not found" 
        });
      }
      
      res.json({ success: true, message: "Section deleted successfully" });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Error deleting section" 
      });
    }
  });
  
  // Projects CRUD
  app.get("/api/admin/projects", isAuthenticated, async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Error fetching projects" 
      });
    }
  });
  
  app.get("/api/admin/projects/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ 
          success: false, 
          message: "Project not found" 
        });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Error fetching project" 
      });
    }
  });
  
  app.post("/api/admin/projects", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: "Error creating project" 
      });
    }
  });
  
  app.put("/api/admin/projects/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // Partial validation of the update data
      const updateSchema = insertProjectSchema.partial();
      const validatedData = updateSchema.parse(req.body);
      
      const updatedProject = await storage.updateProject(id, validatedData);
      if (!updatedProject) {
        return res.status(404).json({ 
          success: false, 
          message: "Project not found" 
        });
      }
      
      res.json(updatedProject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: "Error updating project" 
      });
    }
  });
  
  app.delete("/api/admin/projects/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProject(id);
      if (!success) {
        return res.status(404).json({ 
          success: false, 
          message: "Project not found" 
        });
      }
      
      res.json({ success: true, message: "Project deleted successfully" });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Error deleting project" 
      });
    }
  });
  
  // Experiences CRUD
  app.get("/api/admin/experiences", isAuthenticated, async (req, res) => {
    try {
      const experiences = await storage.getAllExperiences();
      res.json(experiences);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Error fetching experiences" 
      });
    }
  });
  
  app.get("/api/admin/experiences/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const experience = await storage.getExperience(id);
      if (!experience) {
        return res.status(404).json({ 
          success: false, 
          message: "Experience not found" 
        });
      }
      res.json(experience);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Error fetching experience" 
      });
    }
  });
  
  app.post("/api/admin/experiences", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertExperienceSchema.parse(req.body);
      const experience = await storage.createExperience(validatedData);
      res.status(201).json(experience);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: "Error creating experience" 
      });
    }
  });
  
  app.put("/api/admin/experiences/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // Partial validation of the update data
      const updateSchema = insertExperienceSchema.partial();
      const validatedData = updateSchema.parse(req.body);
      
      const updatedExperience = await storage.updateExperience(id, validatedData);
      if (!updatedExperience) {
        return res.status(404).json({ 
          success: false, 
          message: "Experience not found" 
        });
      }
      
      res.json(updatedExperience);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: "Error updating experience" 
      });
    }
  });
  
  app.delete("/api/admin/experiences/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteExperience(id);
      if (!success) {
        return res.status(404).json({ 
          success: false, 
          message: "Experience not found" 
        });
      }
      
      res.json({ success: true, message: "Experience deleted successfully" });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Error deleting experience" 
      });
    }
  });
  
  // Public API routes for fetching content
  app.get("/api/sections/:type", async (req, res) => {
    try {
      const type = req.params.type;
      const sections = await storage.getSectionsByType(type);
      res.json(sections);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Error fetching sections" 
      });
    }
  });
  
  app.get("/api/projects/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const projects = await storage.getProjectsByCategory(category);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Error fetching projects" 
      });
    }
  });
  
  app.get("/api/experiences", async (req, res) => {
    try {
      const experiences = await storage.getAllExperiences();
      res.json(experiences);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Error fetching experiences" 
      });
    }
  });
  
  // Certifications CRUD
  app.get("/api/admin/certifications", isAuthenticated, async (req, res) => {
    try {
      const certifications = await storage.getAllCertifications();
      res.json(certifications);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Error fetching certifications" 
      });
    }
  });
  
  app.get("/api/admin/certifications/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const certification = await storage.getCertification(id);
      if (!certification) {
        return res.status(404).json({ 
          success: false, 
          message: "Certification not found" 
        });
      }
      res.json(certification);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Error fetching certification" 
      });
    }
  });
  
  app.post("/api/admin/certifications", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCertificationSchema.parse(req.body);
      const certification = await storage.createCertification(validatedData);
      res.status(201).json(certification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: "Error creating certification" 
      });
    }
  });
  
  app.put("/api/admin/certifications/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // Partial validation of the update data
      const updateSchema = insertCertificationSchema.partial();
      const validatedData = updateSchema.parse(req.body);
      
      const updatedCertification = await storage.updateCertification(id, validatedData);
      if (!updatedCertification) {
        return res.status(404).json({ 
          success: false, 
          message: "Certification not found" 
        });
      }
      
      res.json(updatedCertification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: "Error updating certification" 
      });
    }
  });
  
  app.delete("/api/admin/certifications/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCertification(id);
      if (!success) {
        return res.status(404).json({ 
          success: false, 
          message: "Certification not found" 
        });
      }
      
      res.json({ success: true, message: "Certification deleted successfully" });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Error deleting certification" 
      });
    }
  });
  
  // Public API routes for featured content
  app.get("/api/featured-projects", async (req, res) => {
    try {
      const projects = await storage.getFeaturedProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Error fetching featured projects" 
      });
    }
  });
  
  // Frontend API for certifications
  app.get("/api/certifications", async (req, res) => {
    try {
      console.log("Fetching all certifications...");
      const certifications = await storage.getAllCertifications();
      console.log(`Found ${certifications.length} certifications`);
      res.json(certifications);
    } catch (error) {
      console.error("Error fetching certifications:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error fetching certifications" 
      });
    }
  });
  
  // Data sync API endpoint
  app.post("/api/admin/sync-data", async (req, res) => {
    try {
      console.log("Starting data sync process...");
      
      // Focus on certifications first
      const certResult = await createSampleCertifications();
      console.log(`Certification sync result: ${certResult.success ? 'success' : 'failed'}, ${certResult.count} items`);
      
      // Then sync all remaining data if needed
      /*
      const fullResult = await syncAllData();
      console.log("Full data sync completed");
      */
      
      res.status(200).json({
        success: true,
        message: `Successfully synced data. Added ${certResult.count} certifications.`
      });
    } catch (error) {
      console.error("Error during data sync:", error);
      res.status(500).json({
        success: false,
        message: "Error syncing data"
      });
    }
  });
  
  app.get("/api/featured-certifications", async (req, res) => {
    try {
      const certifications = await storage.getFeaturedCertifications();
      res.json(certifications);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Error fetching featured certifications" 
      });
    }
  });
  
  app.get("/api/certifications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const certification = await storage.getCertification(id);
      if (!certification) {
        return res.status(404).json({ 
          success: false, 
          message: "Certification not found" 
        });
      }
      res.json(certification);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Error fetching certification" 
      });
    }
  });

  // Bypass auth endpoints for data sync operations
  app.post("/api/bypass/projects", async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ 
        success: false, 
        message: "Error creating project" 
      });
    }
  });
  
  app.get("/api/bypass/projects", async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Error fetching projects" 
      });
    }
  });
  
  app.put("/api/bypass/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateSchema = insertProjectSchema.partial();
      const validatedData = updateSchema.parse(req.body);
      
      const updatedProject = await storage.updateProject(id, validatedData);
      if (!updatedProject) {
        return res.status(404).json({ 
          success: false, 
          message: "Project not found" 
        });
      }
      
      res.json(updatedProject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: "Error updating project" 
      });
    }
  });
  
  app.post("/api/bypass/experiences", async (req, res) => {
    try {
      const validatedData = insertExperienceSchema.parse(req.body);
      const experience = await storage.createExperience(validatedData);
      res.status(201).json(experience);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: "Error creating experience" 
      });
    }
  });
  
  app.post("/api/bypass/sections", async (req, res) => {
    try {
      const validatedData = insertSectionSchema.parse(req.body);
      const section = await storage.createSection(validatedData);
      res.status(201).json(section);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: "Error creating section" 
      });
    }
  });
  
  app.post("/api/bypass/certifications", async (req, res) => {
    try {
      const validatedData = insertCertificationSchema.parse(req.body);
      const certification = await storage.createCertification(validatedData);
      res.status(201).json(certification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: "Error creating certification" 
      });
    }
  });

  // API endpoint for sample certifications
  app.post("/api/create-sample-certifications", isAuthenticated, async (req, res) => {
    try {
      console.log("Creating sample certifications...");
      const result = await createSampleCertifications();
      res.json({ 
        success: true, 
        message: "Sample certifications created successfully", 
        result 
      });
    } catch (error) {
      console.error("Error creating sample certifications:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error creating sample certifications", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.post("/api/sync-data", async (req, res) => {
    try {
      console.log("Starting data sync process...");
      const result = await syncAllData();
      console.log("Data sync completed:", result);
      
      res.json({ 
        success: true, 
        message: "Data sync completed successfully", 
        result 
      });
    } catch (error) {
      console.error("Error syncing data:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error syncing data", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Blog API endpoints
  
  // Blog Categories
  app.get("/api/blog/categories", async (req, res) => {
    try {
      const categories = await storage.getAllBlogCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Error fetching blog categories" 
      });
    }
  });
  
  app.get("/api/blog/categories/:slug", async (req, res) => {
    try {
      const category = await storage.getBlogCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ 
          success: false, 
          message: "Blog category not found" 
        });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Error fetching blog category" 
      });
    }
  });
  
  app.post("/api/admin/blog/categories", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertBlogCategorySchema.parse(req.body);
      const category = await storage.createBlogCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: "Error creating blog category" 
      });
    }
  });
  
  app.put("/api/admin/blog/categories/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateSchema = insertBlogCategorySchema.partial();
      const validatedData = updateSchema.parse(req.body);
      
      const updatedCategory = await storage.updateBlogCategory(id, validatedData);
      if (!updatedCategory) {
        return res.status(404).json({ 
          success: false, 
          message: "Blog category not found" 
        });
      }
      
      res.json(updatedCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: "Error updating blog category" 
      });
    }
  });
  
  app.delete("/api/admin/blog/categories/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBlogCategory(id);
      if (!success) {
        return res.status(404).json({ 
          success: false, 
          message: "Blog category not found" 
        });
      }
      
      res.json({ success: true, message: "Blog category deleted successfully" });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Error deleting blog category" 
      });
    }
  });
  
  // Blog Posts
  app.get("/api/blog/posts", async (req, res) => {
    try {
      const posts = await storage.getPublishedBlogPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Error fetching blog posts" 
      });
    }
  });
  
  app.get("/api/blog/posts/:slug", async (req, res) => {
    try {
      const post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post) {
        return res.status(404).json({ 
          success: false, 
          message: "Blog post not found" 
        });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Error fetching blog post" 
      });
    }
  });
  
  app.get("/api/blog/categories/:id/posts", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const posts = await storage.getBlogPostsByCategory(categoryId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Error fetching blog posts by category" 
      });
    }
  });
  
  app.get("/api/blog/tags/:tag/posts", async (req, res) => {
    try {
      const tag = req.params.tag;
      const posts = await storage.getBlogPostsByTag(tag);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Error fetching blog posts by tag" 
      });
    }
  });
  
  app.post("/api/admin/blog/posts", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertBlogPostSchema.parse(req.body);
      // Set the user ID to the admin user
      validatedData.userId = 1;
      const post = await storage.createBlogPost(validatedData);
      
      // If the post is published, attempt to post to social media
      if (post.status === "published") {
        try {
          const category = post.categoryId 
            ? await storage.getBlogCategory(post.categoryId) 
            : undefined;
          
          const socialMediaResults = await postToSocialMedia(post, category);
          
          // Add social media results to the response
          return res.status(201).json({
            ...post, 
            socialMedia: socialMediaResults
          });
        } catch (socialError) {
          console.error("Error posting to social media:", socialError);
          // Still return success for post creation even if social media posting fails
          return res.status(201).json({
            ...post,
            socialMedia: { error: "Failed to post to social media platforms" }
          });
        }
      }
      
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: "Error creating blog post" 
      });
    }
  });
  
  app.put("/api/admin/blog/posts/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateSchema = insertBlogPostSchema.partial();
      const validatedData = updateSchema.parse(req.body);
      
      // Get the existing post to check if status is changing to published
      const existingPost = await storage.getBlogPost(id);
      if (!existingPost) {
        return res.status(404).json({ 
          success: false, 
          message: "Blog post not found" 
        });
      }
      
      const updatedPost = await storage.updateBlogPost(id, validatedData);
      if (!updatedPost) {
        return res.status(404).json({ 
          success: false, 
          message: "Blog post not found" 
        });
      }
      
      // If status is changing to published, post to social media
      const statusChangedToPublished = 
        existingPost.status !== "published" && 
        validatedData.status === "published";
      
      if (statusChangedToPublished) {
        try {
          const category = updatedPost.categoryId 
            ? await storage.getBlogCategory(updatedPost.categoryId) 
            : undefined;
          
          const socialMediaResults = await postToSocialMedia(updatedPost, category);
          
          // Add social media results to the response
          return res.json({
            ...updatedPost, 
            socialMedia: socialMediaResults
          });
        } catch (socialError) {
          console.error("Error posting to social media:", socialError);
          // Still return success for update even if social media posting fails
          return res.json({
            ...updatedPost,
            socialMedia: { error: "Failed to post to social media platforms" }
          });
        }
      }
      
      res.json(updatedPost);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: "Error updating blog post" 
      });
    }
  });
  
  app.delete("/api/admin/blog/posts/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBlogPost(id);
      if (!success) {
        return res.status(404).json({ 
          success: false, 
          message: "Blog post not found" 
        });
      }
      
      res.json({ success: true, message: "Blog post deleted successfully" });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Error deleting blog post" 
      });
    }
  });
  
  // Blog Subscriptions
  app.post("/api/blog/subscribe", async (req, res) => {
    try {
      const { email, name } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required"
        });
      }
      
      // Check if subscription already exists
      const existingSubscription = await storage.getBlogSubscriptionByEmail(email);
      if (existingSubscription) {
        if (existingSubscription.status === 'unsubscribed') {
          // Reactivate subscription
          await storage.updateBlogSubscription(existingSubscription.id, {
            status: 'active',
            name: name || existingSubscription.name,
          });
          
          return res.json({
            success: true,
            message: "Your subscription has been reactivated."
          });
        } else {
          return res.json({
            success: true,
            message: "You're already subscribed to our blog updates."
          });
        }
      }
      
      // Generate confirmation token (in a real app, this would be more secure)
      const confirmationToken = Math.random().toString(36).substring(2, 15);
      
      // Create new subscription
      await storage.createBlogSubscription({
        email,
        name: name || null,
        status: 'active',
        confirmationToken,
        confirmed: false
      });
      
      // In a real app, send confirmation email using Resend
      // await resend.emails.send({
      //   from: 'blog@antoniosmith.me',
      //   to: email,
      //   subject: 'Confirm your blog subscription',
      //   html: `<p>Thank you for subscribing to my blog. Please confirm your subscription by clicking <a href="${process.env.APP_URL}/api/blog/confirm-subscription/${confirmationToken}">here</a>.</p>`
      // });
      
      res.json({
        success: true,
        message: "Thank you for subscribing! Please check your email to confirm your subscription."
      });
    } catch (error) {
      console.error("Error subscribing to blog:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while subscribing. Please try again later."
      });
    }
  });
  
  app.get("/api/blog/confirm-subscription/:token", async (req, res) => {
    try {
      const token = req.params.token;
      const subscription = await storage.confirmBlogSubscription(token);
      
      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: "Invalid or expired confirmation link."
        });
      }
      
      res.json({
        success: true,
        message: "Your subscription has been confirmed. Thank you!"
      });
    } catch (error) {
      console.error("Error confirming subscription:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while confirming your subscription. Please try again later."
      });
    }
  });
  
  app.get("/api/blog/unsubscribe/:email", async (req, res) => {
    try {
      const email = decodeURIComponent(req.params.email);
      const success = await storage.unsubscribe(email);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: "Subscription not found."
        });
      }
      
      res.json({
        success: true,
        message: "You have been unsubscribed from our blog updates."
      });
    } catch (error) {
      console.error("Error unsubscribing:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while unsubscribing. Please try again later."
      });
    }
  });
  
  app.get("/api/admin/blog/subscriptions", isAuthenticated, async (req, res) => {
    try {
      const subscriptions = await storage.getAllBlogSubscriptions();
      res.json(subscriptions);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching blog subscriptions"
      });
    }
  });
  
  // Social Media Configuration API
  app.get("/api/admin/social-media/config", isAuthenticated, async (req, res) => {
    try {
      const config = getSocialMediaConfig();
      // Don't send sensitive credentials to the client
      const safeConfig = {
        ...config,
        twitter: {
          ...config.twitter,
          apiSecret: config.twitter.apiSecret ? "[HIDDEN]" : undefined,
          accessTokenSecret: config.twitter.accessTokenSecret ? "[HIDDEN]" : undefined,
        },
        bluesky: {
          ...config.bluesky,
          password: config.bluesky.password ? "[HIDDEN]" : undefined,
        }
      };
      res.json(safeConfig);
    } catch (error) {
      console.error("Error getting social media config:", error);
      res.status(500).json({
        success: false,
        message: "Error getting social media configuration"
      });
    }
  });
  
  app.put("/api/admin/social-media/config", isAuthenticated, async (req, res) => {
    try {
      const updatedConfig = updateSocialMediaConfig(req.body);
      // Don't send sensitive credentials to the client
      const safeConfig = {
        ...updatedConfig,
        twitter: {
          ...updatedConfig.twitter,
          apiSecret: updatedConfig.twitter.apiSecret ? "[HIDDEN]" : undefined,
          accessTokenSecret: updatedConfig.twitter.accessTokenSecret ? "[HIDDEN]" : undefined,
        },
        bluesky: {
          ...updatedConfig.bluesky,
          password: updatedConfig.bluesky.password ? "[HIDDEN]" : undefined,
        }
      };
      res.json(safeConfig);
    } catch (error) {
      console.error("Error updating social media config:", error);
      res.status(500).json({
        success: false,
        message: "Error updating social media configuration"
      });
    }
  });
  
  app.post("/api/admin/social-media/test", isAuthenticated, async (req, res) => {
    try {
      const results = await testSocialMediaConnection();
      res.json({
        success: true,
        results
      });
    } catch (error) {
      console.error("Error testing social media connections:", error);
      res.status(500).json({
        success: false,
        message: "Error testing social media connections"
      });
    }
  });
  
  // Utility route to create sample blog posts (for development only)
  app.get("/api/admin/seed-blog", isAuthenticated, async (req, res) => {
    try {
      // Create sample blog categories if they don't exist
      let selfHostedCategory = await storage.getBlogCategoryBySlug("self-hosted");
      if (!selfHostedCategory) {
        selfHostedCategory = await storage.createBlogCategory({
          name: "Self-Hosted Solutions",
          slug: "self-hosted",
          description: "Projects and guides for hosting your own applications"
        });
      }
      
      let webDevCategory = await storage.getBlogCategoryBySlug("web-dev");
      if (!webDevCategory) {
        webDevCategory = await storage.createBlogCategory({
          name: "Web Development",
          slug: "web-dev",
          description: "All about building great websites and web applications"
        });
      }
      
      let devOpsCategory = await storage.getBlogCategoryBySlug("devops");
      if (!devOpsCategory) {
        devOpsCategory = await storage.createBlogCategory({
          name: "DevOps",
          slug: "devops",
          description: "Streamlining development and operations"
        });
      }
      
      // Create sample blog posts if they don't exist
      let post1 = await storage.getBlogPostBySlug("self-hosted-home-automation");
      if (!post1) {
        post1 = await storage.createBlogPost({
          title: "Building a Self-Hosted Home Automation System with Node.js",
          slug: "self-hosted-home-automation",
          excerpt: "A complete guide to creating your own smart home system without relying on third-party services.",
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
          categoryId: selfHostedCategory.id,
          featuredImage: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
          tags: ["IoT", "Home Automation", "Node.js", "Self-Hosted"],
          publishDate: new Date("2025-05-01"),
          status: "published",
          userId: 1
        });
      }
      
      let post2 = await storage.getBlogPostBySlug("portfolio-react-typescript");
      if (!post2) {
        post2 = await storage.createBlogPost({
          title: "How I Built a Portfolio Site with React and TypeScript",
          slug: "portfolio-react-typescript",
          excerpt: "A deep dive into the architecture and design decisions behind my personal portfolio website.",
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
          categoryId: webDevCategory.id,
          featuredImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1469&q=80",
          tags: ["React", "TypeScript", "Portfolio", "Web Development"],
          publishDate: new Date("2025-04-15"),
          status: "published",
          userId: 1
        });
      }
      
      let post3 = await storage.getBlogPostBySlug("aws-to-self-hosted");
      if (!post3) {
        post3 = await storage.createBlogPost({
          title: "Migrating from AWS to a Self-Hosted Solution: A Case Study",
          slug: "aws-to-self-hosted",
          excerpt: "How I reduced costs and increased control by moving my projects from AWS to a self-hosted environment.",
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
          categoryId: devOpsCategory.id,
          featuredImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1472&q=80",
          tags: ["AWS", "Self-Hosted", "DevOps", "Cost Optimization"],
          publishDate: new Date("2025-04-01"),
          status: "published",
          userId: 1
        });
      }
      
      res.json({
        success: true,
        message: "Blog posts created successfully",
        categories: [selfHostedCategory, webDevCategory, devOpsCategory],
        posts: [post1, post2, post3]
      });
    } catch (error) {
      console.error("Error seeding blog data:", error);
      res.status(500).json({
        success: false,
        message: "Error seeding blog data",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
