import { apiRequest } from "@/lib/queryClient";

// Define personal app projects based on the screenshot
const personalAppProjects = [
  {
    title: "Budget Tracker",
    description: "A personal finance management app with expense categorization and visualization tools.",
    category: "app_development",
    technologies: ["React", "TypeScript", "Chart.js", "Firebase"],
    imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    githubLink: "https://github.com/username/budget-tracker",
    externalLink: "https://budget-tracker-demo.com",
    icon: "wallet",
    year: "2023"
  },
  {
    title: "Meal Planner",
    description: "A weekly meal planning app with nutritional information and grocery list generation.",
    category: "app_development",
    technologies: ["Vue.js", "Vuex", "Node.js", "MongoDB"],
    imageUrl: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    githubLink: "https://github.com/username/meal-planner",
    externalLink: "https://meal-planner-demo.com",
    icon: "utensils",
    year: "2022"
  },
  {
    title: "Habit Tracker",
    description: "A minimal habit tracking application with streaks, reminders and progress visualization.",
    category: "app_development",
    technologies: ["Flutter", "Dart", "Firebase"],
    imageUrl: "https://images.unsplash.com/photo-1505455184862-554165e5f6ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    githubLink: "https://github.com/username/habit-tracker",
    externalLink: "https://habit-tracker-demo.com",
    icon: "check-square",
    year: "2023"
  }
];

// Define professional project management projects
const professionalProjects = [
  {
    title: "Enterprise CRM Migration",
    description: "Led a cross-functional team in migrating a legacy CRM system to a modern cloud-based solution, resulting in 35% improved efficiency and $500K annual cost savings.",
    category: "project_management",
    technologies: ["Salesforce", "Agile", "JIRA", "SQL"],
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    githubLink: "",
    externalLink: "",
    icon: "briefcase",
    year: "2024"
  },
  {
    title: "Healthcare Data Integration Platform",
    description: "Managed development of a HIPAA-compliant data integration platform connecting multiple healthcare systems, streamlining patient data access across departments.",
    category: "project_management",
    technologies: ["HL7 FHIR", "Azure", "Scrum", "PowerBI"],
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    githubLink: "",
    externalLink: "",
    icon: "activity",
    year: "2023"
  },
  {
    title: "Supply Chain Optimization Initiative",
    description: "Spearheaded a supply chain optimization project that reduced inventory costs by 22% while maintaining 99.5% fulfillment rates through improved forecasting models.",
    category: "project_management",
    technologies: ["SAP", "Lean Six Sigma", "Tableau", "Prince2"],
    imageUrl: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    githubLink: "",
    externalLink: "",
    icon: "truck",
    year: "2022"
  }
];

// Function to import personal app development projects
export async function importPersonalAppProjects() {
  try {
    const results = [];
    
    // Import each personal app project
    for (let i = 0; i < personalAppProjects.length; i++) {
      const project = personalAppProjects[i];
      
      const response = await apiRequest("POST", "/api/bypass/projects", project);
      const result = await response.json();
      results.push(result);
    }
    
    return {
      success: true,
      count: results.length,
      message: `Successfully imported ${results.length} personal app development projects.`
    };
  } catch (error) {
    console.error("Error importing personal app projects:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Function to import professional project management projects
export async function importProfessionalProjects() {
  try {
    const results = [];
    
    // Import each professional project
    for (let i = 0; i < professionalProjects.length; i++) {
      const project = professionalProjects[i];
      
      const response = await apiRequest("POST", "/api/bypass/projects", project);
      const result = await response.json();
      results.push(result);
    }
    
    return {
      success: true,
      count: results.length,
      message: `Successfully imported ${results.length} professional project management projects.`
    };
  } catch (error) {
    console.error("Error importing professional projects:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Import both personal app and professional projects
export async function importAllSpecializedProjects() {
  const personalResults = await importPersonalAppProjects();
  const professionalResults = await importProfessionalProjects();
  
  return {
    personal: personalResults,
    professional: professionalResults,
    success: personalResults.success && professionalResults.success
  };
}