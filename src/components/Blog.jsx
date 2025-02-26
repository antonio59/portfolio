import React, { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { Helmet } from 'react-helmet';
import './Blog.css';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(collection(db, 'blog-posts'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedPosts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPosts(fetchedPosts);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <div className="blog-loading">Loading posts...</div>;
  }

  return (
    <div className="blog-container">
      <Helmet>
        <title>Blog - Antonio Smith</title>
        <meta name="description" content="Thoughts and insights on software development, technology, and more." />
        <meta name="keywords" content="blog, software development, technology, programming" />
      </Helmet>

      <h1 className="blog-title">Blog</h1>
      
      <div className="blog-posts">
        {posts.length === 0 ? (
          <p className="no-posts">No blog posts yet.</p>
        ) : (
          posts.map(post => (
            <article key={post.id} className="blog-post">
              <h2>{post.title}</h2>
              <div className="post-meta">
                <span className="post-date">
                  {new Date(post.createdAt?.toDate()).toLocaleDateString()}
                </span>
              </div>
              <div className="post-excerpt">
                {post.content.substring(0, 200)}...
              </div>
              <a href={`/blog/${post.slug}`} className="read-more">
                Read More
              </a>
            </article>
          ))
        )}
      </div>
    </div>
  );
};

export default Blog;