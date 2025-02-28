import { apiRequest } from "@/lib/queryClient";
import { projects as frontendProjects, experiences as frontendExperiences } from "@/utils/ProjectData";

// Function to sync projects from the frontend data to the backend
// Define consistent return type for sync operations
type SyncResult = {
  success: boolean;
  count: number;
  message: string;
};

export async function syncProjects(): Promise<SyncResult> {
  try {
    const results = [];
    // Map frontend projects format to the backend format
    // Using a traditional for loop for async operations
    for (let i = 0; i < frontendProjects.length; i++) {
      const project = frontendProjects[i];
      const formattedProject = {
        title: project.title,
        description: project.description,
        category: project.category === "professional" ? "project_management" : "app_development",
        technologies: ["HTML", "CSS", "JavaScript"], // Default technologies
        imageUrl: project.imageUrl || "",
        githubLink: project.link || "",
        externalLink: project.link || "",
        icon: "",
        year: new Date().getFullYear().toString()
      };
      
      const response = await apiRequest("POST", "/api/admin/projects", formattedProject);
      const result = await response.json();
      results.push(result);
    }
    
    return { 
      success: true, 
      count: results.length, 
      message: `Successfully synced ${results.length} projects from frontend data.` 
    };
  } catch (error) {
    console.error("Error syncing projects:", error);
    return { 
      success: false, 
      count: 0,
      message: error instanceof Error ? error.message : String(error) 
    };
  }
}

// Function to sync experiences from the frontend data to the backend
export async function syncExperiences(): Promise<SyncResult> {
  try {
    const results = [];
    // Map frontend experiences format to the backend format
    // Using a traditional for loop for async operations
    for (let i = 0; i < frontendExperiences.length; i++) {
      const experience = frontendExperiences[i];
      const formattedExperience = {
        role: experience.role,
        company: experience.company,
        period: experience.period,
        description: [experience.description], // Convert to array since backend expects array
        achievements: ["Achievements will be added later"], // Placeholder
        methodologies: ["Methodologies will be added later"], // Placeholder
        order: i + 1
      };
      
      const response = await apiRequest("POST", "/api/admin/experiences", formattedExperience);
      const result = await response.json();
      results.push(result);
    }
    
    return { 
      success: true, 
      count: results.length, 
      message: `Successfully synced ${results.length} experiences from frontend data.` 
    };
  } catch (error) {
    console.error("Error syncing experiences:", error);
    return { 
      success: false, 
      count: 0,
      message: error instanceof Error ? error.message : String(error) 
    };
  }
}

// Function to create basic sections based on common portfolio elements
export async function createBasicSections(): Promise<SyncResult> {
  try {
    const results = [];
    const basicSections = [
      {
        title: "About Me",
        subtitle: "Professional Overview",
        content: ["I'm a professional with expertise in project management and software development. My approach combines technical knowledge with strong communication skills to bridge the gap between development teams and stakeholders.", "With experience in both traditional and agile methodologies, I adapt my management style to suit each project's unique requirements."],
        type: "about"
      },
      {
        title: "My Work",
        subtitle: "Professional Projects",
        content: ["Browse through my collection of projects showcasing my skills and expertise."],
        type: "professionalProject"
      },
      {
        title: "Personal Projects",
        subtitle: "Hobby & Side Projects",
        content: ["A collection of personal projects I've worked on outside of my professional career."],
        type: "personalProject"
      },
      {
        title: "Get In Touch",
        subtitle: "Contact Information",
        content: ["I'm always interested in hearing about new projects and opportunities. Feel free to reach out!"],
        type: "contact"
      }
    ];
    
    // Using a traditional for loop for async operations
    for (let i = 0; i < basicSections.length; i++) {
      const section = basicSections[i];
      const response = await apiRequest("POST", "/api/admin/sections", { ...section, order: i });
      const result = await response.json();
      results.push(result);
    }
    
    return { 
      success: true, 
      count: results.length, 
      message: `Successfully created ${results.length} basic sections.` 
    };
  } catch (error) {
    console.error("Error creating basic sections:", error);
    return { 
      success: false, 
      count: 0,
      message: error instanceof Error ? error.message : String(error) 
    };
  }
}

