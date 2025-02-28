import { apiRequest } from "@/lib/queryClient";

// Define types to match our schema
export interface ImportableProject {
  title: string;
  description: string;
  category: string;
  technologies: string[]; // Will be converted to JSON
  year?: string;
  icon?: string;
  githubLink?: string;
  externalLink?: string;
  challenges?: string[]; // Will be converted to JSON
  outcomes?: string[]; // Will be converted to JSON
  role?: string;
}

export interface ImportableExperience {
  company: string;
  role: string;
  period: string;
  description: string[]; // Will be converted to JSON
  achievements: string[]; // Will be converted to JSON
  methodologies: string[]; // Will be converted to JSON
  order: number;
}

export interface ImportableSection {
  title: string;
  subtitle?: string;
  content: any; // Will be converted to JSON
  type: "hero" | "about" | "professionalProject" | "personalProject" | "experience" | "contact";
}

// Sample data adapted for our schema
const sampleProjects: ImportableProject[] = [
  {
    title: "Portfolio Website Redesign",
    description: "A complete redesign of a professional portfolio website with modern UI/UX principles. Features responsive design, dynamic content loading, and a custom CMS for content management.",
    category: "professional",
    technologies: ["React", "TypeScript", "Tailwind CSS", "Next.js"],
    githubLink: "https://github.com/antoniosmith/portfolio-redesign",
    externalLink: "https://antoniosmith.me",
    year: "2023",
    icon: "code",
    challenges: ["Implementing responsive design across all device sizes", "Creating a performant image loading system", "Designing an intuitive admin interface"],
    outcomes: ["30% improvement in page load time", "Increased mobile engagement by 45%", "Streamlined content management workflow"],
    role: "Lead Developer"
  },
  {
    title: "Project Management Dashboard",
    description: "Enterprise-level project management dashboard with real-time analytics, team collaboration features, and customizable workflows for different project types.",
    category: "professional",
    technologies: ["React", "Redux", "Node.js", "Express", "MongoDB", "Socket.io"],
    externalLink: "https://pm-dashboard-demo.antoniosmith.me",
    year: "2022",
    icon: "layout-dashboard",
    challenges: ["Implementing real-time data synchronization", "Designing intuitive data visualizations", "Creating a customizable workflow engine"],
    outcomes: ["Reduced project reporting time by 65%", "Improved team collaboration metrics", "Successful deployment to 5 enterprise clients"],
    role: "Frontend Developer"
  },
  {
    title: "Team Collaboration Platform",
    description: "A comprehensive team collaboration platform with features like task management, file sharing, chat, video conferencing, and calendar integration.",
    category: "professional",
    technologies: ["Angular", "TypeScript", "Firebase", "Material UI", "WebRTC"],
    year: "2022",
    icon: "users",
    challenges: ["Building reliable video conferencing features", "Implementing secure document sharing", "Creating an intuitive UX for diverse user types"],
    outcomes: ["98.5% uptime for communication services", "Secured HIPAA compliance certification", "Positive user satisfaction ratings (4.8/5)"],
    role: "Full Stack Developer"
  },
  {
    title: "Weather Forecasting App",
    description: "A hobby project that provides detailed weather forecasts with interactive maps, hourly predictions, and severe weather alerts.",
    category: "hobby",
    technologies: ["React Native", "JavaScript", "Weather API", "Geolocation"],
    githubLink: "https://github.com/antoniosmith/weather-app",
    year: "2023",
    icon: "cloud-sun"
  },
  {
    title: "Recipe Finder",
    description: "A personal project for finding recipes based on available ingredients, dietary restrictions, and cooking time. Includes meal planning and grocery list features.",
    category: "hobby",
    technologies: ["Vue.js", "Vuex", "Node.js", "Express", "MongoDB"],
    githubLink: "https://github.com/antoniosmith/recipe-finder",
    year: "2023",
    icon: "utensils"
  }
];

