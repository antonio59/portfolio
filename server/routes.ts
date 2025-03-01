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
  insertCertificationSchema
} from "@shared/schema";
// Import the data sync function and specific certification creation function
import { syncAllData, createSampleCertifications } from "../client/src/utils/syncFrontendData";

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

  // Data sync endpoint - main coordinator
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

  const httpServer = createServer(app);
  return httpServer;
}
