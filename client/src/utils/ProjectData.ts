export interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  link: string;
}

export const projects: Project[] = [
  {
    id: 1,
    title: "Mindful - Wellness Platform",
    description: "A comprehensive digital wellness platform focused on mental health tracking and meditation.",
    category: "UI/UX Design",
    imageUrl: "https://images.unsplash.com/photo-1626544827763-d516dce335e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    link: "#"
  },
  {
    id: 2,
    title: "Verdant - Sustainable Fashion",
    description: "E-commerce platform for sustainable fashion with ethical sourcing information and carbon footprint tracking.",
    category: "Web Development",
    imageUrl: "https://images.unsplash.com/photo-1600267204091-5c1ab8b10c02?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    link: "#"
  },
  {
    id: 3,
    title: "FinViz - Financial Dashboard",
    description: "Interactive financial analytics dashboard with real-time data visualization and predictive analysis.",
    category: "Data Visualization",
    imageUrl: "https://images.unsplash.com/photo-1618761714954-0b8cd0026356?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    link: "#"
  },
  {
    id: 4,
    title: "Linguo - AI Language Learning",
    description: "AI-powered language learning application with adaptive learning paths and real-time pronunciation feedback.",
    category: "Mobile App",
    imageUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    link: "#"
  }
];

export interface Experience {
  id: number;
  role: string;
  company: string;
  period: string;
  description: string;
}

export const experiences: Experience[] = [
  {
    id: 1,
    role: "Senior UX Developer",
    company: "InnovateX Digital",
    period: "2021 - Present",
    description: "Led cross-functional teams in designing and developing award-winning digital experiences for enterprise clients."
  },
  {
    id: 2,
    role: "UI/UX Designer",
    company: "Pixel Perfect Studios",
    period: "2018 - 2021",
    description: "Designed user interfaces and experiences for mobile applications and responsive websites with a focus on accessibility."
  },
  {
    id: 3,
    role: "Frontend Developer",
    company: "WebCraft Solutions",
    period: "2016 - 2018",
    description: "Developed responsive, cross-browser compatible websites and implemented interactive UI components."
  }
];

export interface Education {
  id: number;
  degree: string;
  institution: string;
  period: string;
  description: string;
}

export const education: Education[] = [
  {
    id: 1,
    degree: "BSc in Computer Science",
    institution: "University of Technology",
    period: "2012 - 2016",
    description: "Specialized in Human-Computer Interaction and Interactive Systems Design."
  },
  {
    id: 2,
    degree: "UX Design Professional Certificate",
    institution: "Google",
    period: "2020",
    description: "Comprehensive program covering the UX design process from research to high-fidelity prototyping."
  },
  {
    id: 3,
    degree: "Frontend Web Development",
    institution: "Fullstack Academy",
    period: "2019",
    description: "Intensive program focusing on modern JavaScript frameworks and responsive web development."
  }
];
