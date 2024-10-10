import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaImage, FaBook, FaHeadphones, FaMountain, FaTv, FaSeedling } from 'react-icons/fa';
import './About.css';

const About = () => {
  const [showMore, setShowMore] = useState(false);

  const toggleShowMore = () => {
    setShowMore(!showMore);
  };

  return (
    <section id="about">
      <div className="container">
        <h2>About Me</h2>
        <p className="section-description">
          A technical PM with a unique blend of technical expertise and leadership skills.
        </p>
        <div className="about-content">
          <img src="https://placehold.co/300x300?text=Antonio" alt="Antonio Smith" className="profile-pic" />
          <div className="about-text">
            <p>My tech journey began at Le Wagon as a Full Stack Web Developer, leading to a Software Developer role at DNEG. There, I optimized internal tools and integrated key systems like Workday, bridging the gap between developers and stakeholders.</p>
            <p>I later transitioned into project management at DNEG, discovering my passion for leading teams and overseeing full product lifecycles.</p>
            {showMore && (
              <>
                <p>I'm passionate about AI, building GPT models and exploring blockchain technologies. I'm driven by their potential to solve real-world problems in healthcare, voting systems, and financial inclusion.</p>
                <p>Whether managing projects or experimenting with emerging tech, I thrive on solving complex problems and creating impactful solutions.</p>
              </>
            )}
            <button className="btn-read-more" onClick={toggleShowMore}>
              {showMore ? 'Read Less' : 'Read More'} {showMore ? <FaChevronUp /> : <FaChevronDown />}
            </button>
          </div>
        </div>
        <div className="currently">
          <h3>Currently...</h3>
          <ul>
            <li><FaImage /> Collecting NFTs, <a href="#" className="nft-link">check out my collection here</a></li>
            <li><FaBook /> Reading "Meditations" by Marcus Aurelius</li>
            <li><FaHeadphones /> Listening to Symphony No. 2 in D major</li>
            <li><FaMountain /> Learning to Climb</li>
            <li><FaTv /> Watching Law & Order: SVU and Chicago PD</li>
            <li><FaSeedling /> Watering my plants</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default About;