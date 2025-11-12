import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Award, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { getAboutSections, type AboutSection } from "../lib/pocketbase";
import { pb } from "@/lib/pocketbase";

export default function About() {
  const { data: aboutSections = [] } = useQuery<AboutSection[]>({
    queryKey: ["about-sections"],
    queryFn: getAboutSections,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch certifications count
  const { data: certifications = [] } = useQuery({
    queryKey: ["certifications-count"],
    queryFn: async () => {
      const records = await pb.collection("certifications").getFullList({
        fields: "id,title,issuer",
      });
      return records;
    },
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

        {/* Certifications & Interests Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Certifications Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="bg-card rounded-2xl p-8 shadow-lg border border-border group hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-card-foreground">
                Certifications
              </h3>
            </div>
            
            {certifications.length > 0 ? (
              <>
                <div className="space-y-3 mb-6">
                  {certifications.slice(0, 3).map((cert: any) => (
                    <div key={cert.id} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <p className="font-medium text-sm leading-snug">{cert.title}</p>
                    </div>
                  ))}
                  {certifications.length > 3 && (
                    <p className="text-sm text-muted-foreground">
                      +{certifications.length - 3} more certifications
                    </p>
                  )}
                </div>
                
                <Button variant="outline" className="w-full group-hover:border-primary group-hover:text-primary transition-colors" asChild>
                  <Link href="/credentials" className="flex items-center justify-center gap-2">
                    View All Credentials
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">No certifications available yet.</p>
            )}
          </motion.div>

          {/* Interests Section (if available) */}
          {interestsSection && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
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
      </div>
    </section>
  );
}
