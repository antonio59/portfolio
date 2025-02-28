import { apiRequest } from "@/lib/queryClient";
import { projects as frontendProjects, experiences as frontendExperiences } from "@/utils/ProjectData";

// Function to sync projects from the frontend data to the backend
export async function syncProjects() {
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
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

// Function to sync experiences from the frontend data to the backend
export async function syncExperiences() {
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
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

// Function to create basic sections based on common portfolio elements
export async function createBasicSections() {
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
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

// Function to sync all data at once, including specialized projects
export async function syncAllData() {
  // Import main data
  const projectResult = await syncProjects();
  const experienceResult = await syncExperiences();
  const sectionResult = await createBasicSections();
  
  // Import specialized app & PM projects
  let specializedProjectsResult = { success: true, count: 0 };
  try {
    const { importAllSpecializedProjects } = await import("./importPersonalProjects");
    const result = await importAllSpecializedProjects();
    specializedProjectsResult = {
      success: result.success,
      count: (result.personal?.count || 0) + (result.professional?.count || 0)
    };
  } catch (error) {
    console.error("Error importing specialized projects:", error);
    specializedProjectsResult = { 
      success: false, 
      count: 0,
      error: error instanceof Error ? error.message : String(error)
    };
  }
  
  return {
    projects: {
      ...projectResult,
      count: (projectResult.count || 0) + specializedProjectsResult.count
    },
    experiences: experienceResult,
    sections: sectionResult,
    specializedProjects: specializedProjectsResult,
    success: projectResult.success && 
             experienceResult.success && 
             sectionResult.success && 
             specializedProjectsResult.success
  };
}