import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { Helmet } from 'react-helmet';
import './Blog.css';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'blog-posts'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const fetchedPosts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPosts(fetchedPosts);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching blog posts:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="blog-loading">Loading posts...</div>;
  }

  return (
    <div className="blog-container">
      <Helmet>
        <title>Latest Articles - Antonio Smith</title>
        <meta name="description" content="My thoughts on tech, programming, and life in general." />
        <meta name="keywords" content="blog, software development, technology, programming, life" />
      </Helmet>

      <h1 className="blog-title">My thoughts on ... everything</h1>
      <p className="blog-subtitle">I love writing about tech, programming, and life in general. I hope you will click on them by mistake. Here are a few of my latest articles. You can find more on my <a href="/blog" className="blog-link">blog page</a>.</p>
      
      <div className="blog-posts">
        {posts.length === 0 ? (
          <p className="no-posts">No blog posts yet.</p>
        ) : (
          posts.map(post => (
            <article key={post.id} className="blog-post">
              {post.thumbnail && (
                <div className="post-thumbnail">
                  <img src={post.thumbnail} alt={post.title} />
                </div>
              )}
              <div className="post-content">
                <h2>{post.title}</h2>
                <div className="post-meta">
                  <span className="post-date">
                    {new Date(post.createdAt?.toDate()).toLocaleDateString('en-US', { 
                      year: 'numeric',
                      month: 'long', 
                      day: 'numeric'
                    })}
                    {post.readTime && (
                      <span className="read-time">{post.readTime} mins read</span>
                    )}
                  </span>
                </div>
                <div className="post-excerpt">
                  {post.excerpt || post.content.substring(0, 150)}...
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};

export default Blog;