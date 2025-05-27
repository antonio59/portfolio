/// <reference types="node" />

// Import project data
import { projects as frontendProjects } from "./ProjectData";

// Import API client and types
import {
  apiRequest,
  IBaseApiResponse,
  IProjectResponse,
  ISection,
  ICertification,
  IExperience,
} from "./apiClient";

// Mock experiences data since it's not available in ProjectData
interface IExperienceData {
  role: string;
  company: string;
  period: string;
  description: string;
}

const frontendExperiences: IExperienceData[] = [];

// Declare process.env for Node.js
declare const process: {
  env: {
    NODE_ENV?: string;
  };
};

// Logger implementation with proper TypeScript types
interface Logger {
  info: (..._args: unknown[]) => void;
  warn: (..._args: unknown[]) => void;
  error: (..._args: unknown[]) => void;
}

// Create logger instance with no-op functions
const logger: Logger = (() => {
  // Internal logger function that does nothing
  const noop = (..._args: unknown[]): void => {
    /* no-op */
  };

  // Create logger with default no-op functions
  const instance: Logger = {
    info: noop,
    warn: noop,
    error: noop,
  };

  // Enable console logging in development
  if (process.env.NODE_ENV === "development") {
    instance.info = (...args: unknown[]): void => {
       
       

      console.log("[INFO]", ...args);
    };

    instance.warn = (...args: unknown[]): void => {
       

      console.warn("[WARN]", ...args);
    };

    instance.error = (...args: unknown[]): void => {
       

      console.error("[ERROR]", ...args);
    };
  }

  return instance;
})();

// Define consistent return type for sync operations
interface SyncResult {
  success: boolean;
  count: number;
  message: string;
  errors?: string[];
}

// Define a generic type for API result data
type ApiResultData =
  | IBaseApiResponse
  | IProjectResponse
  | ISection
  | ICertification
  | IExperience;

