import { motion } from "framer-motion";

interface ProjectTech {
  name: string;
}

export interface ProjectGridItem {
  id: number;
  title: string;
  description: string;
  technologies: ProjectTech[];
  icon: string;
  category: "hobby" | "professional";
  year?: string;
  githubLink?: string;
  externalLink?: string;
}

const projectsData: ProjectGridItem[] = [
  // Hobby App Development Projects
  {
    id: 1,
    title: "Budget Tracker",
    description:
      "A personal finance management app with expense categorization and visualization tools.",
    technologies: [
      { name: "React" },
      { name: "TypeScript" },
      { name: "Chart.js" },
      { name: "Firebase" },
    ],
    icon: "app",
    category: "hobby",
    year: "2023",
    githubLink: "#",
    externalLink: "#",
  },
  {
    id: 2,
    title: "Meal Planner",
    description:
      "A weekly meal planning app with nutritional information and grocery list generation.",
    technologies: [
      { name: "Vue.js" },
      { name: "Vuex" },
      { name: "Node.js" },
      { name: "MongoDB" },
    ],
    icon: "app",
    category: "hobby",
    year: "2022",
    githubLink: "#",
  },
  {
    id: 3,
    title: "Habit Tracker",
    description:
      "A minimal habit tracking application with streaks, reminders and progress visualization.",
    technologies: [{ name: "Flutter" }, { name: "Dart" }, { name: "Firebase" }],
    icon: "app",
    category: "hobby",
    year: "2023",
    githubLink: "#",
    externalLink: "#",
  },
  {
    id: 4,
    title: "Language Learning Flashcards",
    description:
      "A spaced-repetition flashcard app for learning foreign languages with pronunciation guides.",
    technologies: [
      { name: "React Native" },
      { name: "Redux" },
      { name: "Express" },
    ],
    icon: "app",
    category: "hobby",
    year: "2022",
    githubLink: "#",
  },
  {
    id: 5,
    title: "Movie Recommendation Engine",
    description:
      "A personalized movie recommendation app using machine learning algorithms based on user preferences.",
    technologies: [
      { name: "Python" },
      { name: "Flask" },
      { name: "TensorFlow" },
      { name: "React" },
    ],
    icon: "app",
    category: "hobby",
    year: "2023",
    githubLink: "#",
  },
  {
    id: 6,
    title: "Home Automation Dashboard",
    description:
      "A central control dashboard for smart home devices with scheduling and automation features.",
    technologies: [
      { name: "React" },
      { name: "Node.js" },
      { name: "WebSockets" },
      { name: "MQTT" },
    ],
    icon: "app",
    category: "hobby",
    year: "2023",
    githubLink: "#",
  },
  {
    id: 7,
    title: "Hiking Trail Explorer",
    description:
      "An interactive map-based application for discovering and tracking hiking trails with elevation data.",
    technologies: [
      { name: "Svelte" },
      { name: "Leaflet.js" },
      { name: "Node.js" },
      { name: "PostgreSQL" },
    ],
    icon: "app",
    category: "hobby",
    year: "2022",
    githubLink: "#",
    externalLink: "#",
  },
  {
    id: 8,
    title: "Minimalist Pomodoro Timer",
    description:
      "A beautifully designed productivity timer using the Pomodoro technique with task tracking and statistics.",
    technologies: [
      { name: "HTML5" },
      { name: "CSS3" },
      { name: "JavaScript" },
      { name: "PWA" },
    ],
    icon: "app",
    category: "hobby",
    year: "2021",
    githubLink: "#",
    externalLink: "#",
  },
];

export default function ProjectsGrid() {
  const hobbyProjects = projectsData.filter(
    (project) => project.category === "hobby",
  );

  return (
    <section className="py-20 bg-darkBg text-white" id="hobby-projects">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Personal App Development Projects
          </h2>
          <p className="text-gray-400 max-w-3xl mx-auto mb-6">
            A collection of mobile and web applications I've built as hobby
            projects to explore new technologies and solve everyday problems.
            These projects showcase my passion for app development beyond my
            professional project management work.
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
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
            <a href="#" className="hover:underline">
              View all projects on GitHub
            </a>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {hobbyProjects.slice(0, 3).map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: project.id * 0.1 }}
              viewport={{ once: true, margin: "-50px" }}
              className="bg-darkBg border border-gray-800 rounded-lg flex flex-col h-full hover:translate-y-[-5px] transition-transform duration-300"
            >
              <div className="flex items-center justify-center py-6 bg-gray-900 rounded-t-lg border-b border-gray-800">
                <div className="text-accentColor">
                  {project.title === "Budget Tracker" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="5"
                        y="2"
                        width="14"
                        height="20"
                        rx="2"
                        ry="2"
                      ></rect>
                      <line x1="12" y1="6" x2="12.01" y2="6"></line>
                      <line x1="12" y1="18" x2="12.01" y2="18"></line>
                      <path d="M15 10h-6a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1z"></path>
                    </svg>
                  )}
                  {project.title === "Meal Planner" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 2h.01M7 2h.01M11 2h.01M15 2h.01M19 2h.01M21 6h.01M21 10h.01M21 14h.01M21 18h.01M21 22h.01M17 22h.01M13 22h.01M9 22h.01M5 22h.01M3 18h.01M3 14h.01M3 10h.01M3 6h.01M10 10h.01M14 10h.01M10 14h.01M14 14h.01"></path>
                      <rect
                        x="8"
                        y="8"
                        width="8"
                        height="8"
                        rx="1"
                        ry="1"
                      ></rect>
                    </svg>
                  )}
                  {project.title === "Habit Tracker" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 3v18h18"></path>
                      <path d="M18.4 9l-1.2 1.5"></path>
                      <path d="M13.5 13l-3-4.5-7 9"></path>
                      <path d="M8 3H6.5a2.5 2.5 0 0 0 0 5H8"></path>
                      <path d="M11 3h1.5a2.5 2.5 0 0 1 0 5H11"></path>
                      <path d="M8 8h3"></path>
                    </svg>
                  )}
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-xl text-white">
                    {project.title}
                  </h3>
                  {project.year && (
                    <span className="text-xs text-gray-400 px-2 py-1 bg-gray-800 rounded-full">
                      {project.year}
                    </span>
                  )}
                </div>
                <p className="text-gray-400 mb-6 text-sm">
                  {project.description}
                </p>

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

                <div className="flex mt-6 space-x-4">
                  {project.githubLink && (
                    <a
                      href={project.githubLink}
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
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                      </svg>
                    </a>
                  )}
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
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <motion.button
            className="px-8 py-3 border border-accentColor text-accentColor rounded hover:bg-accentColor/10 transition-colors duration-300"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            Show More Projects
          </motion.button>
        </div>
      </div>
    </section>
  );
}
