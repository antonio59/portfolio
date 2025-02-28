import { useState } from "react";
import { motion } from "framer-motion";

interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  description: string[];
  achievements: string[];
  methodologies: string[];
}

export default function Experience() {
  const experienceData: ExperienceItem[] = [
    {
      company: "Global Financial Services",
      role: "Senior Programme Manager",
      period: "2020 - Present",
      description: [
        "Leading a comprehensive digital transformation programme across multiple business units valued at $15M.",
        "Managing a portfolio of 8 concurrent projects with cross-functional teams totaling 45+ members.",
        "Establishing enterprise-wide governance frameworks and reporting structures.",
        "Coordinating with C-level executives to align programme objectives with strategic business goals."
      ],
      achievements: [
        "Delivered annual cost savings of $3.2M through process optimization and system consolidation.",
        "Improved operational efficiency by 35% through implementation of automated workflows.",
        "Reduced time-to-market for new features by 45% through agile delivery methods.",
        "Successfully navigated regulatory changes with zero compliance incidents."
      ],
      methodologies: ["MSP", "PRINCE2", "Agile", "SAFe", "Portfolio Management", "Risk Management"]
    },
    {
      company: "Healthcare Technologies Inc.",
      role: "Project Manager",
      period: "2017 - 2020",
      description: [
        "Managed the implementation of electronic health record systems across a network of 18 regional hospitals.",
        "Led cross-functional teams of 25+ members including developers, clinical staff, and IT specialists.",
        "Developed comprehensive project plans, timelines, and resource allocation strategies.",
        "Facilitated stakeholder engagement sessions to ensure alignment with user requirements."
      ],
      achievements: [
        "Completed all implementations on schedule and 8% under budget.",
        "Achieved 99.9% data migration accuracy during system transitions.",
        "Reduced patient wait times by 27% through optimized clinical workflows.",
        "Designed and delivered training program reaching 2,000+ healthcare professionals."
      ],
      methodologies: ["PRINCE2", "Waterfall", "Hybrid", "Clinical Workflow Analysis", "HIPAA Compliance"]
    },
    {
      company: "Tech Innovations Group",
      role: "Project Coordinator",
      period: "2014 - 2017",
      description: [
        "Coordinated multiple technology implementation projects for enterprise clients across finance and retail sectors.",
        "Managed project schedules, resource allocation, and budget tracking for initiatives ranging from $500K to $2M.",
        "Facilitated communication between technical teams, stakeholders, and third-party vendors.",
        "Developed and maintained comprehensive project documentation and status reports."
      ],
      achievements: [
        "Successfully delivered 12 projects with 100% client satisfaction ratings.",
        "Improved project documentation processes, reducing reporting time by 35%.",
        "Implemented risk management framework that preemptively addressed 28 potential issues.",
        "Recognized with 'Excellence in Project Coordination' company award in 2016."
      ],
      methodologies: ["Agile", "Scrum", "Kanban", "Stakeholder Management", "Risk Assessment"]
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
            
            <div className="mb-6">
              <h4 className="text-md font-semibold text-textColor mb-3">Responsibilities:</h4>
              <ul className="space-y-3">
                {experienceData[activeTab].description.map((item, index) => (
                  <li key={index} className="flex items-start text-gray-600">
                    <span className="text-accentColor mr-2 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mb-6">
              <h4 className="text-md font-semibold text-textColor mb-3">Key Achievements:</h4>
              <ul className="space-y-3">
                {experienceData[activeTab].achievements.map((item, index) => (
                  <li key={index} className="flex items-start text-gray-600">
                    <span className="text-highlightColor mr-2 mt-1">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-md font-semibold text-textColor mb-3">Methodologies & Skills:</h4>
              <div className="flex flex-wrap gap-2">
                {experienceData[activeTab].methodologies.map((method, index) => (
                  <span key={index} className="px-3 py-1 bg-white rounded-full text-xs text-gray-700 shadow-sm border border-accentColor/20">
                    {method}
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