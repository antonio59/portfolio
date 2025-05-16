import { storage } from "./storage";
import { 
  InsertSection, 
  InsertProject, 
  InsertExperience,
  InsertCertification,
  InsertBlogCategory,
  InsertBlogPost,
  sectionTypeEnum
} from "@shared/schema";

// Sample data for seeding the database
export async function seedDatabase() {
  console.log("Seeding database with sample data...");
  
  try {
    // Create a user if none exists
    const adminUser = await storage.getUserByUsername("admin");
    if (!adminUser) {
      await storage.createUser({
        username: "admin",
        password: "$2b$10$A8BmrHuaXlpxuv1YuPEJ6.gJsZHqkfYQr3UDH1.D.qt3kNyc1TaLW" // password123
      });
      console.log("Created admin user");
    }
    
    // Seed sections
    const existingSections = await storage.getAllSections();
    if (existingSections.length === 0) {
      const sectionSamples: InsertSection[] = [
        {
          type: "hero",
          title: "Antonio Smith",
          subtitle: "Project Manager & App Developer",
          content: {
            description: "Experienced project manager with a passion for building innovative applications and self-hosted solutions.",
            ctaText: "View My Work",
            ctaLink: "#projects",
            backgroundImage: "/images/hero-bg.jpg"
          }
        },
        {
          type: "about",
          title: "About Me",
          subtitle: "My Background & Expertise",
          content: {
            bio: "I'm a project manager with 8+ years of experience in technology and product development. I specialize in leading cross-functional teams to deliver complex projects on time and within budget. In my free time, I develop applications and explore self-hosted alternatives to popular SaaS products.",
            skills: ["Project Management", "Agile Methodologies", "Web Development", "Mobile App Development", "Self-Hosted Solutions", "DevOps"],
            image: "/images/profile.jpg"
          }
        },
        {
          type: "contact",
          title: "Get In Touch",
          subtitle: "Let's Connect",
          content: {
            email: "hello@antoniosmith.me",
            linkedin: "https://linkedin.com/in/antoniosmith",
            github: "https://github.com/antoniosmith",
            twitter: "https://twitter.com/antoniosmith",
            location: "San Francisco, CA"
          }
        }
      ];
      
      for (const section of sectionSamples) {
        await storage.createSection(section);
      }
      
      console.log("Seeded sections data");
    }
    
    // Seed projects
    const existingProjects = await storage.getAllProjects();
    if (existingProjects.length === 0) {
      const projectSamples: InsertProject[] = [
        {
          title: "Enterprise Resource Planning System",
          description: "Led the implementation of an ERP system for a manufacturing company with 500+ employees. Coordinated cross-functional teams and ensured successful integration with existing systems.",
          technologies: [
            { name: "SAP" },
            { name: "SQL Server" },
            { name: "Power BI" }
          ],
          imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
          category: "professional",
          featured: true,
          year: "2022",
          externalLink: "#"
        },
        {
          title: "Healthcare Mobile Application",
          description: "Managed the development of a patient-centric mobile application for a healthcare provider. The app improved patient engagement and streamlined appointment scheduling.",
          technologies: [
            { name: "React Native" },
            { name: "Node.js" },
            { name: "MongoDB" }
          ],
          imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
          category: "professional",
          featured: true,
          year: "2021",
          externalLink: "#"
        },
        {
          title: "Home Media Server",
          description: "Designed and implemented a personal media server using Jellyfin, running on a custom-built NAS system for storing and streaming media content throughout my home.",
          technologies: [
            { name: "Docker" },
            { name: "Jellyfin" },
            { name: "Linux" },
            { name: "nginx" }
          ],
          imageUrl: "https://images.unsplash.com/photo-1593152167544-085d3b9c4938?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2374&q=80",
          category: "personal",
          featured: false,
          year: "2022",
          externalLink: "#",
          githubLink: "https://github.com/example/media-server"
        }
      ];
      
      for (const project of projectSamples) {
        await storage.createProject(project);
      }
      
      console.log("Seeded projects data");
    }
    
    // Seed experiences
    const existingExperiences = await storage.getAllExperiences();
    if (existingExperiences.length === 0) {
      const experienceSamples: InsertExperience[] = [
        {
          company: "Tech Innovations Inc.",
          role: "Senior Project Manager",
          period: "Jun 2020 - Present",
          description: "Leading cross-functional teams to deliver enterprise software solutions.",
          achievements: [
            "Manage project lifecycle from initiation to deployment",
            "Coordinate with stakeholders to gather and clarify requirements",
            "Lead Agile ceremonies and ensure sprint goals are met",
            "Mitigate risks and resolve issues that impact project timelines"
          ],
          methodologies: ["Agile", "Scrum", "Kanban", "JIRA"],
          order: 1
        },
        {
          company: "Global Solutions Ltd.",
          role: "Project Manager",
          period: "Mar 2018 - May 2020",
          description: "Managed digital transformation projects for clients in finance and healthcare.",
          achievements: [
            "Oversaw implementation of CRM systems for enterprise clients",
            "Coordinated development teams across multiple time zones",
            "Developed project plans and tracked milestones using JIRA",
            "Prepared and presented status reports to executive stakeholders"
          ],
          methodologies: ["Waterfall", "Agile", "MS Project", "Confluence"],
          order: 2
        }
      ];
      
      for (const experience of experienceSamples) {
        await storage.createExperience(experience);
      }
      
      console.log("Seeded experiences data");
    }
    
    // Seed certifications
    const existingCertifications = await storage.getAllCertifications();
    if (existingCertifications.length === 0) {
      const certificationSamples: InsertCertification[] = [
        {
          title: "Project Management Professional (PMP)",
          issuer: "Project Management Institute",
          issueDate: "2019-03-15",
          expiryDate: "2025-03-15",
          credentialID: "PMP-123456",
          credentialURL: "https://www.pmi.org/certifications/verify",
          description: "Globally recognized project management certification demonstrating knowledge of project management processes and methodologies.",
          skills: ["Project Management", "Risk Management", "Stakeholder Engagement", "Leadership"],
          featured: true,
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/PMI_logo.svg/1200px-PMI_logo.svg.png"
        },
        {
          title: "Certified ScrumMaster (CSM)",
          issuer: "Scrum Alliance",
          issueDate: "2018-06-10",
          expiryDate: "2024-06-10",
          credentialID: "CSM-789012",
          credentialURL: "https://www.scrumalliance.org/community/profile/certification-validation",
          description: "Certification validating expertise in Scrum methodology for Agile project management.",
          skills: ["Agile", "Scrum", "Sprint Planning", "Retrospectives"],
          featured: true,
          imageUrl: "https://www.scrumalliance.org/ScrumRedesignDEVSite/media/ScrumAllianceMedia/Member%20Logos/SA-CSM-Logo.png"
        }
      ];
      
      for (const certification of certificationSamples) {
        await storage.createCertification(certification);
      }
      
      console.log("Seeded certifications data");
    }
    
    // Seed blog categories
    const existingCategories = await storage.getAllBlogCategories();
    if (existingCategories.length === 0) {
      const categorySamples: InsertBlogCategory[] = [
        {
          name: "Self-Hosted Solutions",
          slug: "self-hosted",
          description: "Projects and guides for hosting your own applications"
        },
        {
          name: "Web Development",
          slug: "web-dev",
          description: "All about building great websites and web applications"
        },
        {
          name: "DevOps",
          slug: "devops",
          description: "Streamlining development and operations"
        },
        {
          name: "Project Management",
          slug: "project-management",
          description: "Tips and insights on managing projects effectively"
        }
      ];
      
      for (const category of categorySamples) {
        await storage.createBlogCategory(category);
      }
      
      console.log("Seeded blog categories data");
    }
    
    // Seed blog posts
    const existingPosts = await storage.getAllBlogPosts();
    if (existingPosts.length === 0) {
      // Get the category IDs
      const selfHostedCategory = await storage.getBlogCategoryBySlug("self-hosted");
      const webDevCategory = await storage.getBlogCategoryBySlug("web-dev");
      const devOpsCategory = await storage.getBlogCategoryBySlug("devops");
      const pmCategory = await storage.getBlogCategoryBySlug("project-management");
      
      const blogPostSamples: InsertBlogPost[] = [
        {
          title: "Building a Self-Hosted Home Automation System with Node.js",
          slug: "self-hosted-home-automation",
          excerpt: "A complete guide to creating your own smart home system without relying on third-party services.",
          content: `<p>When I first started exploring home automation, I was drawn to the convenience of smart home products but concerned about privacy, reliability, and vendor lock-in. After trying several commercial solutions, I decided to build my own system that would run entirely on my local network.</p>
          
          <h2>Why Self-Host Your Home Automation?</h2>
          
          <p>Commercial smart home platforms like Google Home or Amazon Alexa are convenient, but they come with drawbacks:</p>
          
          <ul>
            <li>Privacy concerns - your data and usage patterns are stored on third-party servers</li>
            <li>Internet dependency - if your connection goes down, your smart home may become unavailable</li>
            <li>Limited customization - you are restricted to the features and integrations the vendor chooses to support</li>
            <li>Subscription costs - many platforms are moving toward subscription models</li>
          </ul>
          
          <p>By self-hosting, you maintain complete control over your smart home system, data, and can customize it to your exact needs.</p>
          
          <h2>Getting Started with Home Assistant</h2>
          
          <p>For my solution, I chose Home Assistant as the core platform, running on a Raspberry Pi 4. Here's how I set it up:</p>
          
          <h3>Hardware Requirements</h3>
          
          <ul>
            <li>Raspberry Pi 4 (4GB or 8GB RAM recommended)</li>
            <li>32GB+ microSD card</li>
            <li>Power supply</li>
            <li>Optional: USB SSD for better performance and reliability</li>
          </ul>
          
          <h3>Installation Steps</h3>
          
          <ol>
            <li>Flash Home Assistant OS to your SD card using the Raspberry Pi Imager</li>
            <li>Insert the SD card into your Pi and power it on</li>
            <li>After a few minutes, navigate to http://homeassistant.local:8123 on your network</li>
            <li>Follow the setup wizard to create your admin account and configure basic settings</li>
          </ol>
          
          <p>Once installed, Home Assistant provides a solid foundation with support for thousands of integrations. I added Z-Wave and Zigbee controllers to communicate with various smart devices around my home.</p>`,
          categoryId: selfHostedCategory?.id ?? null,
          featuredImage: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
          tags: ["IoT", "Home Automation", "Node.js", "Self-Hosted"],
          publishDate: new Date(),
          status: "published",
          userId: 1
        },
        {
          title: "How I Built a Portfolio Site with React and TypeScript",
          slug: "portfolio-react-typescript",
          excerpt: "A deep dive into the architecture and design decisions behind my personal portfolio website.",
          content: `<p>After years of having a basic portfolio website, I decided it was time for a complete overhaul. As a developer who works with React daily, I wanted to create something that would showcase both my design sensibilities and technical capabilities.</p>
          
          <h2>Design Philosophy</h2>
          
          <p>For this project, I embraced minimalism with purpose. My goals were:</p>
          
          <ul>
            <li>Focus on content and projects rather than flashy animations</li>
            <li>Create a responsive design that works beautifully on all devices</li>
            <li>Implement accessibility best practices from the ground up</li>
            <li>Optimize for performance and SEO</li>
          </ul>
          
          <h2>Technical Stack</h2>
          
          <p>I chose the following technologies:</p>
          
          <ul>
            <li>React with TypeScript for type safety</li>
            <li>Tailwind CSS for styling</li>
            <li>React Query for data fetching</li>
            <li>Express backend with Node.js</li>
          </ul>
          
          <p>TypeScript was particularly valuable as it helped me catch errors early and made refactoring much safer.</p>
          
          <h2>Component Architecture</h2>
          
          <p>I structured the application with reusability in mind:</p>
          
          <ul>
            <li>Atomic design principles with atoms, molecules, and organisms</li>
            <li>Context API for global state management</li>
            <li>Custom hooks for shared functionality</li>
          </ul>
          
          <p>This approach allowed me to maintain consistency throughout the site while keeping components modular and testable.</p>
          
          <h2>Performance Optimization</h2>
          
          <p>To ensure the site loads quickly and runs smoothly, I implemented:</p>
          
          <ul>
            <li>Code splitting with React.lazy and Suspense</li>
            <li>Image optimization with next-gen formats and proper sizing</li>
            <li>Preloading of critical resources</li>
            <li>Minimal third-party dependencies</li>
          </ul>
          
          <p>The result is a Lighthouse score of 98+ across all categories.</p>`,
          categoryId: webDevCategory?.id ?? null,
          featuredImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1469&q=80",
          tags: ["React", "TypeScript", "Portfolio", "Web Development"],
          publishDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          status: "published",
          userId: 1
        },
        {
          title: "Setting Up a CI/CD Pipeline with GitHub Actions",
          slug: "cicd-github-actions",
          excerpt: "A step-by-step guide to automating your deployment process using GitHub Actions.",
          content: `<p>Continuous Integration and Continuous Deployment (CI/CD) has become an essential practice in modern software development. It automates the process of testing, building, and deploying applications, reducing manual errors and saving valuable time.</p>
          
          <h2>Why GitHub Actions?</h2>
          
          <p>GitHub Actions offers several advantages for implementing CI/CD:</p>
          
          <ul>
            <li>Seamless integration with GitHub repositories</li>
            <li>Generous free tier for public and private repositories</li>
            <li>Wide variety of community-maintained actions</li>
            <li>Simple YAML-based configuration</li>
          </ul>
          
          <p>Best of all, if you're already using GitHub for source control, there's no need to sign up for additional services.</p>
          
          <h2>Setting Up Your First Workflow</h2>
          
          <p>Let's create a basic workflow for a Node.js application:</p>
          
          <ol>
            <li>Create a <code>.github/workflows</code> directory in your repository</li>
            <li>Add a YAML file, e.g., <code>deploy.yml</code></li>
          </ol>
          
          <pre><code>name: Deploy Application

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
        
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to production
        uses: some-deployment-action@v1
        with:
          api-key: ${{ secrets.DEPLOY_API_KEY }}
</code></pre>
          
          <p>This workflow will run whenever code is pushed to the main branch. It first executes tests, and if they pass, it proceeds to deploy the application.</p>
          
          <h2>Adding Environment Secrets</h2>
          
          <p>To keep sensitive information secure:</p>
          
          <ol>
            <li>Go to your repository on GitHub</li>
            <li>Navigate to Settings > Secrets and variables > Actions</li>
            <li>Click "New repository secret"</li>
            <li>Add your secrets (like API keys, tokens, etc.)</li>
          </ol>
          
          <p>These secrets can then be accessed in your workflow files using <code>${{ secrets.SECRET_NAME }}</code> syntax.</p>`,
          categoryId: devOpsCategory?.id ?? null,
          featuredImage: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1488&q=80",
          tags: ["DevOps", "CI/CD", "GitHub", "Automation"],
          publishDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
          status: "published",
          userId: 1
        },
        {
          title: "5 Critical Project Management Metrics You Should Be Tracking",
          slug: "critical-project-management-metrics",
          excerpt: "Discover the key metrics that can help you better understand project health and team performance.",
          content: `<p>In the world of project management, what gets measured gets managed. Tracking the right metrics can provide valuable insights into your project's health, team performance, and potential risks. Here are five critical metrics every project manager should monitor.</p>
          
          <h2>1. Sprint Burndown</h2>
          
          <p>For Agile teams, the sprint burndown chart visualizes work completed versus work remaining within a sprint. It helps answer:</p>
          
          <ul>
            <li>Is the team maintaining a sustainable pace?</li>
            <li>Will all committed stories be completed by the end of the sprint?</li>
            <li>Are there unexpected challenges slowing progress?</li>
          </ul>
          
          <p>A healthy burndown shows steady progress throughout the sprint, while a flat line or upward trend can indicate blockers that need addressing.</p>
          
          <h2>2. Cycle Time</h2>
          
          <p>Cycle time measures how long it takes for a task to move from "in progress" to "done." This metric helps you understand:</p>
          
          <ul>
            <li>How efficiently your team completes work</li>
            <li>Whether process improvements are having an impact</li>
            <li>Realistic timeframes for similar future tasks</li>
          </ul>
          
          <p>Shorter cycle times generally indicate smoother workflows and fewer bottlenecks.</p>
          
          <h2>3. Velocity</h2>
          
          <p>Velocity tracks how much work a team completes in a sprint, typically measured in story points or completed tasks. It's useful for:</p>
          
          <ul>
            <li>Forecasting how much work can be completed in future sprints</li>
            <li>Planning realistic release schedules</li>
            <li>Identifying trends in team productivity</li>
          </ul>
          
          <p>While comparing velocities between teams isn't productive, tracking your own team's velocity over time provides valuable planning insights.</p>
          
          <h2>4. Escaped Defects</h2>
          
          <p>This metric counts the number of bugs discovered in production. Tracking escaped defects helps:</p>
          
          <ul>
            <li>Evaluate the effectiveness of your testing processes</li>
            <li>Identify areas where quality might be compromised</li>
            <li>Justify investments in testing infrastructure or practices</li>
          </ul>
          
          <p>A rising trend in escaped defects often signals the need for improved quality control measures.</p>
          
          <h2>5. Team Satisfaction</h2>
          
          <p>While more qualitative than the others, team satisfaction is perhaps the most important long-term metric. Regularly surveying your team about:</p>
          
          <ul>
            <li>Process effectiveness</li>
            <li>Work-life balance</li>
            <li>Clarity of goals and requirements</li>
            <li>Team dynamics</li>
          </ul>
          
          <p>Can help identify issues before they impact productivity or lead to turnover. Happy teams are productive teams!</p>`,
          categoryId: pmCategory?.id ?? null,
          featuredImage: "https://images.unsplash.com/photo-1572177812156-58036aae439c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
          tags: ["Project Management", "Metrics", "Agile", "Team Performance"],
          publishDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
          status: "published",
          userId: 1
        }
      ];
      
      for (const post of blogPostSamples) {
        await storage.createBlogPost(post);
      }
      
      console.log("Seeded blog posts data");
    }
    
    console.log("Database seeding completed successfully!");
    return { success: true };
  } catch (error) {
    console.error("Error seeding database:", error);
    return { success: false, error };
  }
}