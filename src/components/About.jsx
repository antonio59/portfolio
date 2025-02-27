import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaImage, FaBook, FaHeadphones, FaMountain, FaTv, FaSeedling } from 'react-icons/fa';
import './About.css';
import content from '../data/content.json';

const About = () => {
  const [showMore, setShowMore] = useState(false);
  const { about } = content;

  const toggleShowMore = () => {
    setShowMore(!showMore);
  };

  return (
    <section id="about">
      <div className="container">
        <h2>{about.title}</h2>
        <div className="about-content">
          <img src="https://placehold.co/250x250?text=Antonio" alt="Antonio Smith" className="profile-pic" />
          <div className="about-text">
            <p>My tech journey began at Le Wagon as a Full Stack Web Developer, leading to a Software Developer role at DNEG. There, I optimized internal tools and integrated key systems like Workday, bridging the gap between developers and stakeholders.</p>
            <p>I later transitioned into project management at DNEG, discovering my passion for leading teams and overseeing full product lifecycles.</p>
            {showMore && (
              <>
                <p>I'm passionate about AI, building GPT models and exploring blockchain technologies. I'm driven by their potential to solve real-world problems in healthcare, voting systems, and financial inclusion.</p>
                <p>Whether managing projects or experimenting with emerging tech, I thrive on solving complex problems and creating impactful solutions.</p>
              </>
            )}
            <div className="read-more-container">
              <button className="btn-read-more" onClick={toggleShowMore}>
                {showMore ? 'Read Less' : 'Read More'} {showMore ? <FaChevronUp /> : <FaChevronDown />}
              </button>
            </div>
          </div>
        </div>
        <div className="currently">
          <h3>Currently...</h3>
          <div className="currently-grid">
            <div className="currently-item">
              <FaImage />
              <span>Collecting NFTs, <a href="#" className="nft-link">check out my collection here</a></span>
            </div>
            <div className="currently-item">
              <FaBook />
              <span>Reading "Meditations" by Marcus Aurelius</span>
            </div>
            <div className="currently-item">
              <FaHeadphones />
              <span>Listening to Symphony No. 2 in D major</span>
            </div>
            <div className="currently-item">
              <FaMountain />
              <span>Planning a hiking trip to the Dolomites</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;