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
  insertExperienceSchema 
} from "@shared/schema";

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
  if (req.isAuthenticated()) {
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
  
  // Authentication routes
  app.post("/api/login", (req, res, next) => {
    try {
      // Validate request body
      loginSchema.parse(req.body);
      
      passport.authenticate("local", (err: any, user: any, info: any) => {
        if (err) { 
          return next(err); 
        }
        if (!user) {
          return res.status(401).json({ 
            success: false, 
            message: info.message || "Authentication failed" 
          });
        }
        req.logIn(user, (err) => {
          if (err) { 
            return next(err); 
          }
          return res.status(200).json({ 
            success: true, 
            message: "Login successful",
            user: { id: user.id, username: user.username }
          });
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      next(error);
    }
  });
  
  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.status(200).json({ success: true, message: "Logged out successfully" });
    });
  });
  
  app.get("/api/session", (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user as any;
      return res.json({ 
        isAuthenticated: true, 
        user: { id: user.id, username: user.username } 
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

  const httpServer = createServer(app);
  return httpServer;
}
