import { motion } from "framer-motion";
import { experiences, education } from "../utils/ProjectData";

export default function Experience() {
  const containerAnimation = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const itemAnimation = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7 } }
  };

  const TimelineItem = ({ 
    title, 
    subtitle, 
    period, 
    description,
    delay = 0
  }: {
    title: string;
    subtitle: string;
    period: string;
    description: string;
    delay?: number;
  }) => {
    return (
      <motion.div 
        className="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-accent/30"
        variants={itemAnimation}
        custom={delay}
      >
        <div className="absolute left-0 top-0 w-[5px] h-[5px] rounded-full bg-accent -translate-x-[2px]"></div>
        <span className="inline-block text-sm font-medium bg-secondary px-3 py-1 rounded mb-2">{period}</span>
        <h4 className="text-xl font-semibold mb-1">{title}</h4>
        <p className="text-accent mb-1">{subtitle}</p>
        <p className="text-textColor/70">{description}</p>
      </motion.div>
    );
  };

  return (
    <section className="py-24 bg-primary">
      <div className="container mx-auto px-6">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          Experience & Education
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          <div>
            <motion.h3 
              className="text-2xl font-semibold mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              Work Experience
            </motion.h3>
            
            <motion.div 
              className="space-y-12"
              variants={containerAnimation}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
            >
              {experiences.map((exp) => (
                <TimelineItem
                  key={exp.id}
                  title={exp.role}
                  subtitle={exp.company}
                  period={exp.period}
                  description={exp.description}
                  delay={exp.id * 0.1}
                />
              ))}
            </motion.div>
          </div>
          
          <div>
            <motion.h3 
              className="text-2xl font-semibold mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              Education & Certifications
            </motion.h3>
            
            <motion.div 
              className="space-y-12"
              variants={containerAnimation}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
            >
              {education.map((edu) => (
                <TimelineItem
                  key={edu.id}
                  title={edu.degree}
                  subtitle={edu.institution}
                  period={edu.period}
                  description={edu.description}
                  delay={edu.id * 0.1}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
