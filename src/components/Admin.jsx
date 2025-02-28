import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { auth, db } from '../firebase';
import contentData from '../data/content.json';
import './Admin.css';

// Import admin section components
import HeroAdmin from './admin/HeroAdmin';
import AboutAdmin from './admin/AboutAdmin';
import ExperienceAdmin from './admin/ExperienceAdmin';
import ProjectsAdmin from './admin/ProjectsAdmin';
import BlogEditor from './admin/BlogEditor';

const Admin = () => {
  const [content, setContent] = useState(contentData);
  const [blogPosts, setBlogPosts] = useState([]);
  const [newCertification, setNewCertification] = useState({ title: '', description: '' });
  const navigate = useNavigate();

  const handleImageUpload = async (e, section, field, index = null) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // In a real app, you would upload to a storage service
      const imageUrl = URL.createObjectURL(file);
      
      if (index !== null) {
        handleChange(section, field, imageUrl, index, 'image');
      } else {
        handleChange(section, field, imageUrl);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    }
  };

  const handleAddJob = () => {
    const newJob = {
      company: 'New Company',
      position: 'New Position',
      duration: 'Start Date - Present',
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

  const handleAddItem = (section, field) => {
    const newItem = {
      title: 'New Item',
      description: 'Description',
      technologies: []
    };

    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: [...prev[section][field], newItem]
      }
    }));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    let unsubscribe;

    const fetchBlogPosts = async () => {
      try {
        const q = query(collection(db, 'blog-posts'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const posts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBlogPosts(posts);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        alert('Failed to fetch blog posts. Please check your connection and try again.');
      }
    };

    fetchBlogPosts();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const handleChange = (section, field, value, index = null, subfield = null) => {
    setContent(prev => {
      const newContent = { ...prev };
      if (index !== null) {
        if (subfield) {
          newContent[section][field][index][subfield] = value;
        } else {
          newContent[section][field][index] = value;
        }
      } else {
        newContent[section][field] = value;
      }
      return newContent;
    });
  };

  const handleDragEnd = (result, section, field) => {
    if (!result.destination) return;

    const items = Array.from(content[section][field]);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: items
      }
    }));
  };

  const togglePin = (section, field, index) => {
    setContent(prev => {
      const newContent = { ...prev };
      const items = [...newContent[section][field]];
      const item = { ...items[index], pinned: !items[index].pinned };
      
      if (item.pinned) {
        items.splice(index, 1);
        items.unshift(item);
      } else {
        items[index] = item;
      }
      
      newContent[section][field] = items;
      return newContent;
    });
  };

  const handleSave = () => {
    console.log('Saving content:', content);
    localStorage.setItem('portfolioContent', JSON.stringify(content));
    alert('Content saved successfully!');
  };

  const handlePreview = () => {
    localStorage.setItem('portfolioContent', JSON.stringify(content));
    window.open('/', '_blank');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleAddBlogPost = () => {
    const newPost = {
      title: 'New Blog Post',
      content: '',
      excerpt: '',
      slug: '',
      tags: [],
      published: false,
      createdAt: new Date(),
      readTime: 0
    };

    navigate('/admin/blog/edit', { state: { post: newPost, isNew: true } });
  };

  const renderCardList = (section, field) => (
    <DragDropContext onDragEnd={(result) => handleDragEnd(result, section, field)}>
      <Droppable droppableId={`${section}-${field}`}>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {content[section][field].map((item, index) => (
              <Draggable
                key={index}
                draggableId={`${section}-${field}-${index}`}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`card-item ${item.pinned ? 'pinned' : ''}`}
                  >
                    <div className="card-header">
                      <button
                        onClick={() => togglePin(section, field, index)}
                        className={`pin-button ${item.pinned ? 'pinned' : ''}`}
                      >
                        📌
                      </button>
                      <h4>Item {index + 1}</h4>
                    </div>
                    {Object.entries(item).map(([key, value]) => {
                      if (key !== 'pinned') {
                        return (
                          <div key={key} className="form-group">
                            <label>{key}:</label>
                            {Array.isArray(value) ? (
                              <input
                                type="text"
                                value={value.join(', ')}
                                onChange={(e) => handleChange(section, field, e.target.value.split(',').map(v => v.trim()), index, key)}
                              />
                            ) : (
                              <input
                                type="text"
                                value={value}
                                onChange={(e) => handleChange(section, field, e.target.value, index, key)}
                              />
                            )}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );

  const renderBlogSection = () => (
    <div className="admin-section">
      <h2>Blog Management</h2>
      <button className="add-button" onClick={() => handleAddBlogPost()}>
        Add New Blog Post
      </button>
      <div className="blog-posts-list">
        {blogPosts.map((post, index) => (
          <div key={post.id} className="blog-post-item">
            <h3>{post.title}</h3>
            <div className="post-meta">
              <span>Created: {new Date(post.createdAt?.toDate()).toLocaleDateString()}</span>
              <span>Status: {post.published ? 'Published' : 'Draft'}</span>
            </div>
            <div className="post-actions">
              <button onClick={() => handleEditPost(post)}>Edit</button>
              <button onClick={() => handleDeletePost(post.id)}>Delete</button>
              <button onClick={() => handleTogglePublish(post)}>
                {post.published ? 'Unpublish' : 'Publish'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCertificationsSection = () => (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Certifications Management</h2>
        <button onClick={() => navigate('/admin')} className="back-button">
          Back to Dashboard
        </button>
      </div>

      <div className="add-new-section">
        <h3>Add New Certification</h3>
        <div className="form-group">
          <label>Title:</label>
          <input
            type="text"
            value={newCertification.title}
            onChange={(e) => setNewCertification(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter certification title"
          />
        </div>
        <div className="form-group">
          <label>Description:</label>
          <textarea
            value={newCertification.description}
            onChange={(e) => setNewCertification(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter certification description"
          />
        </div>
        <button
          className="add-button"
          onClick={() => {
            if (!newCertification.title || !newCertification.description) {
              alert('Please fill in all fields');
              return;
            }
            setContent(prev => ({
              ...prev,
              certifications: {
                ...prev.certifications,
                items: [...prev.certifications.items, newCertification]
              }
            }));
            setNewCertification({ title: '', description: '' });
          }}
        >
          Add Certification
        </button>
      </div>

      <div className="items-section">
        <h3>Existing Certifications</h3>
        {content.certifications.items.length === 0 ? (
          <p className="no-items-message">No certifications added yet. Add your first certification above.</p>
        ) : (
          <DragDropContext onDragEnd={(result) => handleDragEnd(result, 'certifications', 'items')}>
            <Droppable droppableId="certifications-items">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="items-grid">
                  {content.certifications.items.map((cert, index) => (
                    <Draggable
                      key={index}
                      draggableId={`certification-${index}`}
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
                              value={cert.title}
                              onChange={(e) => handleChange('certifications', 'items', e.target.value, index, 'title')}
                            />
                          </div>
                          <div className="form-group">
                            <label>Description:</label>
                            <textarea
                              value={cert.description}
                              onChange={(e) => handleChange('certifications', 'items', e.target.value, index, 'description')}
                            />
                          </div>
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this certification?')) {
                                setContent(prev => ({
                                  ...prev,
                                  certifications: {
                                    ...prev.certifications,
                                    items: prev.certifications.items.filter((_, i) => i !== index)
                                  }
                                }));
                              }
                            }}
                            className="delete-button"
                          >
                            Delete
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

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-controls">
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <nav className="admin-nav">
        <button onClick={() => navigate('/admin/hero')}>Hero</button>
        <button onClick={() => navigate('/admin/about')}>About</button>
        <button onClick={() => navigate('/admin/experience')}>Experience</button>
        <button onClick={() => navigate('/admin/projects')}>Projects</button>
        <button onClick={() => navigate('/admin/certifications')}>Certifications</button>
        <button onClick={() => navigate('/admin/blog')}>Blog</button>
      </nav>

      <Routes>
        <Route path="" element={<div className="welcome-message">Welcome to the Admin Dashboard</div>} />
        <Route path="hero" element={<HeroAdmin content={content} setContent={setContent} />} />
        <Route path="about" element={<AboutAdmin content={content} setContent={setContent} />} />
        <Route path="experience" element={<ExperienceAdmin content={content} setContent={setContent} />} />
        <Route path="projects" element={<ProjectsAdmin content={content} setContent={setContent} />} />
        <Route path="blog" element={renderBlogSection()} />
        <Route path="blog/edit" element={<BlogEditor />} />
        <Route path="certifications" element={renderCertificationsSection()} />
      </Routes>

      <div className="admin-footer">
        <button className="preview-button" onClick={handlePreview}>Preview Changes</button>
        <button className="save-button" onClick={handleSave}>Save Changes</button>
      </div>
    </div>
  );
};

export default Admin;