import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import '../Admin.css';

const BlogEditor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { post, isNew } = location.state || { post: {
    title: '',
    content: '',
    excerpt: '',
    slug: '',
    tags: [],
    published: false,
    createdAt: new Date(),
    readTime: 0
  }, isNew: true };

  const [formData, setFormData] = useState(post);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const postData = {
        ...formData,
        slug: formData.slug || generateSlug(formData.title),
        updatedAt: new Date()
      };

      if (isNew) {
        await addDoc(collection(db, 'blog-posts'), postData);
      } else {
        const postRef = doc(db, 'blog-posts', post.id);
        await updateDoc(postRef, postData);
      }

      navigate('/admin/blog');
    } catch (error) {
      console.error('Error saving blog post:', error);
      alert('Failed to save blog post. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>{isNew ? 'Create New Blog Post' : 'Edit Blog Post'}</h2>
        <button onClick={() => navigate('/admin/blog')} className="back-button">
          Back to Blog Management
        </button>
      </div>

      <form onSubmit={handleSubmit} className="blog-editor-form">
        <div className="form-group">
          <label>Title:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Content:</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows="15"
            required
          />
        </div>

        <div className="form-group">
          <label>Excerpt:</label>
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Slug (optional):</label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            placeholder="Will be generated from title if left empty"
          />
        </div>

        <div className="form-group">
          <label>Tags (comma-separated):</label>
          <input
            type="text"
            value={formData.tags.join(', ')}
            onChange={handleTagsChange}
            placeholder="technology, programming, web development"
          />
        </div>

        <div className="form-group">
          <label>Read Time (minutes):</label>
          <input
            type="number"
            name="readTime"
            value={formData.readTime}
            onChange={handleChange}
            min="0"
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="published"
              checked={formData.published}
              onChange={(e) => handleChange({
                target: {
                  name: 'published',
                  value: e.target.checked
                }
              })}
            />
            Published
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-button" disabled={saving}>
            {saving ? 'Saving...' : 'Save Blog Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogEditor;