import { useState } from "react";
import { motion } from "framer-motion";

interface ProjectItem {
  id: number;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  link: string;
}

const projectsData: ProjectItem[] = [
  {
    id: 1,
    title: "Minimal Portfolio Website",
    description: "A modern, minimal portfolio website with a clean design, optimized for showcasing creative work with attention to typography and spacing.",
    image: "https://images.unsplash.com/photo-1621631854823-aca2469b8737?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    technologies: ["React", "TypeScript", "Framer Motion", "Tailwind CSS"],
    link: "#"
  },
  {
    id: 2,
    title: "E-commerce Dashboard",
    description: "An intuitive dashboard for e-commerce businesses to track sales, inventory, customer data and marketing performance in real-time.",
    image: "https://images.unsplash.com/photo-1487014679447-9f8336841d58?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    technologies: ["Next.js", "Prisma", "PostgreSQL", "Recharts"],
    link: "#"
  },
  {
    id: 3,
    title: "Task Management App",
    description: "A collaborative task management application for teams that includes features like drag-and-drop task organization, assignments, and progress tracking.",
    image: "https://images.unsplash.com/photo-1565106430482-8f6e74349ca1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    technologies: ["React", "Redux", "Express", "MongoDB"],
    link: "#"
  }
];

export default function ProjectShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  
  return (
    <section className="py-20 bg-primaryBg">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto mb-16 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-textColor">Featured Projects</h2>
          <p className="text-lg text-gray-600">A selection of my recent work, showcasing my skills in design and development.</p>
        </motion.div>
        
        <div className="space-y-32">
          {projectsData.map((project, index) => (
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
                <span className="text-sm font-medium text-accentColor">Featured Project</span>
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
    </section>
  );
}