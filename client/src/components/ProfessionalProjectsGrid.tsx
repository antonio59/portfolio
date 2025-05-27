import { motion } from "framer-motion";

interface ProjectTech {
  name: string;
}

export interface ProfessionalProjectItem {
  id: number;
  title: string;
  description: string;
  technologies: ProjectTech[];
  icon: string;
  year?: string;
  githubLink?: string;
  externalLink?: string;
}

const professionalProjectsData: ProfessionalProjectItem[] = [
  {
    id: 1,
    title: "Enterprise Digital Transformation",
    description:
      "Company-wide digital transformation initiative modernizing legacy systems to improve operational efficiency.",
    technologies: [
      { name: "Agile" },
      { name: "PRINCE2" },
      { name: "Jira" },
      { name: "Confluence" },
    ],
    icon: "enterprise",
    year: "2023",
    externalLink: "#",
  },
  {
    id: 2,
    title: "Healthcare System Migration",
    description:
      "Migration of critical healthcare management system serving 18 regional hospitals, ensuring data integrity.",
    technologies: [
      { name: "PRINCE2" },
      { name: "MSP" },
      { name: "MS Project" },
      { name: "HIPAA" },
    ],
    icon: "healthcare",
    year: "2022",
    externalLink: "#",
  },
  {
    id: 3,
    title: "Financial Services Platform",
    description:
      "Development and launch of next-generation financial services platform serving over 500,000 customers.",
    technologies: [
      { name: "Agile" },
      { name: "PMP" },
      { name: "Azure DevOps" },
      { name: "PCI-DSS" },
    ],
    icon: "finance",
    year: "2021",
    externalLink: "#",
  },
  {
    id: 4,
    title: "Retail Analytics Dashboard",
    description:
      "Implementation of real-time analytics dashboard for retail chain with 200+ locations nationwide.",
    technologies: [
      { name: "SAFe" },
      { name: "PMI" },
      { name: "PowerBI" },
      { name: "ITIL" },
    ],
    icon: "analytics",
    year: "2022",
    externalLink: "#",
  },
  {
    id: 5,
    title: "Supply Chain Optimization",
    description:
      "End-to-end supply chain optimization project reducing costs by 22% and improving delivery times by 35%.",
    technologies: [
      { name: "Lean" },
      { name: "Six Sigma" },
      { name: "Kanban" },
      { name: "ERP" },
    ],
    icon: "supply",
    year: "2021",
    externalLink: "#",
  },
  {
    id: 6,
    title: "Corporate Infrastructure Upgrade",
    description:
      "Managed comprehensive IT infrastructure upgrade across 15 offices in 8 countries with zero downtime.",
    technologies: [
      { name: "PRINCE2" },
      { name: "ITIL" },
      { name: "MS Project" },
      { name: "Risk Management" },
    ],
    icon: "infrastructure",
    year: "2020",
    externalLink: "#",
  },
];

export default function ProfessionalProjectsGrid() {
  return (
    <section className="py-20 bg-darkBg text-white" id="professional-projects">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Professional Project Management Portfolio
          </h2>
          <p className="text-gray-400 max-w-3xl mx-auto mb-6">
            A showcase of major projects where I've served as Project or
            Programme Manager, delivering complex initiatives across various
            industries. These projects demonstrate my expertise in leading teams
            and managing resources to achieve strategic business objectives.
          </p>
          <div className="inline-flex items-center text-sm text-accentColor">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            <a href="#" className="hover:underline">
              View full project portfolio
            </a>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {professionalProjectsData.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: project.id * 0.1 }}
              viewport={{ once: true, margin: "-50px" }}
              className="bg-darkBg border border-gray-800 rounded-lg p-6 flex flex-col h-full hover:translate-y-[-10px] transition-transform duration-300"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="text-accentColor">
                  {project.icon === "enterprise" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="2"
                        y="2"
                        width="20"
                        height="8"
                        rx="2"
                        ry="2"
                      ></rect>
                      <rect
                        x="2"
                        y="14"
                        width="20"
                        height="8"
                        rx="2"
                        ry="2"
                      ></rect>
                      <line x1="6" y1="6" x2="6.01" y2="6"></line>
                      <line x1="6" y1="18" x2="6.01" y2="18"></line>
                    </svg>
                  )}
                  {project.icon === "healthcare" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                    </svg>
                  )}
                  {project.icon === "finance" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="1" x2="12" y2="23"></line>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                  )}
                  {project.icon === "analytics" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                      <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
                    </svg>
                  )}
                  {project.icon === "supply" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="1" y="3" width="15" height="13"></rect>
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                      <circle cx="5.5" cy="18.5" r="2.5"></circle>
                      <circle cx="18.5" cy="18.5" r="2.5"></circle>
                    </svg>
                  )}
                  {project.icon === "infrastructure" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="2"
                        y="2"
                        width="20"
                        height="8"
                        rx="2"
                        ry="2"
                      ></rect>
                      <rect
                        x="2"
                        y="14"
                        width="20"
                        height="8"
                        rx="2"
                        ry="2"
                      ></rect>
                      <line x1="6" y1="6" x2="6.01" y2="6"></line>
                      <line x1="6" y1="18" x2="6.01" y2="18"></line>
                    </svg>
                  )}
                </div>
                <div className="flex space-x-4">
                  {project.externalLink && (
                    <a
                      href={project.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-accentColor transition-colors"
                    >
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
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                    </a>
                  )}
                </div>
              </div>

              <div className="mb-auto">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-xl">{project.title}</h3>
                  {project.year && (
                    <span className="text-xs text-gray-500 px-2 py-1 bg-gray-800 rounded-full">
                      {project.year}
                    </span>
                  )}
                </div>
                <p className="text-gray-400 mb-6">{project.description}</p>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {project.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-800 rounded-md text-xs text-gray-300"
                  >
                    {tech.name}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
