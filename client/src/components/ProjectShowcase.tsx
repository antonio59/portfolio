import { useState } from "react";
import { motion } from "framer-motion";

interface ProjectItem {
  id: number;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  link: string;
  role?: string;
  challenges?: string[];
  outcomes?: string[];
  type: "professional" | "personal";
}

const projectsData: ProjectItem[] = [
  // Professional Project Management Projects
  {
    id: 1,
    title: "Enterprise Digital Transformation",
    description: "Led a cross-functional team to implement a company-wide digital transformation initiative, modernizing legacy systems and introducing new technologies to improve operational efficiency.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    technologies: ["Agile", "PRINCE2", "Jira", "Confluence"],
    link: "#",
    role: "Programme Manager",
    challenges: [
      "Coordinating across 6 departments with competing priorities",
      "Managing a $2.5M budget with strict governance requirements",
      "Ensuring minimal disruption to business operations during transition"
    ],
    outcomes: [
      "Delivered on time and under budget by 8%",
      "Increased operational efficiency by 35%",
      "Reduced manual processes by 70%"
    ],
    type: "professional"
  },
  {
    id: 2,
    title: "Healthcare System Migration",
    description: "Managed the migration of a critical healthcare management system serving 18 regional hospitals, ensuring data integrity and compliance with regulatory requirements.",
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    technologies: ["PRINCE2", "MSP", "Microsoft Project", "HIPAA"],
    link: "#",
    role: "Project Manager",
    challenges: [
      "Ensuring zero data loss during migration",
      "Maintaining 24/7 system availability during transition",
      "Coordinating with regulatory bodies for compliance approval"
    ],
    outcomes: [
      "Successfully migrated 12TB of sensitive patient data with no loss",
      "Reduced system downtime by 85% compared to industry standard",
      "Achieved compliance certification ahead of schedule"
    ],
    type: "professional"
  },
  {
    id: 3,
    title: "Financial Services Platform Launch",
    description: "Directed the development and launch of a next-generation financial services platform serving over 500,000 customers with strict security and compliance requirements.",
    image: "https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    technologies: ["Agile", "PMP", "Azure DevOps", "PCI-DSS"],
    link: "#",
    role: "Senior Project Manager",
    challenges: [
      "Implementing rigorous security standards without compromising user experience",
      "Coordinating with multiple financial regulatory bodies",
      "Managing a distributed team across 4 time zones"
    ],
    outcomes: [
      "Platform achieved 99.99% uptime from launch",
      "Passed all security audits on first review",
      "Onboarded 200,000 users within first quarter"
    ],
    type: "professional"
  },
  
  // Personal Hobby Projects
  {
    id: 4,
    title: "Weather Visualization App",
    description: "A beautifully designed weather application that provides real-time weather data visualization with animated transitions and intuitive user interface.",
    image: "https://images.unsplash.com/photo-1592210454359-9043f067919b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    technologies: ["React", "TypeScript", "D3.js", "OpenWeather API"],
    link: "#",
    type: "personal"
  },
  {
    id: 5,
    title: "Recipe Finder Mobile App",
    description: "A mobile application that allows users to find recipes based on ingredients they already have, with filtering options for dietary restrictions and cooking time.",
    image: "https://images.unsplash.com/photo-1505935428862-770b6f24f629?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1167&q=80",
    technologies: ["React Native", "Redux", "Firebase", "Spoonacular API"],
    link: "#",
    type: "personal"
  },
  {
    id: 6,
    title: "Fitness Tracker Dashboard",
    description: "A comprehensive fitness tracking dashboard that integrates with wearable devices to provide personalized workout statistics and progress visualization.",
    image: "https://images.unsplash.com/photo-1632781297772-1d68f375d878?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
    technologies: ["Vue.js", "Node.js", "MongoDB", "Chart.js"],
    link: "#",
    type: "personal"
  }
];

