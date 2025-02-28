import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Helmet } from 'react-helmet';
import './BlogPost.css';

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const postsRef = collection(db, 'blog-posts');
    const q = query(postsRef, where('slug', '==', slug));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        if (!snapshot.empty) {
          const postData = snapshot.docs[0].data();
          setPost({ id: snapshot.docs[0].id, ...postData });
        } else {
          setPost(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching blog post:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [slug]);

  if (loading) {
    return <div className="blog-post-loading">Loading post...</div>;
  }

  if (!post) {
    return <div className="blog-post-error">Post not found</div>;
  }

  return (
    <div className="blog-post-container">
      <Helmet>
        <title>{post.title} - Antonio Smith's Blog</title>
        <meta name="description" content={post.excerpt || post.content.substring(0, 155)} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt || post.content.substring(0, 155)} />
        <meta name="keywords" content={post.tags?.join(', ')} />
      </Helmet>

      <Link to="/blog" className="back-link">&larr; Back to Blog</Link>

      <article className="blog-post-content">
        {post.thumbnail && (
          <div className="post-thumbnail">
            <img src={post.thumbnail} alt={post.title} />
          </div>
        )}
        <h1>{post.title}</h1>
        <div className="post-meta">
          <span className="post-date">
            {new Date(post.createdAt?.toDate()).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
          {post.readTime && (
            <span className="read-time">{post.readTime} mins read</span>
          )}
          {post.tags && (
            <div className="post-tags">
              {post.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          )}
        </div>
        <div className="post-body" dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
    </div>
  );
};

export default BlogPost;