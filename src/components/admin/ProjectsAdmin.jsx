import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const ProjectsAdmin = ({ content, setContent }) => {
  const navigate = useNavigate();

  const handleChange = (projectType, index, field, value) => {
    setContent(prev => ({
      ...prev,
      projects: {
        ...prev.projects,
        [projectType]: prev.projects[projectType].map((project, i) =>
          i === index ? { ...project, [field]: value } : project
        )
      }
    }));
  };

  const handleAddProject = (projectType) => {
    const newProject = {
      title: `New ${projectType === 'developmentProjects' ? 'Personal' : 'PM'} Project`,
      description: projectType === 'developmentProjects' 
        ? 'Add your personal project description here'
        : 'Add your PM project description here',
      technologies: [],
      github: '#',
      live: '#'
    };

    setContent(prev => ({
      ...prev,
      projects: {
        ...prev.projects,
        [projectType]: [...prev.projects[projectType], newProject]
      }
    }));
  };

  const handleDeleteProject = (projectType, index) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    setContent(prev => ({
      ...prev,
      projects: {
        ...prev.projects,
        [projectType]: prev.projects[projectType].filter((_, i) => i !== index)
      }
    }));
  };

  const handleDragEnd = (result, projectType) => {
    if (!result.destination) return;

    const projects = Array.from(content.projects[projectType]);
    const [reorderedItem] = projects.splice(result.source.index, 1);
    projects.splice(result.destination.index, 0, reorderedItem);

    setContent(prev => ({
      ...prev,
      projects: {
        ...prev.projects,
        [projectType]: projects
      }
    }));
  };

  const renderProjectList = (projectType, title) => (
    <div className="project-section">
      <h3>{title}</h3>
      <button 
        className="add-button" 
        onClick={() => handleAddProject(projectType)}
        title={`Add new ${projectType === 'developmentProjects' ? 'development' : 'general'} project`}
      >
        Add New {projectType === 'developmentProjects' ? 'Personal' : 'PM'} Project
      </button>

      <DragDropContext onDragEnd={(result) => handleDragEnd(result, projectType)}>
        <Droppable droppableId={projectType}>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {content.projects[projectType].map((project, index) => (
                <Draggable
                  key={index}
                  draggableId={`${projectType}-${index}`}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="item-card"
                    >
                      <div className="card-header">
                        <span className="drag-handle">☰</span>
                        <span className="item-number">#{index + 1}</span>
                      </div>
                      <div className="form-group">
                        <label>Title:</label>
                        <input
                          type="text"
                          value={project.title}
                          onChange={(e) => handleChange(projectType, index, 'title', e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Description:</label>
                        <textarea
                          value={project.description}
                          onChange={(e) => handleChange(projectType, index, 'description', e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Technologies (comma-separated):</label>
                        <input
                          type="text"
                          value={project.technologies.join(', ')}
                          onChange={(e) => handleChange(
                            projectType,
                            index,
                            'technologies',
                            e.target.value.split(',').map(tech => tech.trim())
                          )}
                        />
                      </div>

                      <div className="form-group">
                        <label>GitHub URL:</label>
                        <input
                          type="text"
                          value={project.github}
                          onChange={(e) => handleChange(projectType, index, 'github', e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Live URL:</label>
                        <input
                          type="text"
                          value={project.live}
                          onChange={(e) => handleChange(projectType, index, 'live', e.target.value)}
                        />
                      </div>

                      <button
                        className="delete-button"
                        onClick={() => handleDeleteProject(projectType, index)}
                      >
                        Delete Project
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Projects Section</h2>
        <button onClick={() => navigate('/admin')} className="back-button">
          Back to Dashboard
        </button>
      </div>

      <div className="form-group">
        <label>Development Projects Description:</label>
        <textarea
          value={content.projects.developmentDescription}
          onChange={(e) => setContent(prev => ({
            ...prev,
            projects: {
              ...prev.projects,
              developmentDescription: e.target.value
            }
          }))}
        />
      </div>

      <div className="form-group">
        <label>General Projects Description:</label>
        <textarea
          value={content.projects.generalDescription}
          onChange={(e) => setContent(prev => ({
            ...prev,
            projects: {
              ...prev.projects,
              generalDescription: e.target.value
            }
          }))}
        />
      </div>

      {renderProjectList('generalProjects', 'PM Projects')}
      {renderProjectList('developmentProjects', 'Personal Projects')}
    </div>
  );
};

export default ProjectsAdmin;