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
  githubLink?: string;
  externalLink?: string;
}

const projectsData: ProjectGridItem[] = [
  {
    id: 1,
    title: "Bracha-Law firm",
    description: "Deliver a landing page for Law office.",
    technologies: [
      { name: "PHP" },
      { name: "WordPress" },
      { name: "CSS" },
      { name: "JS" }
    ],
    icon: "folder",
    externalLink: "#"
  },
  {
    id: 2,
    title: "OTD-Production",
    description: "Build a landing page for known Event-Production company",
    technologies: [
      { name: "PHP" },
      { name: "WordPress" },
      { name: "CSS" },
      { name: "JS" }
    ],
    icon: "folder",
    externalLink: "#"
  },
  {
    id: 3,
    title: "Chatbot",
    description: "Build a chatbot that can provide weather information based on location.",
    technologies: [
      { name: "Flask" },
      { name: "Python" }
    ],
    icon: "folder",
    githubLink: "#"
  },
  {
    id: 4,
    title: "HogwartsCRM",
    description: "Create a Hogwarts table in CRM as part of my studies in ITC.",
    technologies: [
      { name: "Flask" },
      { name: "Python" },
      { name: "React.js" }
    ],
    icon: "folder",
    githubLink: "#"
  },
  {
    id: 5,
    title: "Minecraft",
    description: "Create a Minecraft game as part of my studies in ITC.",
    technologies: [
      { name: "JS" },
      { name: "CSS" },
      { name: "HTML5" }
    ],
    icon: "folder",
    githubLink: "#"
  },
  {
    id: 6,
    title: "Mytwitter",
    description: "Create a Twitter platform as part of my studies in ITC course. Integrated user and server-side using React.js and Firebase.",
    technologies: [
      { name: "React.js" },
      { name: "Firebase" }
    ],
    icon: "folder",
    githubLink: "#"
  }
];

export default function ProjectsGrid() {
  return (
    <section className="py-20 bg-darkBg text-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Other Noteworthy Projects</h2>
          <a href="#" className="text-sm text-accentColor hover:underline">view the archive</a>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectsData.map((project) => (
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
                  {project.icon === "folder" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                  )}
                </div>
                <div className="flex space-x-4">
                  {project.githubLink && (
                    <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-accentColor transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                      </svg>
                    </a>
                  )}
                  {project.externalLink && (
                    <a href={project.externalLink} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-accentColor transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                    </a>
                  )}
                </div>
              </div>

              <h3 className="font-bold text-xl mb-2">{project.title}</h3>
              <p className="text-gray-400 mb-6 flex-grow">{project.description}</p>

              <div className="flex flex-wrap gap-3 mt-auto text-sm text-gray-400">
                {project.technologies.map((tech, index) => (
                  <span key={index}>{tech.name}</span>
                ))}
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
            Show More
          </motion.button>
        </div>
      </div>
    </section>
  );
}