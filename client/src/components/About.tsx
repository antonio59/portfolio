import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { getAboutSections, type AboutSection } from "../lib/pocketbase";

export default function About() {
  const { data: aboutSections = [] } = useQuery<AboutSection[]>({
    queryKey: ["about-sections"],
    queryFn: getAboutSections,
    staleTime: 5 * 60 * 1000,
  });

  // Get specific sections
  const backgroundSection = aboutSections.find(s => s.section_type === 'background');
  const drivesSection = aboutSections.find(s => s.section_type === 'what_drives_me');
  const interestsSection = aboutSections.find(s => s.section_type === 'interests');
  // Professional Skills
  const professionalSkills = [
    "Project Management",
    "Programme Management",
    "Agile",
    "Scrum",
    "PRINCE2",
    "PMP",
    "Risk Management",
    "Stakeholder Management",
    "Budget Planning",
    "Resource Allocation",
    "Strategic Planning",
    "Change Management",
  ];

  // Technical Skills
  const technicalSkills = [
    "JavaScript",
    "TypeScript",
    "React",
    "React Native",
    "Node.js",
    "Python",
    "Flutter",
    "MongoDB",
    "SQL",
    "Firebase",
    "Git",
    "CI/CD",
  ];



  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <section id="about" className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            About Me
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto rounded-full"></div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Background Section - Takes 2 columns on large screens */}
          {backgroundSection && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="lg:col-span-2 bg-card rounded-2xl p-8 shadow-lg border border-border"
            >
              <h3 className="text-2xl font-bold mb-4 text-card-foreground flex items-center gap-2">
                <span className="text-primary">●</span>
                {backgroundSection.title}
              </h3>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                {backgroundSection.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </motion.div>
          )}

          {/* What Drives Me - Takes 1 column */}
          {drivesSection && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-card rounded-2xl p-8 shadow-lg border border-border"
            >
              <h3 className="text-2xl font-bold mb-4 text-card-foreground flex items-center gap-2">
                <span className="text-primary">●</span>
                {drivesSection.title}
              </h3>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                {drivesSection.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Skills Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Professional Skills */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-card rounded-2xl p-8 shadow-lg border border-border"
          >
            <h3 className="text-2xl font-bold mb-6 text-card-foreground flex items-center gap-2">
              <span className="text-primary">●</span>
              Professional Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {professionalSkills.map((skill, index) => (
                <motion.span
                  key={index}
                  variants={itemVariants}
                  className="px-4 py-2 rounded-lg bg-primary/10 text-primary font-medium text-sm hover:bg-primary/20 transition-colors"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Technical Skills */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-card rounded-2xl p-8 shadow-lg border border-border"
          >
            <h3 className="text-2xl font-bold mb-6 text-card-foreground flex items-center gap-2">
              <span className="text-primary">●</span>
              Technical Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {technicalSkills.map((skill, index) => (
                <motion.span
                  key={index}
                  variants={itemVariants}
                  className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm hover:bg-secondary/80 transition-colors"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Interests Section (if available) */}
        {interestsSection && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="bg-card rounded-2xl p-8 shadow-lg border border-border"
          >
            <h3 className="text-2xl font-bold mb-4 text-card-foreground flex items-center gap-2">
              <span className="text-primary">●</span>
              {interestsSection.title}
            </h3>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              {interestsSection.content.split('\n\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
