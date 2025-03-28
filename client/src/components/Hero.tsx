import { motion } from "framer-motion";
import AnimatedText from "../utils/AnimatedText";

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center bg-primaryBg py-20">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
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
            className="text-gray-600 text-lg mb-8 mx-auto"
          >
            I'm a software developer specializing in building exceptional digital experiences. 
            Currently, I'm focused on creating accessible, human-centered products that solve real-world problems.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="flex flex-wrap gap-4 justify-center"
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