export default function ProjectShowcase() {
  const [activeProject, setActiveProject] = useState<number | null>(null);
  
  const professionalProjects = projectsData.filter(project => project.type === "professional");
  const personalProjects = projectsData.filter(project => project.type === "personal");
  
  // Function to toggle project details expansion
  const toggleProjectDetails = (projectId: number) => {
    if (activeProject === projectId) {
      setActiveProject(null);
    } else {
      setActiveProject(projectId);
    }
  };
  
  return (
    <section className="py-20 bg-primaryBg" id="projects">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto mb-16 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-textColor">Featured Projects</h2>
          <p className="text-lg text-gray-600">A showcase of my professional project management experience and personal development projects.</p>
        </motion.div>
        
        {/* Professional Projects Section */}
        <div className="mb-24">
          <motion.h3 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-8 text-textColor border-l-4 border-accentColor pl-4"
          >
            Professional Project Management
          </motion.h3>
          
          <div className="space-y-32">
            {professionalProjects.map((project, index) => (
              <motion.div 
                key={project.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true, margin: "-50px" }}
                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 items-center`}
              >
                <div className="w-full lg:w-7/12 overflow-hidden rounded-lg shadow-lg">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "tween", duration: 0.5 }}
                    className="relative group h-[300px] md:h-[400px] overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-accentColor/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                      <a href={project.link} className="px-6 py-3 bg-white text-accentColor font-medium rounded-md hover:bg-gray-100 transition-colors duration-300">
                        View Project
                      </a>
                    </div>
                    <img 
                      src={project.image} 
                      alt={project.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </motion.div>
                </div>
                
                <div className="w-full lg:w-5/12">
                  <span className="text-sm font-medium text-accentColor">Professional Project</span>
                  <h3 className="text-2xl md:text-3xl font-bold mt-2 mb-4 text-textColor">{project.title}</h3>
                  
                  <div className="bg-secondaryBg p-6 rounded-lg shadow-md mb-6">
                    <p className="text-gray-700 mb-3">{project.description}</p>
                    {project.role && <p className="text-accentColor font-medium">Role: {project.role}</p>}
                  </div>
                  
                  {/* Expandable details */}
                  <div className="mb-6">
                    <button 
                      onClick={() => toggleProjectDetails(project.id)}
                      className="flex items-center text-accentColor hover:text-highlightColor font-medium mb-4 transition-colors"
                    >
                      <span className="mr-2">
                        {activeProject === project.id ? "Hide Details" : "View Project Details"}
                      </span>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        className={`transform transition-transform ${activeProject === project.id ? 'rotate-180' : ''}`}
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>
                    
                    {activeProject === project.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        {project.challenges && project.challenges.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-bold text-textColor mb-2">Key Challenges:</h4>
                            <ul className="list-disc list-inside text-gray-700 space-y-1">
                              {project.challenges.map((challenge, i) => (
                                <li key={i}>{challenge}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {project.outcomes && project.outcomes.length > 0 && (
                          <div>
                            <h4 className="font-bold text-textColor mb-2">Outcomes:</h4>
                            <ul className="list-disc list-inside text-gray-700 space-y-1">
                              {project.outcomes.map((outcome, i) => (
                                <li key={i}>{outcome}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mb-6">
                    {project.technologies.map((tech, techIndex) => (
                      <span key={techIndex} className="bg-gray-200 px-3 py-1 rounded-full text-sm text-gray-700">
                        {tech}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex gap-4">
                    <a href={project.link} className="text-gray-700 hover:text-accentColor transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Personal Projects Section */}
        <div>
          <motion.h3 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-8 text-textColor border-l-4 border-accentColor pl-4"
          >
            Personal App Development
          </motion.h3>
          
          <div className="space-y-32">
            {personalProjects.map((project, index) => (
              <motion.div 
                key={project.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true, margin: "-50px" }}
                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 items-center`}
              >
                <div className="w-full lg:w-7/12 overflow-hidden rounded-lg shadow-lg">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "tween", duration: 0.5 }}
                    className="relative group h-[300px] md:h-[400px] overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-accentColor/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                      <a href={project.link} className="px-6 py-3 bg-white text-accentColor font-medium rounded-md hover:bg-gray-100 transition-colors duration-300">
                        View Project
                      </a>
                    </div>
                    <img 
                      src={project.image} 
                      alt={project.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </motion.div>
                </div>
                
                <div className="w-full lg:w-5/12">
                  <span className="text-sm font-medium text-accentColor">Personal Project</span>
                  <h3 className="text-2xl md:text-3xl font-bold mt-2 mb-4 text-textColor">{project.title}</h3>
                  <div className="bg-secondaryBg p-6 rounded-lg shadow-md mb-6">
                    <p className="text-gray-700">{project.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-3 mb-6">
                    {project.technologies.map((tech, techIndex) => (
                      <span key={techIndex} className="bg-gray-200 px-3 py-1 rounded-full text-sm text-gray-700">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    <a href={project.link} className="text-gray-700 hover:text-accentColor transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                      </svg>
                    </a>
                    <a href={project.link} className="text-gray-700 hover:text-accentColor transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}