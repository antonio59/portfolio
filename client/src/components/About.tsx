import { motion } from "framer-motion";

export default function About() {
  // Professional Skills
  const professionalSkills = [
    "Project Management", "Programme Management", "Agile", "Scrum", 
    "PRINCE2", "PMP", "Risk Management", "Stakeholder Management", 
    "Budget Planning", "Resource Allocation", "Strategic Planning", "Change Management"
  ];
  
  // Technical Skills
  const technicalSkills = [
    "JavaScript", "TypeScript", "React", "React Native", 
    "Node.js", "Python", "Flutter", "MongoDB", 
    "SQL", "Firebase", "Git", "CI/CD"
  ];
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };
  
  return (
    <section id="about" className="py-20 bg-primaryBg">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Image Section */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="w-full h-[450px] bg-secondaryBg rounded-lg overflow-hidden shadow-lg relative z-10">
              <img 
                src="https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=755&q=80" 
                alt="John Smith working on a laptop"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-[80%] h-[80%] border-2 border-accentColor rounded-lg z-0"></div>
          </motion.div>
          
          {/* Text Content */}
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-textColor">About Me</h2>
              <p className="text-gray-600 mb-6">
                I'm an experienced Project and Programme Manager with over 10 years of professional experience in the technology sector. My expertise lies in leading complex digital transformation initiatives, healthcare system implementations, and financial technology projects from inception to successful delivery.
              </p>
              <p className="text-gray-600 mb-6">
                While my primary profession is project management, I'm also passionate about software development. As a hobby, I build mobile and web applications to solve everyday problems and explore new technologies, combining my project management expertise with hands-on technical skills to create efficient and user-friendly solutions.
              </p>
            </motion.div>
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mt-8"
            >
              <h3 className="text-xl font-semibold mb-4 text-textColor">Professional Skills</h3>
              <div className="flex flex-wrap gap-3 mb-6">
                {professionalSkills.map((skill, index) => (
                  <motion.span 
                    key={index}
                    variants={itemVariants}
                    className="px-4 py-2 rounded-full bg-white shadow-sm border border-gray-200 text-gray-700 text-sm"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
              
              <h3 className="text-xl font-semibold mb-4 text-textColor mt-8">Technical Skills (Hobby Development)</h3>
              <div className="flex flex-wrap gap-3">
                {technicalSkills.map((skill, index) => (
                  <motion.span 
                    key={index}
                    variants={itemVariants}
                    className="px-4 py-2 rounded-full bg-white shadow-sm border border-accentColor/20 text-gray-700 text-sm"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}