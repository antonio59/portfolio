import { motion } from "framer-motion";
import AnimatedText from "../utils/AnimatedText";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/firebaseConfig";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import React from "react"; // Import React for fragment <>

// Define interface for Hero section data from Firestore
interface HeroSectionData {
  id?: string; // Firestore ID
  title: string;
  subtitle?: string; // The tagline like "I build things..."
  content: string[]; // The main paragraph(s)
  // Add other fields if needed (e.g., button text/links)
  greeting?: string; // e.g., "Hello, my name is"
  name?: string; // e.g., "John Smith" (might need splitting for AnimatedText)
}

export default function Hero() {
  // Fetch Hero section data
  const fetchHeroData = async (): Promise<HeroSectionData | null> => {
    // Query the top-level 'hero' collection directly
    const heroCollectionRef = collection(db, "hero");
    // Fetch all documents (usually only one) and limit on the client side if needed,
    // or assume only one document exists. Firestore doesn't guarantee order without orderBy.
    const querySnapshot = await getDocs(query(heroCollectionRef, limit(1))); // Fetch max 1 doc
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      // Ensure content is an array of strings
      const data = docSnap.data();
      const contentArray = Array.isArray(data.content) ? data.content : [String(data.content)];
      return { id: docSnap.id, ...data, content: contentArray } as HeroSectionData;
    } else {
      console.warn("Hero section data not found in Firestore.");
      return null; // Return null if no hero section found
    }
  };

  const { data: heroData, isLoading, error } = useQuery<HeroSectionData | null>({
    queryKey: ["section-hero"],
    queryFn: fetchHeroData,
  });

  // Handle loading and error states
  if (isLoading) {
    return <section className="min-h-screen flex items-center justify-center bg-primaryBg py-20">Loading Hero...</section>;
  }

  if (error || !heroData) {
     // Fallback or minimal display if data fails to load
     // You might want a more robust fallback based on your design
    return (
       <section className="min-h-screen flex items-center bg-primaryBg py-20">
         <div className="container mx-auto px-6 text-center">
           <h1 className="text-4xl font-bold text-textColor">Welcome</h1>
           <p className="text-gray-600">Content loading...</p>
         </div>
       </section>
    );
  }

  // Prepare data for AnimatedText (assuming name is stored as a single string)
  const nameWords = heroData.name ? heroData.name.split(' ') : ["Your", "Name"];
  // Assuming subtitle is the tagline "I build things..."
  const taglineWords = heroData.subtitle ? heroData.subtitle.split(' ') : ["Tagline", "Here"];
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
            {heroData.greeting || "Hello, my name is"} {/* Use fetched data or fallback */}
          </motion.div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-textColor mb-4">
            <AnimatedText
              // @ts-ignore - Temporarily ignore persistent TS error
              words={nameWords}
              className="text-4xl sm:text-5xl md:text-6xl font-bold"
            />
          </h1>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-600 mb-6">
            <AnimatedText
              // @ts-ignore - Temporarily ignore persistent TS error
              words={taglineWords}
              className="text-3xl sm:text-4xl md:text-5xl font-bold"
            />
          </h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-gray-600 text-lg mb-8 mx-auto"
          >
            {/* Join content array into a single paragraph or map over it */}
            {heroData.content.join(" ")}
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
              {/* TODO: Make button text dynamic if stored */}
              View My Work
            </a>
            <a 
              href="#contact" 
              className="px-6 py-3 border border-accentColor text-accentColor rounded hover:bg-accentColor/10 transition-colors duration-300"
            >
              {/* TODO: Make button text dynamic if stored */}
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
          <span className="text-gray-600 text-sm mb-2">{/* TODO: Make dynamic? */}Scroll Down</span>
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