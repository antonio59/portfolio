import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/firebaseConfig";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import React from "react";
import { Badge } from "@/components/ui/badge"; // Import Badge component

// Define combined type matching Firestore structure
interface EducationCertItem {
  id: string; 
  type: 'education' | 'certification' | 'badge'; 
  title: string; 
  institution: string; 
  period?: string | null; 
  issueDate?: string | null; 
  expiryDate?: string | null; 
  description?: string | null; 
  skills?: string[] | null; 
  credentialID?: string | null; 
  credentialURL?: string | null; 
  imageUrl?: string | null; 
  featured?: boolean | null; // Keep featured if needed for filtering/styling
  order?: number; 
}

// Define Firestore collection reference
const educationCertCollectionRef = collection(db, "educationAndCerts");

export default function EducationAndCerts() {
  // Fetch ALL items, order by type then order
  const fetchItems = async (): Promise<EducationCertItem[]> => {
    const q = query(educationCertCollectionRef, orderBy("type"), orderBy("order", "asc"));
    console.log("Executing Firestore query for educationAndCerts...");
    const querySnapshot = await getDocs(q);
    console.log(`Query snapshot empty: ${querySnapshot.empty}, size: ${querySnapshot.size}`);
    return querySnapshot.docs.map((doc, index) => {
       console.log(`Mapping doc ${index + 1}/${querySnapshot.size}: ID = ${doc.id}`);
       const data = doc.data();
       console.log("Raw data:", data);
       return {
         id: doc.id,
         type: data.type || 'education', 
         title: data.title || "",
         institution: data.institution || "",
         period: data.period || null,
         issueDate: data.issueDate || null,
         expiryDate: data.expiryDate || null,
         description: data.description || null,
         skills: Array.isArray(data.skills) ? data.skills : null,
         credentialID: data.credentialID || null,
         credentialURL: data.credentialURL || null,
         imageUrl: data.imageUrl || null,
         featured: typeof data.featured === 'boolean' ? data.featured : null,
         order: typeof data.order === 'number' ? data.order : 1,
       } as EducationCertItem; 
    });
  };

  const { data: items = [], isLoading, error } = useQuery<EducationCertItem[]>({
    queryKey: ["educationAndCerts-public"],
    queryFn: fetchItems,
    staleTime: 10 * 60 * 1000,
    // Remove deprecated onSuccess/onError
  });

  // Separate items by type for potential different rendering sections
  const educationItems = items.filter(item => item.type === 'education');
  const certificationItems = items.filter(item => item.type === 'certification');
  const badgeItems = items.filter(item => item.type === 'badge');

  // Log filtered items
  console.log("Filtered Education:", educationItems);
  console.log("Filtered Certifications:", certificationItems);
  console.log("Filtered Badges:", badgeItems);

  // --- Render Logic ---

  if (isLoading) {
    return <section id="education-certs" className="py-16 bg-gray-50 text-center">Loading Education & Certifications...</section>;
  }

  if (error) {
    return <section id="education-certs" className="py-16 bg-gray-50 text-center"><p className="text-red-500">Failed to load data.</p></section>;
  }

  return (
    <section id="education-certs" className="pt-16 pb-20 bg-gray-50 shadow-inner relative">
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-b from-transparent to-gray-100"></div>
      <div className="container mx-auto px-4 relative z-10">
        
        {/* Combined Title - Or fetch from 'sections' collection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-4">Education & Certifications</h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto">
            My academic qualifications, industry credentials, and recognized badges demonstrating continuous learning and expertise.
          </p>
        </motion.div>

        {/* Certifications Section (Similar to previous Certifications.tsx) */}
        {certificationItems.length > 0 && (
          <div className="mb-16">
             <h3 className="text-2xl font-semibold text-center mb-10 text-gray-800">Professional Certifications</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {certificationItems.map((cert, index) => (
                 <motion.div
                   key={cert.id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.5, delay: index * 0.1 }}
                   className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px] border border-gray-100 relative before:absolute before:top-0 before:left-0 before:right-0 before:h-2 group ${
                     index % 5 === 0 ? "before:bg-blue-600" : 
                     index % 5 === 1 ? "before:bg-green-600" : 
                     index % 5 === 2 ? "before:bg-purple-600" : 
                     index % 5 === 3 ? "before:bg-amber-600" : 
                     "before:bg-cyan-600"
                   }`}
                 >
                   <div className="p-6">
                     <h4 className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                       index % 5 === 0 ? "text-blue-700 group-hover:text-blue-800" : 
                       index % 5 === 1 ? "text-green-700 group-hover:text-green-800" : 
                       index % 5 === 2 ? "text-purple-700 group-hover:text-purple-800" : 
                       index % 5 === 3 ? "text-amber-700 group-hover:text-amber-800" : 
                       "text-cyan-700 group-hover:text-cyan-800"
                     }`}>{cert.title}</h4>
                     <p className="text-gray-600 text-xs mb-3">
                       {cert.institution}
                       {cert.issueDate && ` • Issued: ${cert.issueDate}`}
                       {cert.expiryDate && ` • Expires: ${cert.expiryDate}`}
                     </p>
                     {cert.description && <p className="text-gray-700 text-sm mb-4">{cert.description}</p>}
                     {cert.skills && cert.skills.length > 0 && (
                       <div className="flex flex-wrap gap-1 mb-4">
                         {cert.skills.map((skill: string, i: number) => (
                           <Badge key={i} variant="secondary" className="text-xs">
                             {skill}
                           </Badge>
                         ))}
                       </div>
                     )}
                     {cert.credentialURL && (
                       <a href={cert.credentialURL} target="_blank" rel="noopener noreferrer" className="inline-block mt-1 text-blue-600 hover:text-blue-800 font-medium text-xs">
                         Verify Credential {cert.credentialID ? `(${cert.credentialID})` : ''} →
                       </a>
                     )}
                   </div>
                 </motion.div>
               ))}
             </div>
          </div>
        )}

        {/* Education Section */}
        {educationItems.length > 0 && (
          <div className="mb-16">
             <h3 className="text-2xl font-semibold text-center mb-10 text-gray-800">Formal Education</h3>
             <div className="space-y-6 max-w-3xl mx-auto">
               {educationItems.map((edu, index) => (
                 <motion.div
                   key={edu.id}
                   initial={{ opacity: 0, x: -20 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   transition={{ duration: 0.5, delay: index * 0.15 }}
                   viewport={{ once: true }}
                   className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
                 >
                    <h4 className="text-lg font-semibold text-gray-900">{edu.title}</h4>
                    <p className="text-sm text-gray-600 mb-1">{edu.institution} • {edu.period}</p>
                    {edu.description && <p className="text-sm text-gray-700">{edu.description}</p>}
                 </motion.div>
               ))}
             </div>
          </div>
        )}

        {/* Badges Section */}
        {badgeItems.length > 0 && (
          <div>
             <h3 className="text-2xl font-semibold text-center mb-10 text-gray-800">Digital Badges</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
               {badgeItems.map((badge, index) => (
                 <motion.div
                   key={badge.id}
                   initial={{ opacity: 0, scale: 0.9 }}
                   whileInView={{ opacity: 1, scale: 1 }}
                   transition={{ duration: 0.4, delay: index * 0.1 }}
                   viewport={{ once: true }}
                   className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center flex flex-col items-center"
                 >
                    {badge.imageUrl && (
                      <img src={badge.imageUrl} alt={`${badge.title} badge`} className="h-24 w-24 mb-3 object-contain"/>
                    )}
                    <h4 className="text-md font-semibold text-gray-900 mb-1">{badge.title}</h4>
                    <p className="text-xs text-gray-500 mb-2">{badge.institution}</p>
                    {badge.issueDate && <p className="text-xs text-gray-500">Issued: {badge.issueDate}</p>}
                    {badge.credentialURL && (
                       <a href={badge.credentialURL} target="_blank" rel="noopener noreferrer" className="mt-2 text-blue-600 hover:underline text-xs">
                         View Badge
                       </a>
                     )}
                 </motion.div>
               ))}
             </div>
          </div>
        )}

        {/* Fallback if no items exist at all */}
        {items.length === 0 && !isLoading && (
           <div className="col-span-full py-12 text-center">
              <p className="text-lg text-gray-600">No education, certifications, or badges found.</p>
           </div>
        )}

      </div>
    </section>
  );
}