const sampleExperiences: ImportableExperience[] = [
  {
    role: "Senior Project Manager",
    company: "TechCorp Solutions",
    period: "Jan 2020 - Present",
    description: [
      "Leading enterprise software development projects with cross-functional teams of 10-15 members",
      "Implementing agile methodologies that increased on-time delivery by 35%",
      "Managing client relationships and ensuring project deliverables meet business objectives"
    ],
    achievements: [
      "Reduced project delivery time by 25% through process optimization",
      "Increased client satisfaction ratings from 3.8 to 4.7 out of 5",
      "Successfully managed $2.5M in project budgets with under 3% variance"
    ],
    methodologies: ["Agile", "Scrum", "Kanban", "Lean", "Waterfall"],
    order: 1
  },
  {
    role: "Project Manager",
    company: "Digital Innovations Inc.",
    period: "Mar 2017 - Dec 2019",
    description: [
      "Managed the development and deployment of custom web applications for Fortune 500 clients",
      "Coordinated with stakeholders to gather requirements and ensure alignment with business goals",
      "Successfully delivered 12 major projects with a combined budget of $3.5M"
    ],
    achievements: [
      "Implemented new project tracking system that improved efficiency by 20%",
      "Received company award for excellence in client management",
      "Mentored 5 junior project managers who were later promoted to senior roles"
    ],
    methodologies: ["Prince2", "PMI", "Agile", "Hybrid"],
    order: 2
  },
  {
    role: "Assistant Project Manager",
    company: "WebSoft Technologies",
    period: "Jun 2015 - Feb 2017",
    description: [
      "Assisted the senior project manager in coordinating web development projects",
      "Created and maintained project documentation, timelines, and status reports",
      "Facilitated daily stand-up meetings and sprint planning sessions"
    ],
    achievements: [
      "Improved meeting efficiency by 30% through better agenda management",
      "Created standardized reporting templates adopted company-wide",
      "Helped deliver 8 projects on time and within budget"
    ],
    methodologies: ["Scrum", "Agile", "Documentation", "Reporting"],
    order: 3
  }
];

const sampleSections: ImportableSection[] = [
  {
    title: "About Me",
    subtitle: "Professional Project Manager",
    content: ["I'm a seasoned project manager with over 8 years of experience in the tech industry, specializing in leading complex software development projects from inception to deployment. My approach combines technical knowledge with strong communication skills to bridge the gap between development teams and stakeholders.", "With expertise in both traditional and agile methodologies, I adapt my management style to suit each project's unique requirements. I'm passionate about fostering team collaboration and implementing efficient processes that deliver high-quality results on time and within budget."],
    type: "about"
  },
  {
    title: "Get In Touch",
    subtitle: "Let's Connect",
    content: ["I'm always interested in hearing about new projects and opportunities. Whether you're looking for a project manager to join your team or just want to connect, feel free to reach out!"],
    type: "contact"
  },
  {
    title: "Welcome to My Portfolio",
    subtitle: "Turning Ideas into Reality",
    content: ["I'm Antonio Smith, a Project Manager specializing in tech and digital transformation. With a focus on delivering excellence, I help teams build innovative solutions that drive business success."],
    type: "hero"
  }
];

// Functions to import sample data
export async function importProjects() {
  try {
    const results = [];
    for (const project of sampleProjects) {
      const response = await apiRequest("POST", "/api/admin/projects", project);
      const result = await response.json();
      results.push(result);
    }
    return { success: true, count: results.length, message: `Successfully imported ${results.length} projects.` };
  } catch (error) {
    console.error("Error importing projects:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function importExperiences() {
  try {
    const results = [];
    for (const experience of sampleExperiences) {
      const response = await apiRequest("POST", "/api/admin/experiences", experience);
      const result = await response.json();
      results.push(result);
    }
    return { success: true, count: results.length, message: `Successfully imported ${results.length} experiences.` };
  } catch (error) {
    console.error("Error importing experiences:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function importSections() {
  try {
    const results = [];
    for (const section of sampleSections) {
      const response = await apiRequest("POST", "/api/admin/sections", section);
      const result = await response.json();
      results.push(result);
    }
    return { success: true, count: results.length, message: `Successfully imported ${results.length} sections.` };
  } catch (error) {
    console.error("Error importing sections:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function importAllContent() {
  const projectResult = await importProjects();
  const experienceResult = await importExperiences();
  const sectionResult = await importSections();
  
  return {
    projects: projectResult,
    experiences: experienceResult,
    sections: sectionResult,
    success: projectResult.success && experienceResult.success && sectionResult.success
  };
}