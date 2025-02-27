import React, { useState } from 'react';
import { FaFolder, FaExternalLinkAlt, FaCode, FaProjectDiagram, FaUserCircle, FaChartLine, FaPlane, FaPoll, FaBook, FaUsers, FaClipboardList } from 'react-icons/fa';
import './Projects.css';
import content from '../data/content.json';

const getProjectIcon = (title) => {
  const iconMap = {
    'code': <FaCode />,
    'project': <FaProjectDiagram />,
    'user': <FaUserCircle />,
    'users': <FaUsers />,
    'chart': <FaChartLine />,
    'plane': <FaPlane />,
    'poll': <FaPoll />,
    'book': <FaBook />,
    'list': <FaClipboardList />
  };

  const lowercaseTitle = title.toLowerCase();
  if (lowercaseTitle.includes('development') || lowercaseTitle.includes('code')) return iconMap.code;
  if (lowercaseTitle.includes('user') || lowercaseTitle.includes('hr')) return iconMap.user;
  if (lowercaseTitle.includes('team') || lowercaseTitle.includes('management')) return iconMap.users;
  if (lowercaseTitle.includes('analytics') || lowercaseTitle.includes('data')) return iconMap.chart;
  if (lowercaseTitle.includes('travel')) return iconMap.plane;
  if (lowercaseTitle.includes('survey')) return iconMap.poll;
  if (lowercaseTitle.includes('documentation')) return iconMap.book;
  if (lowercaseTitle.includes('task') || lowercaseTitle.includes('list')) return iconMap.list;
  return iconMap.project;
};

const developmentProjects = content.projects.developmentProjects.map(project => ({
  ...project,
  icon: getProjectIcon(project.title)
})) || [];

const projectData = content.projects.generalProjects.map(project => ({
  ...project,
  icon: getProjectIcon(project.title)
})) || [];

const Projects = () => {
  const [activeTab, setActiveTab] = useState('development');
  const [showAll, setShowAll] = useState(false);

  const currentProjects = activeTab === 'development' ? developmentProjects : projectData;
  const displayedProjects = showAll ? currentProjects : currentProjects.slice(0, 6);

  return (
    <section id="projects" className="projects-section">
      <h2>Projects</h2>
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'development' ? 'active' : ''}`}
          onClick={() => setActiveTab('development')}
        >
          Development Projects
        </button>
        <button
          className={`tab ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          General Projects
        </button>
      </div>
      
      <div className="tab-description">
        {activeTab === 'development' ? (
          <p>{content.projects.developmentDescription}</p>
        ) : (
          <p>{content.projects.generalDescription}</p>
        )}
      </div>

      <div className="projects-container">
        <div className="projects-grid">
        {displayedProjects.map((project, index) => (
          <div key={index} className="project-card">
            <div className="project-icon">{project.icon}</div>
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <div className="technologies">
              {project.technologies.map((tech, techIndex) => (
                <span key={techIndex} className="tech-tag">
                  {tech}
                </span>
              ))}
            </div>
            <div className="project-links">
              {project.github && (
                <a href={project.github} target="_blank" rel="noopener noreferrer">
                  <FaCode /> Code
                </a>
              )}
              {project.live && (
                <a href={project.live} target="_blank" rel="noopener noreferrer">
                  <FaExternalLinkAlt /> Live
                </a>
              )}
              {project.demo && (
                <a href={project.demo} target="_blank" rel="noopener noreferrer">
                  <FaExternalLinkAlt /> Demo
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      </div>
      {currentProjects.length > 6 && (
        <button className="show-more" onClick={() => setShowAll(!showAll)}>
          {showAll ? 'Show Less' : 'Show More'}
        </button>
      )}
    </section>
  );
};

export default Projects;