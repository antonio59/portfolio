import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/firebaseConfig";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import React from "react"; // Import React for fragment <>

// Define interface for About section data from Firestore
interface AboutSectionData {
  id?: string;
  title: string; // e.g., "About Me"
  subtitle?: string; // Not currently used in this component's display
  content: string[]; // Paragraphs
  imageUrl?: string;
  imageAlt?: string;
  professionalSkills?: string[];
  technicalSkills?: string[];
}

export default function About() {
  // Fetch About section data
  const fetchAboutData = async (): Promise<AboutSectionData | null> => {
    // Query the top-level 'about' collection directly
    const aboutCollectionRef = collection(db, "about");
    // Fetch max 1 doc from the 'about' collection
    const querySnapshot = await getDocs(query(aboutCollectionRef, limit(1)));
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      const data = docSnap.data();
      // Ensure content and skills are arrays
      const contentArray = Array.isArray(data.content) ? data.content : [String(data.content)];
      const profSkills = Array.isArray(data.professionalSkills) ? data.professionalSkills : [];
      const techSkills = Array.isArray(data.technicalSkills) ? data.technicalSkills : [];
      return {
        id: docSnap.id,
        ...data,
        content: contentArray,
        professionalSkills: profSkills,
        technicalSkills: techSkills
      } as AboutSectionData;
    } else {
      console.warn("About section data not found in Firestore.");
      return null;
    }
  };

  const { data: aboutData, isLoading, error } = useQuery<AboutSectionData | null>({
    queryKey: ["section-about"],
    queryFn: fetchAboutData,
  });

  // Removed hardcoded skill arrays - will fetch from aboutData
  
  // Handle loading and error states
  if (isLoading) {
    return <section id="about" className="py-20 bg-primaryBg text-center">Loading About section...</section>;
  }

  // Basic error display or fallback content
  if (error || !aboutData) {
    return (
       <section id="about" className="py-20 bg-primaryBg text-center">
         <p className="text-red-500">Could not load About section data.</p>
         {/* Optionally render some default static content here */}
       </section>
    );
  }

  // Use fetched data
  const professionalSkills = aboutData.professionalSkills || [];
  const technicalSkills = aboutData.technicalSkills || [];
  const paragraphs = aboutData.content || [];

  return (
    <section id="about" className="py-20 bg-primaryBg">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Image Section */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="w-full h-[450px] bg-secondaryBg rounded-lg overflow-hidden shadow-lg relative z-10">
              <img 
                src={aboutData.imageUrl || "https://via.placeholder.com/755x450"} // Use fetched URL or placeholder
                alt={aboutData.imageAlt || "About section image"} // Use fetched alt text
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-[80%] h-[80%] border-2 border-accentColor rounded-lg z-0"></div>
          </motion.div>
          
          {/* Text Content */}
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-textColor">{aboutData.title || "About Me"}</h2>
              {/* Map over fetched content paragraphs */}
              {paragraphs.map((text, index) => (
                <p key={index} className="text-gray-600 mb-6">
                  {text}
                </p>
              ))}
            </motion.div>
            
            {/* Skills Section - Removed staggering motion container */}
            <div className="mt-8"> 
              {/* Removed Fragment wrapper as it's not needed with regular div */}
              <h3 className="text-xl font-semibold mb-4 text-textColor">Professional Skills</h3>
              <div className="flex flex-wrap gap-3 mb-6">
                {professionalSkills.map((skill, index) => (
                  // Use regular span instead of motion.span
                  <span 
                    key={index}
                    className="px-4 py-2 rounded-full bg-white shadow-sm border border-gray-200 text-gray-700 text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              
              <h3 className="text-xl font-semibold mb-4 text-textColor mt-8">Technical Skills (Hobby Development)</h3>
              <div className="flex flex-wrap gap-3">
                {technicalSkills.map((skill, index) => (
                  // Use regular span instead of motion.span
                  <span 
                    key={index}
                    className="px-4 py-2 rounded-full bg-white shadow-sm border border-accentColor/20 text-gray-700 text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div> 
          </div>
        </div>
      </div>
    </section>
  );
}