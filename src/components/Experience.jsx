import React from 'react';
import { FaCalendar } from 'react-icons/fa';
import './Experience.css';

const Experience = () => {
  const jobs = [
    {
      title: "Technology Project Manager",
      company: "DNEG",
      duration: "2019 – Present",
      description: "Led the deployment of Workday HCM for 10,000 employees, improved project delivery efficiency by streamlining workflows, and drove global training compliance with the Cornerstone LMS rollout."
    },
    {
      title: "Software Developer",
      company: "DNEG",
      duration: "2017 – 2018",
      description: "Developed features for Shotgun, improved company web infrastructure with high availability, and integrated legacy systems for real-time data analytics."
    },
    {
      title: "Growth Account Manager",
      company: "Gett",
      duration: "2014 – 2016",
      description: "Expanded the corporate account portfolio, secured major contracts with FTSE 500 companies, and facilitated the adoption of enterprise mobility solutions."
    },
    {
      title: "Banking Consultant",
      company: "Chelsea Building Society",
      duration: "2011 – 2014",
      description: "Ranked in the top 10% for revenue generation and helped the branch achieve national top performance in new account acquisitions through targeted strategies."
    }
  ];

  return (
    <section id="experience">
      <div className="container">
        <h2>Experience</h2>
        <p className="section-description">
          A journey through my professional career, showcasing my growth and key achievements across various roles.
        </p>
        <div className="timeline">
          {jobs.map((job, index) => (
            <div key={index} className="timeline-item">
              <div className="timeline-content">
                <h3>{job.title} – {job.company}</h3>
                <p className="job-details">
                  <span><FaCalendar /> {job.duration}</span>
                </p>
                <p className="job-description">{job.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;