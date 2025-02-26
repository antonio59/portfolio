import React, { useState } from 'react';
import { FaFolder, FaExternalLinkAlt, FaCode, FaProjectDiagram, FaUserCircle, FaChartLine, FaPlane, FaPoll, FaBook, FaUsers, FaClipboardList } from 'react-icons/fa';
import './Projects.css';

const developmentProjects = [
  {
    title: "DLR Digital Tap Prototype",
    description: "A digital tap in / tap out for use on the DLR train line.",
    technologies: ["React", "Node.js", "API Integration"],
    icon: <FaCode />,
    live: "https://dlrdigitaltap.v0.build/",
    demo: "/media/dlr-demo.html"
  },
  {
    title: "Personal Portfolio Website",
    description: "A fully responsive personal portfolio site with modern design and seamless user experience",
    technologies: ["React", "CSS", "Responsive Design"],
    icon: <FaProjectDiagram />,
    github: "#",
    live: "#"
  },
  {
    title: "Task Management Web App",
    description: "A feature-rich task management application with drag-and-drop functionality and team collaboration tools.",
    technologies: ["React", "Node.js", "MongoDB"],
    icon: <FaClipboardList />,
    github: "#",
    live: "#"
  }
];

const projectData = [
  {
    title: "Workday Implementation",
    description: "Implemented Workday platform for human capital management, finance, and core processes, streamlining operations across the organization.",
    technologies: ["Workday", "HCM", "Finance"],
    icon: <FaUserCircle />,
  },
  {
    title: "Cornerstone Implementation",
    description: "Led deployment of Cornerstone, a cloud-based learning and talent management platform, focusing on learning management, performance reviews, and recruitment.",
    technologies: ["Cornerstone", "LMS", "Talent Management"],
    icon: <FaUsers />,
  },
  {
    title: "CRM Implementation",
    description: "Integrated a Customer Relationship Management system, streamlining sales, marketing, and customer service operations.",
    technologies: ["CRM", "Sales", "Marketing"],
    icon: <FaChartLine />,
  },
  {
    title: "Audio2Face (Phase 1 and 2)",
    description: "Phase 1: Initial rollout of AI-driven tool for animating facial movements from voice data. Phase 2: Enhancements including batch processing, multiple characters and shots, viewable generation, and code reuse.",
    technologies: ["AI", "Animation", "Voice Processing"],
    icon: <FaCode />,
  },
  {
    title: "Travel Management System",
    description: "Implemented a system for organizing and tracking business-related travel, improving efficiency and cost management.",
    technologies: ["Travel Management", "Cost Optimization"],
    icon: <FaPlane />,
  },
  {
    title: "Survey Tool",
    description: "Deployed a survey tool for collecting feedback and data from users, enhancing decision-making and customer satisfaction.",
    technologies: ["Survey", "Data Collection", "Analytics"],
    icon: <FaPoll />,
  },
  {
    title: "Confluence Upgrade",
    description: "Led an upgrade of the Confluence collaboration tool, improving internal documentation and knowledge sharing capabilities.",
    technologies: ["Confluence", "Documentation", "Collaboration"],
    icon: <FaBook />,
  },
  {
    title: "Recruitment Features & Upgrades",
    description: "Added new features to the recruitment platform, streamlining the hiring process and upgrading the system for better functionality.",
    technologies: ["Recruitment", "HR Tech", "System Upgrade"],
    icon: <FaUserCircle />,
  },
  {
    title: "Talent Management",
    description: "Involved in talent management initiatives, integrating systems for performance reviews, employee development, and succession planning.",
    technologies: ["Talent Management", "Performance Reviews", "Succession Planning"],
    icon: <FaUsers />,
  },
  {
    title: "Jira Triage Improvements",
    description: "Enhanced the Jira ticket triage process, improving workflow efficiency, prioritization, and task management for the team.",
    technologies: ["Jira", "Workflow Optimization", "Task Management"],
    icon: <FaClipboardList />,
  },
];

const Projects = () => {
  const [activeTab, setActiveTab] = useState('development');
  const [showAll, setShowAll] = useState(false);

  const currentProjects = activeTab === 'development' ? developmentProjects : projectData;
  const displayedProjects = showAll ? currentProjects : currentProjects.slice(0, 6);

  return (
    <section id="projects">
      <div className="container">
        <h2>Projects</h2>
        <p className="section-description">
          A showcase of my key projects, demonstrating my ability to deliver impactful solutions across various domains.
        </p>
        <div className="project-tabs">
          <button 
            className={`tab-button ${activeTab === 'development' ? 'active' : ''}`}
            onClick={() => setActiveTab('development')}
          >
            Development Projects
          </button>
          <button 
            className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            General Projects
          </button>
        </div>
        <div className="project-grid">
          {displayedProjects.map((project, index) => (
            <div key={index} className="project-card">
              <div className="project-header">
                {project.icon}
                <div className="project-links">
                  {project.github && <a href={project.github} target="_blank" rel="noopener noreferrer"><FaCode /></a>}
                  {project.live && <a href={project.live} target="_blank" rel="noopener noreferrer"><FaExternalLinkAlt /></a>}
                </div>
              </div>
              <h3>{project.title}</h3>
              {project.demo ? (
                <div className="project-demo">
                  <iframe src={project.demo} frameBorder="0" title={project.title} />
                </div>
              ) : null}
              <p>{project.description}</p>
              <div className="project-tags">
                {project.technologies.map((tech, techIndex) => (
                  <span key={techIndex}>{tech}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        {currentProjects.length > 6 && (
          <div className="show-more-container">
            <button className="btn-show-more" onClick={() => setShowAll(!showAll)}>
              {showAll ? 'Show Less' : 'Show More'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Projects;