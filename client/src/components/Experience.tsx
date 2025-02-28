import { useState } from "react";
import { motion } from "framer-motion";

interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  description: string[];
  technologies: string[];
}

export default function Experience() {
  const experienceData: ExperienceItem[] = [
    {
      company: "TechCorp Inc.",
      role: "Senior Frontend Developer",
      period: "2021 - Present",
      description: [
        "Led a team of 5 developers in building a new e-commerce platform using React and TypeScript, resulting in a 30% increase in conversion rates.",
        "Implemented performance optimizations that reduced load times by 45% and improved Core Web Vitals scores.",
        "Established coding standards and conducted code reviews to ensure high-quality, maintainable code.",
        "Collaborated with design and product teams to create intuitive user interfaces and seamless experiences."
      ],
      technologies: ["React", "TypeScript", "Next.js", "GraphQL", "Tailwind CSS"]
    },
    {
      company: "WebSolutions Ltd.",
      role: "Frontend Developer",
      period: "2019 - 2021",
      description: [
        "Developed responsive web applications for clients across various industries using React and Vue.js.",
        "Built reusable component libraries that reduced development time by 25%.",
        "Integrated third-party APIs and services to enhance application functionality.",
        "Collaborated with backend developers to design and implement RESTful APIs."
      ],
      technologies: ["React", "Vue.js", "JavaScript", "SCSS", "REST APIs"]
    },
    {
      company: "Digital Agency XYZ",
      role: "Web Developer",
      period: "2017 - 2019",
      description: [
        "Created custom WordPress themes and plugins for small to medium-sized businesses.",
        "Designed and implemented responsive layouts that improved mobile user experience.",
        "Optimized website performance and SEO, resulting in higher search rankings.",
        "Provided technical support and maintenance for existing client websites."
      ],
      technologies: ["HTML5", "CSS3", "JavaScript", "WordPress", "PHP"]
    }
  ];
  
  const [activeTab, setActiveTab] = useState(0);
  
  return (
    <section id="experience" className="py-20 bg-secondaryBg">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-textColor">Work Experience</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">My professional journey has taken me through various roles where I've honed my skills and made meaningful contributions.</p>
        </motion.div>
        
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row border-b border-gray-300">
            {experienceData.map((experience, index) => (
              <button
                key={index}
                className={`px-6 py-3 text-left ${
                  activeTab === index 
                    ? "border-b-2 border-accentColor text-accentColor" 
                    : "text-gray-600 hover:text-gray-800"
                } transition-colors duration-300`}
                onClick={() => setActiveTab(index)}
              >
                {experience.company}
              </button>
            ))}
          </div>
          
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="py-8"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-textColor">{experienceData[activeTab].role}</h3>
                <p className="text-accentColor">{experienceData[activeTab].company}</p>
              </div>
              <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 shadow-sm">
                {experienceData[activeTab].period}
              </span>
            </div>
            
            <ul className="space-y-4 mb-6">
              {experienceData[activeTab].description.map((item, index) => (
                <li key={index} className="flex items-start text-gray-600">
                  <span className="text-accentColor mr-2 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">TECHNOLOGIES USED:</h4>
              <div className="flex flex-wrap gap-2">
                {experienceData[activeTab].technologies.map((tech, index) => (
                  <span key={index} className="px-3 py-1 bg-white rounded-full text-xs text-gray-700 shadow-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}