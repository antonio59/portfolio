import React, { useState } from 'react';
import { FaCalendar, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './Experience.css';
import content from '../data/content.json';

const Experience = () => {
  const { experience } = content;
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
          title: "Customer Service Representative",
          duration: "2012 – 2014",
          description: "Provided exceptional customer service and support for financial products and services."
        }
      ]
    }
  ];

  const [activeCompany, setActiveCompany] = useState(0);

  return (
    <section id="experience">
      <h2>{experience.title}</h2>
      <div className="experience-container">
        <div className="company-tabs">
          {companies.map((company, index) => (
            <button
              key={index}
              className={`company-tab ${index === activeCompany ? 'active' : ''}`}
              onClick={() => setActiveCompany(index)}
            >
              {company.name}
            </button>
          ))}
        </div>
        <div className="experience-content">
          {companies[activeCompany].positions.map((position, index) => (
            <div key={index} className="job-details">
              <h3>{position.title}</h3>
              <div className="job-company">{companies[activeCompany].name}</div>
              <div className="duration">
                <FaCalendar /> {position.duration}
              </div>
              <p className="job-description">{position.description}</p>
              {position.achievements && (
                <ul className="achievements">
                  {position.achievements.map((achievement, achIndex) => (
                    <li key={achIndex}>{achievement}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;