// Function to create sample certifications
export async function createSampleCertifications(): Promise<SyncResult> {
  try {
    const results = [];
    const sampleCertifications = [
      {
        title: "Project Management Professional (PMP)",
        issuer: "Project Management Institute",
        issueDate: "June 2023",
        expiryDate: "June 2026",
        credentialID: "PMP-123456",
        credentialURL: "https://www.pmi.org/certifications/project-management-pmp",
        description: "The Project Management Professional (PMP) certification is the most important industry-recognized certification for project managers.",
        skills: ["Project Planning", "Risk Management", "Stakeholder Communication", "Agile Methodologies"],
        featured: true,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Project_Management_Institute_logo.svg/1200px-Project_Management_Institute_logo.svg.png"
      },
      {
        title: "Certified ScrumMaster (CSM)",
        issuer: "Scrum Alliance",
        issueDate: "March 2022",
        expiryDate: "March 2024",
        credentialID: "CSM-789012",
        credentialURL: "https://www.scrumalliance.org/certifications/practitioners/certified-scrummaster-csm",
        description: "The Certified ScrumMaster certification demonstrates understanding of Scrum principles and application.",
        skills: ["Scrum", "Agile", "Sprint Planning", "Team Facilitation"],
        featured: true,
        imageUrl: "https://www.scrumalliance.org/ScrumRedesignDEVSite/media/ScrumAllianceMedia/SA-Logos/CSM-Logo.png"
      },
      {
        title: "AWS Certified Solutions Architect",
        issuer: "Amazon Web Services",
        issueDate: "January 2023",
        expiryDate: "January 2026",
        credentialID: "AWS-345678",
        credentialURL: "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
        description: "The AWS Certified Solutions Architect - Associate certification validates expertise in designing and deploying systems on AWS.",
        skills: ["Cloud Architecture", "AWS Services", "High Availability", "Security"],
        featured: false,
        imageUrl: "https://d1.awsstatic.com/training-and-certification/certification-badges/AWS-Certified-Solutions-Architect-Associate_badge.3419559c682629072f1eb968d59dea0741772c0f.png"
      }
    ];
    
    // Using a traditional for loop for async operations
    for (let i = 0; i < sampleCertifications.length; i++) {
      const certification = sampleCertifications[i];
      const response = await apiRequest("POST", "/api/admin/certifications", certification);
      const result = await response.json();
      results.push(result);
    }
    
    return { 
      success: true, 
      count: results.length, 
      message: `Successfully created ${results.length} sample certifications.` 
    };
  } catch (error) {
    console.error("Error creating sample certifications:", error);
    return { 
      success: false, 
      count: 0,
      message: error instanceof Error ? error.message : String(error) 
    };
  }
}

// Function to create featured projects section
export async function createFeaturedProjectsSection(): Promise<SyncResult> {
  try {
    const featuredSection = {
      title: "Featured Projects",
      subtitle: "Highlighted Professional Work",
      content: ["A selection of my most impactful and innovative projects."],
      type: "featuredProject"
    };
    
    const response = await apiRequest("POST", "/api/admin/sections", featuredSection);
    const result = await response.json();
    
    return { 
      success: true, 
      count: 1, 
      message: "Successfully created featured projects section." 
    };
  } catch (error) {
    console.error("Error creating featured projects section:", error);
    return { 
      success: false, 
      count: 0,
      message: error instanceof Error ? error.message : String(error) 
    };
  }
}

// Function to create certification section
export async function createCertificationSection(): Promise<SyncResult> {
  try {
    const certificationSection = {
      title: "Professional Certifications",
      subtitle: "Industry Qualifications & Credentials",
      content: ["A collection of my professional certifications and qualifications."],
      type: "certification"
    };
    
    const response = await apiRequest("POST", "/api/admin/sections", certificationSection);
    const result = await response.json();
    
    return { 
      success: true, 
      count: 1, 
      message: "Successfully created certification section." 
    };
  } catch (error) {
    console.error("Error creating certification section:", error);
    return { 
      success: false, 
      count: 0,
      message: error instanceof Error ? error.message : String(error) 
    };
  }
}

export async function syncAllData() {
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
  let specializedProjectsResult: SyncResult = { success: true, count: 0, message: "" };
  try {
    const { importAllSpecializedProjects } = await import("./importPersonalProjects");
    const result = await importAllSpecializedProjects();
    specializedProjectsResult = {
      success: result.success,
      count: (result.personal?.count || 0) + (result.professional?.count || 0),
      message: `Successfully imported specialized projects: ${(result.personal?.count || 0)} personal and ${(result.professional?.count || 0)} professional.`
    };
  } catch (error) {
    console.error("Error importing specialized projects:", error);
    specializedProjectsResult = { 
      success: false, 
      count: 0,
      message: error instanceof Error ? error.message : String(error)
    };
  }
  
  // Update featured status for some projects
  let featuredProjectsResult: SyncResult = { success: true, count: 0, message: "" };
  try {
    // Get all projects first
    const projectsResponse = await apiRequest("GET", "/api/admin/projects");
    const allProjects = await projectsResponse.json();
    
    // Select up to 3 projects to mark as featured
    const projectsToFeature = allProjects.slice(0, 3);
    let featuredCount = 0;
    
    for (let i = 0; i < projectsToFeature.length; i++) {
      const project = projectsToFeature[i];
      const updateResponse = await apiRequest("PUT", `/api/admin/projects/${project.id}`, {
        featured: true,
        featuredOrder: i + 1
      });
      
      if (updateResponse.ok) featuredCount++;
    }
    
    featuredProjectsResult = {
      success: true,
      count: featuredCount,
      message: `Successfully marked ${featuredCount} projects as featured.`
    };
  } catch (error) {
    console.error("Error marking featured projects:", error);
    featuredProjectsResult = {
      success: false,
      count: 0,
      message: error instanceof Error ? error.message : String(error)
    };
  }
  
  return {
    projects: {
      ...projectResult,
      count: (projectResult.count || 0) + specializedProjectsResult.count,
      featured: featuredProjectsResult
    },
    experiences: experienceResult,
    sections: {
      ...sectionResult,
      count: (sectionResult.count || 0) + featuredSectionResult.count + certificationSectionResult.count,
      featuredSection: featuredSectionResult,
      certificationSection: certificationSectionResult
    },
    certifications: certificationsResult,
    specializedProjects: specializedProjectsResult,
    success: projectResult.success && 
             experienceResult.success && 
             sectionResult.success && 
             specializedProjectsResult.success &&
             featuredSectionResult.success &&
             certificationSectionResult.success &&
             certificationsResult.success &&
             featuredProjectsResult.success
  };
}