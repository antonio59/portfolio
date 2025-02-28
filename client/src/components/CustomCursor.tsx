import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const updateCursorPosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };
    
    const addHoverClass = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isLink = target.tagName.toLowerCase() === 'a' || 
                    target.tagName.toLowerCase() === 'button' ||
                    target.closest('a') !== null ||
                    target.closest('button') !== null;
      
      setIsHovering(isLink);
    };
    
    const handleMouseLeave = () => {
      setIsVisible(false);
    };
    
    window.addEventListener('mousemove', updateCursorPosition);
    window.addEventListener('mouseover', addHoverClass);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', updateCursorPosition);
      window.removeEventListener('mouseover', addHoverClass);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);
  
  return (
    <>
      {/* Main cursor dot */}
      <motion.div
        className="fixed w-4 h-4 rounded-full bg-accentColor pointer-events-none mix-blend-difference z-50"
        animate={{
          x: position.x - 8,
          y: position.y - 8,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 350,
          mass: 0.35
        }}
      />
      
      {/* Outer cursor ring */}
      <motion.div
        className="fixed w-8 h-8 rounded-full border border-accentColor pointer-events-none mix-blend-difference z-50"
        animate={{
          x: position.x - 16, 
          y: position.y - 16,
          scale: isHovering ? 1.5 : 1,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          type: "spring",
          damping: 20,
          stiffness: 150,
          mass: 0.8,
          scale: {
            type: "spring",
            stiffness: 200,
            damping: 15
          }
        }}
      />
    </>
  );
}