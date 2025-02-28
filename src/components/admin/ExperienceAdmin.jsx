import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const ExperienceAdmin = ({ content, setContent }) => {
  const navigate = useNavigate();

  const handleChange = (index, field, value) => {
    setContent(prev => ({
      ...prev,
      experience: {
        ...prev.experience,
        jobs: prev.experience.jobs.map((job, i) => 
          i === index ? { ...job, [field]: value } : job
        )
      }
    }));
  };

  const handleAddJob = () => {
    const newJob = {
      title: 'New Position',
      company: 'New Company',
      period: 'Start Date - Present',
      description: 'Job description'
    };

    setContent(prev => ({
      ...prev,
      experience: {
        ...prev.experience,
        jobs: [...prev.experience.jobs, newJob]
      }
    }));
  };

  const handleDeleteJob = (index) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;

    setContent(prev => ({
      ...prev,
      experience: {
        ...prev.experience,
        jobs: prev.experience.jobs.filter((_, i) => i !== index)
      }
    }));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const jobs = Array.from(content.experience.jobs);
    const [reorderedItem] = jobs.splice(result.source.index, 1);
    jobs.splice(result.destination.index, 0, reorderedItem);

    setContent(prev => ({
      ...prev,
      experience: {
        ...prev.experience,
        jobs: jobs
      }
    }));
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Experience Section</h2>
        <button onClick={() => navigate('/admin')} className="back-button">
          Back to Dashboard
        </button>
      </div>

      <div className="add-new-section">
        <h3>Add New Job</h3>
        <button className="add-button" onClick={handleAddJob}>
          Add New Job Position
        </button>
      </div>

      <div className="items-section">
        <h3>Current Positions</h3>
        {content.experience.jobs.length === 0 ? (
          <p className="no-items-message">No jobs added yet. Add your first job position above.</p>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="jobs">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="items-grid">
                  {content.experience.jobs.map((job, index) => (
                    <Draggable
                      key={index}
                      draggableId={`job-${index}`}
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
                              value={job.title}
                              onChange={(e) => handleChange(index, 'title', e.target.value)}
                              placeholder="Enter job title"
                            />
                          </div>

                          <div className="form-group">
                            <label>Company:</label>
                            <input
                              type="text"
                              value={job.company}
                              onChange={(e) => handleChange(index, 'company', e.target.value)}
                              placeholder="Enter company name"
                            />
                          </div>

                          <div className="form-group">
                            <label>Period:</label>
                            <input
                              type="text"
                              value={job.period}
                              onChange={(e) => handleChange(index, 'period', e.target.value)}
                              placeholder="e.g., Jan 2020 - Present"
                            />
                          </div>

                          <div className="form-group">
                            <label>Description:</label>
                            <textarea
                              value={job.description}
                              onChange={(e) => handleChange(index, 'description', e.target.value)}
                              placeholder="Describe your role and responsibilities"
                            />
                          </div>

                          <button
                            className="delete-button"
                            onClick={() => handleDeleteJob(index)}
                          >
                            Delete Job
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
        )}
      </div>
    </div>
  );
};

export default ExperienceAdmin;