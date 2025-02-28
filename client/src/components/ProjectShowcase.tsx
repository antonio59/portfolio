import { motion } from "framer-motion";
import { useRef } from "react";
import { projects } from "../utils/ProjectData";

export default function ProjectShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const ProjectCard = ({ 
    id, 
    title, 
    description, 
    category, 
    imageUrl,
    link 
  }: {
    id: number;
    title: string;
    description: string;
    category: string;
    imageUrl: string;
    link: string;
  }) => {
    return (
      <motion.div 
        className="project-card group mb-12 md:mb-24"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: id * 0.1 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <a href={link} className="block relative overflow-hidden rounded-lg mb-6 group">
          <div className="aspect-w-16 aspect-h-9 bg-secondary rounded-lg overflow-hidden">
            <img 
              src={imageUrl} 
              alt={title}
              className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-accent text-white rounded-full mb-2">{category}</span>
            <h3 className="text-xl md:text-2xl font-semibold text-white">{title}</h3>
          </div>
        </a>
        <div className="transition-all duration-300 transform group-hover:translate-x-2">
          <h3 className="text-xl md:text-2xl font-semibold mb-2">{title}</h3>
          <p className="text-textColor/70 mb-4">{description}</p>
          <a href={link} className="inline-flex items-center text-accent hover:text-highlight transition-colors">
            View Case Study
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </motion.div>
    );
  };

  return (
    <section id="work" className="py-24 bg-primary">
      <div className="container mx-auto px-6" ref={containerRef}>
        <motion.h2 
          className="text-3xl md:text-4xl font-bold mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          Selected Work
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
          {projects.map((project) => (
            <ProjectCard 
              key={project.id}
              id={project.id}
              title={project.title}
              description={project.description}
              category={project.category}
              imageUrl={project.imageUrl}
              link={project.link}
            />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <motion.a 
            href="#"
            className="inline-flex items-center justify-center px-8 py-3 border border-textColor rounded hover:bg-secondary transition-colors duration-300"
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            View All Projects
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </motion.a>
        </div>
      </div>
    </section>
  );
}