// Function to sync projects from the frontend data to the backend
export async function syncProjects(): Promise<SyncResult> {
  const results: ApiResultData[] = [];
  const errors: string[] = [];

  // Map frontend projects format to the backend format
  for (const project of frontendProjects) {
    try {
      // Create a properly typed object that matches the IProjectResponse interface
      const formattedProject: IProjectResponse = {
        id: 0, // Temporary ID, will be assigned by the backend
        title: project.title,
        description: project.description || "",
        category: project.category || "app_development",
        imageUrl: project.imageUrl || "",
        githubLink: project.link || "",
        externalLink: project.link || "",
        technologies: ["HTML", "CSS", "JavaScript"],
        year: new Date().getFullYear().toString(),
        icon: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Make the API request with proper typing
      const response = await apiRequest<IProjectResponse, IProjectResponse>(
        "POST",
        "/api/bypass/projects",
        formattedProject,
      );

      if (response.success && response.data) {
        results.push(response.data);
      } else {
        errors.push(
          `Failed to sync project ${project.title}: ${response.error || "Unknown error"}`,
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      errors.push(`Error syncing project ${project.title}: ${errorMessage}`);
      logger.error(`Error syncing project ${project.title}:`, errorMessage);
    }
  }

  const success = results.length > 0 || errors.length === 0;
  const result: SyncResult = {
    success,
    count: results.length,
    message: success
      ? `Successfully synced ${results.length} projects from frontend data.`
      : "Failed to sync any projects.",
  };

  if (errors.length > 0) {
    result.errors = errors;
  }

  return result;
}

// Function to sync experiences from the frontend data to the backend
export async function syncExperiences(): Promise<SyncResult> {
  try {
    const results: ApiResultData[] = [];
    // Using for...of for better async/await handling
    for (const exp of frontendExperiences) {
      try {
        const formattedExp: IExperience = {
          title: exp.role,
          company: exp.company,
          period: exp.period,
          description: exp.description,
          // Adding default values for required fields
          achievements: ["Achievements will be added later"],
          methodologies: ["Methodologies will be added later"],
          order: 1, // Default order
        };

        const response = await apiRequest<IExperience, IExperience>(
          "POST",
          "/api/bypass/experiences",
          formattedExp,
        );
        if (response.success && response.data) {
          results.push(response.data);
        } else {
          throw new Error(response.error || "Failed to sync experience");
        }
      } catch (error) {
        logger.error(`Error syncing experience at ${exp.company}:`, error);
        // Continue with next experience even if one fails
      }
    }

    return {
      success: true,
      count: results.length,
      message: `Successfully synced ${results.length} experiences from frontend data.`,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    logger.error("Error syncing experiences:", errorMessage);
    return {
      success: false,
      count: 0,
      message: errorMessage,
    };
  }
}

// Function to create basic sections based on common portfolio elements
export async function createBasicSections(): Promise<SyncResult> {
  try {
    const sections = [
      { title: "About", slug: "about", content: "About me section content" },
      { title: "Projects", slug: "projects", content: "Projects showcase" },
      { title: "Experience", slug: "experience", content: "Work experience" },
      { title: "Contact", slug: "contact", content: "Get in touch" },
    ] as const;

    const results: ApiResultData[] = [];
    // Using for...of for better async/await handling
    for (const section of sections) {
      try {
        const sectionData: ISection = {
          title: section.title,
          slug: section.slug,
          content: section.content,
        };
        const response = await apiRequest<ISection, ISection>(
          "POST",
          "/api/bypass/sections",
          sectionData,
        );
        if (response.success && response.data) {
          results.push(response.data);
        } else {
          throw new Error(response.error || "Failed to create section");
        }
      } catch (error) {
        logger.error(`Error creating section ${section.slug}:`, error);
        // Continue with next section even if one fails
      }
    }

    return {
      success: true,
      count: results.length,
      message: `Created ${results.length} basic sections.`,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    logger.error("Error creating basic sections:", errorMessage);
    return {
      success: false,
      count: 0,
      message: errorMessage,
    };
  }
}

// Function to create sample certifications
export async function createSampleCertifications(): Promise<SyncResult> {
  try {
    const certifications = [
      {
        title: "AWS Certified Solutions Architect",
        issuer: "Amazon Web Services",
        issueDate: "2023-01-15",
        expiryDate: "2026-01-15",
        credentialId: "AWS12345678",
        credentialUrl: "https://www.credly.com/badges/12345678",
        skills: ["AWS", "Cloud Architecture", "Solutions Design"],
      },
      // Add more sample certifications as needed
    ];

    const results: ICertification[] = [];
    // Using for...of for better async/await handling
    for (const cert of certifications) {
      try {
        // Create a properly typed certification object with all required fields
        const certData: Omit<ICertification, "id" | "createdAt" | "updatedAt"> =
          {
            title: cert.title,
            issuer: cert.issuer,
            issueDate: cert.issueDate,
            expiryDate: cert.expiryDate,
            credentialId: cert.credentialId,
            credentialUrl: cert.credentialUrl,
            skills: cert.skills,
            // Omit id, createdAt, and updatedAt as they will be set by the server
          };

        // Make the API request with proper typing
        const response = await apiRequest<ICertification, typeof certData>(
          "POST",
          "/api/bypass/certifications",
          certData,
        );
        if (response.success && response.data) {
          results.push(response.data);
        } else {
          throw new Error(response.error || "Failed to create certification");
        }
      } catch (error) {
        logger.error(`Error creating certification ${cert.title}:`, error);
        // Continue with next certification even if one fails
      }
    }

    return {
      success: true,
      count: results.length,
      message: `Created ${results.length} sample certifications.`,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    logger.error("Error creating sample certifications:", errorMessage);
    return {
      success: false,
      count: 0,
      message: errorMessage,
    };
  }
}

// Function to create featured projects section
export async function createFeaturedProjectsSection(): Promise<SyncResult> {
  try {
    const response = await fetch("/api/bypass/experiences/featured");
    const result = (await response.json()) as {
      length: number;
      message?: string;
    };

    if (response.ok) {
      return {
        success: true,
        count: result.length,
        message: `Successfully retrieved featured experiences.`,
      };
    } else {
      throw new Error(result.message || "Failed to fetch featured experiences");
    }
  } catch (error) {
    logger.error("Error creating featured projects section:", error);
    return {
      success: false,
      count: 0,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

// Function to create certification section
export async function createCertificationSection(): Promise<SyncResult> {
  try {
    // Check if we need to fetch any data from the backend
    const healthResponse = await fetch("/api/bypass/health");
    const healthData = (await healthResponse.json()) as { status?: string };

    if (!healthResponse.ok) {
      logger.error("Backend health check failed:", healthData);
      return {
        success: false,
        count: 0,
        message: "Backend is not available. Please try again later.",
      };
    } else {
      return {
        success: true,
        count: 1,
        message: "Backend is healthy and responsive.",
      };
    }
  } catch (error) {
    logger.error("Error creating certification section:", error);
    return {
      success: false,
      count: 0,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

// Define the return type for syncAllData
interface SyncAllDataResult {
  projects: SyncResult & { featured: SyncResult };
  experiences: SyncResult;
  sections: SyncResult & {
    featuredSection: SyncResult;
    certificationSection: SyncResult;
  };
  certifications: SyncResult;
  specializedProjects: SyncResult;
  success: boolean;
}

export async function syncAllData(): Promise<SyncAllDataResult> {
  // Import main data
  const projectResult = await syncProjects();
  const experienceResult = await syncExperiences();
  const sectionResult = await createBasicSections();

  // Create additional sections
  const featuredSectionResult = await createFeaturedProjectsSection();
  const certificationSectionResult = await createCertificationSection();

  // Create sample certifications
  const certificationsResult = await createSampleCertifications();

  // Import specialized app & PM projects
  let specializedProjectsResult: SyncResult = {
    success: true,
    count: 0,
    message: "",
  };
  try {
    const { importAllSpecializedProjects } = await import(
      "./importPersonalProjects"
    );
    const result = await importAllSpecializedProjects();
    specializedProjectsResult = {
      success: result.success,
      count: (result.personal?.count || 0) + (result.professional?.count || 0),
      message: `Successfully imported specialized projects: ${result.personal?.count || 0} personal and ${result.professional?.count || 0} professional.`,
    };
  } catch (error) {
    logger.error("Error importing specialized projects:", error);
    specializedProjectsResult = {
      success: false,
      count: 0,
      message: error instanceof Error ? error.message : String(error),
    };
  }

  // Update featured status for some projects
  let featuredProjectsResult: SyncResult = {
    success: true,
    count: 0,
    message: "",
  };
  try {
    // Get all projects first
    const projectsResponse = await fetch("/api/bypass/projects");
    const allProjects = (await projectsResponse.json()) as { id: string }[];

    // Select up to 3 projects to mark as featured
    const projectsToFeature = allProjects.slice(0, 3);
    let featuredCount = 0;

    for (let i = 0; i < projectsToFeature.length; i++) {
      const project = projectsToFeature[i];
      const updateResponse = await fetch(`/api/bypass/projects/${project.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          featured: true,
          featuredOrder: i + 1,
        }),
      });

      if (updateResponse.ok) {
        featuredCount++;
      }
    }

    featuredProjectsResult = {
      success: true,
      count: featuredCount,
      message: `Successfully marked ${featuredCount} projects as featured.`,
    };
  } catch (error) {
    logger.error("Error marking featured projects:", error);
    featuredProjectsResult = {
      success: false,
      count: 0,
      message: error instanceof Error ? error.message : String(error),
    };
  }

  return {
    projects: {
      ...projectResult,
      count: (projectResult.count || 0) + specializedProjectsResult.count,
      featured: featuredProjectsResult,
    },
    experiences: experienceResult,
    sections: {
      ...sectionResult,
      count:
        (sectionResult.count || 0) +
        featuredSectionResult.count +
        certificationSectionResult.count,
      featuredSection: featuredSectionResult,
      certificationSection: certificationSectionResult,
    },
    certifications: certificationsResult,
    specializedProjects: specializedProjectsResult,
    success:
      projectResult.success &&
      experienceResult.success &&
      sectionResult.success &&
      specializedProjectsResult.success &&
      featuredSectionResult.success &&
      certificationSectionResult.success &&
      certificationsResult.success &&
      featuredProjectsResult.success,
  };
}
