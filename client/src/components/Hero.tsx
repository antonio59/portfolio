import { motion } from "framer-motion";
import AnimatedText from "../utils/AnimatedText";

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center bg-primaryBg py-20">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 order-2 lg:order-1">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-4 text-accentColor text-lg font-medium"
            >
              Hello, my name is
            </motion.div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-textColor mb-4">
              <AnimatedText
                words={["John", "Smith"]}
                className="text-4xl sm:text-5xl md:text-6xl font-bold"
              />
            </h1>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-600 mb-6">
              <AnimatedText
                words={["I", "build", "things", "for", "the", "web."]}
                className="text-3xl sm:text-4xl md:text-5xl font-bold"
              />
            </h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-gray-600 text-lg mb-8 max-w-xl"
            >
              I'm a software developer specializing in building exceptional digital experiences. 
              Currently, I'm focused on creating accessible, human-centered products that solve real-world problems.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="flex flex-wrap gap-4"
            >
              <a 
                href="#projects" 
                className="px-6 py-3 bg-accentColor text-white rounded hover:bg-highlightColor transition-colors duration-300"
              >
                View My Work
              </a>
              <a 
                href="#contact" 
                className="px-6 py-3 border border-accentColor text-accentColor rounded hover:bg-accentColor/10 transition-colors duration-300"
              >
                Contact Me
              </a>
            </motion.div>
          </div>
          
          <div className="lg:col-span-5 order-1 lg:order-2 flex justify-center lg:justify-end">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.8,
                type: "spring",
                stiffness: 100
              }}
              className="relative"
            >
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-accentColor to-highlightColor opacity-20 absolute blur-3xl"></div>
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-secondaryBg shadow-xl relative z-10">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80" 
                  alt="Portrait of John Smith"
                  className="w-full h-full object-cover"
                />
              </div>
              <motion.div 
                className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg p-4 z-20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                <div className="text-sm font-medium text-gray-600">Currently working on</div>
                <div className="text-textColor font-bold">Portfolio Website</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex items-center flex-col"
        >
          <span className="text-gray-600 text-sm mb-2">Scroll Down</span>
          <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center p-1">
            <motion.div 
              animate={{ 
                y: [0, 12, 0],
              }}
              transition={{ 
                repeat: Infinity,
                duration: 1.5,
              }}
              className="w-1.5 h-1.5 bg-gray-600 rounded-full"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}