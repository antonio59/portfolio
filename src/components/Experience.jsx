import React, { useState } from 'react';
import { FaCalendar, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './Experience.css';

const Experience = () => {
  const companies = [
    {
      name: "DNEG",
      positions: [
        {
          title: "Technology Project Manager (2019 – Present)",
          duration: "2019 – Present",
          description: "Led strategic technology initiatives and digital transformation projects.",
          achievements: [
            "Led the successful deployment of Workday HCM for 10,000+ employees across global offices",
            "Improved project delivery efficiency by 30% through streamlined workflows and automated processes",
            "Drove global training compliance to 95% with the Cornerstone LMS rollout",
            "Managed cross-functional teams across 3 continents for enterprise software implementations",
            "Reduced system downtime by 40% through improved infrastructure monitoring and maintenance"
          ],
          defaultExpanded: true
        },
        {
          title: "Software Developer (2017 – 2018)",
          duration: "2017 – 2018",
          description: "Developed and maintained critical software infrastructure.",
          achievements: [
            "Developed key features for Shotgun pipeline integration",
            "Improved company web infrastructure achieving 99.9% availability",
            "Integrated legacy systems enabling real-time data analytics",
            "Reduced build times by 25% through optimization of CI/CD pipelines",
            "Implemented automated testing reducing bug reports by 35%"
          ],
          defaultExpanded: false
        }
      ]
    },
    {
      name: "Gett",
      positions: [
        {
          title: "Growth Account Manager",
          duration: "2014 – 2016",
          description: "Expanded the corporate account portfolio, secured major contracts with FTSE 500 companies, and facilitated the adoption of enterprise mobility solutions."
        }
      ]
    },
    {
      name: "Chelsea Building Society",
      positions: [
        {
          title: "Banking Consultant",
          duration: "2011 – 2014",
          description: "Ranked in the top 10% for revenue generation and helped the branch achieve national top performance in new account acquisitions through targeted strategies."
        }
      ]
    }
  ];

  const [activeTab, setActiveTab] = useState(0);
  const [expandedPositions, setExpandedPositions] = useState(() => {
    // Initialize with default expanded states
    const expanded = {};
    companies.forEach((company, companyIndex) => {
      company.positions.forEach((position, positionIndex) => {
        expanded[`${companyIndex}-${positionIndex}`] = position.defaultExpanded || false;
      });
    });
    return expanded;
  });

  return (
    <section id="experience">
      <div className="container">
        <h2>Experience</h2>
        <p className="section-description">
          A journey through my professional career, showcasing my growth and key achievements across various roles.
        </p>
        <div className="experience-container">
          <div className="company-tabs">
            {companies.map((company, index) => (
              <button
                key={index}
                className={`company-tab ${activeTab === index ? 'active' : ''}`}
                onClick={() => setActiveTab(index)}
              >
                {company.name}
              </button>
            ))}
          </div>
          <div className="experience-content">
            {companies[activeTab].positions.map((position, index) => (
              <div key={index} className="position-details">
                <div 
                  className="position-header" 
                  onClick={() => {
                    if (companies[activeTab].name === "DNEG") {
                      setExpandedPositions(prev => ({
                        ...prev,
                        [`${activeTab}-${index}`]: !prev[`${activeTab}-${index}`]
                      }));
                    }
                  }}
                  style={{ cursor: companies[activeTab].name === "DNEG" ? 'pointer' : 'default' }}
                >
                  <div>
                    <h3>{position.title}</h3>
                  </div>
                  {companies[activeTab].name === "DNEG" && (
                    <span className="expand-icon">
                      {expandedPositions[`${activeTab}-${index}`] ? <FaChevronUp /> : <FaChevronDown />}
                    </span>
                  )}
                </div>
                {(!companies[activeTab].name === "DNEG" || expandedPositions[`${activeTab}-${index}`]) && (
                  <div className="position-content">
                    <p className="job-description">{position.description}</p>
                    {position.achievements && (
                      <ul className="achievements-list">
                        {position.achievements.map((achievement, i) => (
                          <li key={i}>{achievement}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                {index < companies[activeTab].positions.length - 1 && <hr className="position-divider" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;