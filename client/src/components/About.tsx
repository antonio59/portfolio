import { motion } from "framer-motion";

export default function About() {
  const containerAnimation = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };
  
  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section id="about" className="py-24 bg-secondary">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="aspect-w-4 aspect-h-5 relative z-10">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="John Doe portrait"
                className="object-cover w-full h-full rounded-lg shadow-lg"
              />
            </div>
            <div className="absolute top-6 right-6 -z-0 w-full h-full bg-accent/10 rounded-lg"></div>
          </motion.div>
          
          <div>
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              About Me
            </motion.h2>
            
            <motion.p 
              className="text-lg mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              I'm a passionate creative developer with over 8 years of experience, focused on crafting engaging digital experiences that merge design and technology.
            </motion.p>
            
            <motion.p 
              className="text-lg mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              My approach combines strategic thinking, user-centered design, and technical expertise to create solutions that are not only visually stunning but also functionally robust.
            </motion.p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 mb-8">
              <motion.div
                variants={containerAnimation}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
              >
                <h3 className="text-xl font-semibold mb-3">Skills</h3>
                <ul className="space-y-2">
                  <motion.li className="flex items-center" variants={itemAnimation}>
                    <span className="w-2 h-2 bg-accent rounded-full mr-2"></span>
                    UI/UX Design
                  </motion.li>
                  <motion.li className="flex items-center" variants={itemAnimation}>
                    <span className="w-2 h-2 bg-accent rounded-full mr-2"></span>
                    Frontend Development
                  </motion.li>
                  <motion.li className="flex items-center" variants={itemAnimation}>
                    <span className="w-2 h-2 bg-accent rounded-full mr-2"></span>
                    Interactive Prototyping
                  </motion.li>
                  <motion.li className="flex items-center" variants={itemAnimation}>
                    <span className="w-2 h-2 bg-accent rounded-full mr-2"></span>
                    Design Systems
                  </motion.li>
                </ul>
              </motion.div>
              
              <motion.div
                variants={containerAnimation}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
              >
                <h3 className="text-xl font-semibold mb-3">Tools & Technologies</h3>
                <ul className="space-y-2">
                  <motion.li className="flex items-center" variants={itemAnimation}>
                    <span className="w-2 h-2 bg-accent rounded-full mr-2"></span>
                    Figma, Adobe Suite
                  </motion.li>
                  <motion.li className="flex items-center" variants={itemAnimation}>
                    <span className="w-2 h-2 bg-accent rounded-full mr-2"></span>
                    React, Vue, Angular
                  </motion.li>
                  <motion.li className="flex items-center" variants={itemAnimation}>
                    <span className="w-2 h-2 bg-accent rounded-full mr-2"></span>
                    GSAP, Three.js
                  </motion.li>
                  <motion.li className="flex items-center" variants={itemAnimation}>
                    <span className="w-2 h-2 bg-accent rounded-full mr-2"></span>
                    Node.js, Express
                  </motion.li>
                </ul>
              </motion.div>
            </div>
            
            <motion.a 
              href="#contact" 
              className="inline-flex items-center px-8 py-3 bg-highlight text-white rounded hover:bg-accent transition-colors duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true, margin: "-100px" }}
              whileHover={{ x: 5 }}
            >
              Let's Connect
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </motion.a>
          </div>
        </div>
      </div>
    </section>
  );
}
