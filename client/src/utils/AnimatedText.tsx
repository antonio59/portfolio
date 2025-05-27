import { motion } from "framer-motion";

interface AnimatedTextProps {
  words: string[];
  className?: string;
}

// Animation variants for the container
const containerVariants = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.04 * i },
  }),
};

// Animation variants for each word
const wordVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 12,
      stiffness: 100,
    },
  },
};

export default function AnimatedText({
  words,
  className = "",
}: AnimatedTextProps) {
  return (
    <motion.div
      className={`overflow-hidden inline-block ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          className="inline-block mr-2"
          variants={wordVariants}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}
