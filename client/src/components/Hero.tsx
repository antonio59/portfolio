import { motion } from "framer-motion";
import AnimatedText from "../utils/AnimatedText";

export default function Hero() {
  const rotatingWords = ["experiences", "interfaces", "products", "solutions"];

  return (
    <section id="hero" className="min-h-screen flex flex-col justify-center pt-24 pb-16">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-start max-w-4xl">
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <span className="block text-textColor">Creative developer crafting digital</span>
            <AnimatedText 
              words={rotatingWords} 
              className="block text-accent mt-2" 
            />
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl mb-10 max-w-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            I specialize in building exceptional digital experiences that seamlessly blend innovative design with cutting-edge development.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <a 
              href="#work" 
              className="px-8 py-3 bg-highlight text-white rounded hover:bg-accent transition-colors duration-300 inline-flex items-center"
            >
              View My Work
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </a>
            <a 
              href="#contact" 
              className="px-8 py-3 border border-textColor rounded hover:bg-secondary transition-colors duration-300"
            >
              Get In Touch
            </a>
          </motion.div>
        </div>
      </div>
      
      <div className="container mx-auto px-6 mt-auto">
        <motion.div 
          className="flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <div className="w-24 h-px bg-textColor/30 mr-4"></div>
          <p className="text-sm text-textColor/60">Scroll to explore</p>
        </motion.div>
      </div>
    </section>
  );
}
