import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";

interface Certification {
  id: number;
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string | null;
  credentialID?: string | null;
  credentialURL?: string | null;
  description: string;
  skills: string[];
  featured: boolean;
  imageUrl?: string | null;
}

export default function Certifications() {
  // Use React Query to fetch certifications with explicit debugging
  const { 
    data: certifications = [], 
    isLoading, 
    error,
    status,
    fetchStatus
  } = useQuery<Certification[]>({
    queryKey: ["/api/certifications"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2, // Add retry attempts
    refetchOnMount: true, // Force a refetch when the component mounts
  });
  
  console.log("Certifications Query Status:", { status, fetchStatus });
  console.log("Certifications data:", certifications);
  console.log("Error fetching certifications:", error);
  
  // Make a direct fetch to debug
  useEffect(() => {
    const debugFetch = async () => {
      try {
        console.log("Attempting direct fetch of certifications...");
        const response = await fetch("/api/certifications");
        console.log("Direct fetch status:", response.status);
        const data = await response.json();
        console.log("Direct fetch result:", data);
      } catch (err) {
        console.error("Direct fetch error:", err);
      }
    };
    
    debugFetch();
  }, []);
  
  // Get only featured certifications for display
  const featuredCertifications = certifications.filter((cert: Certification) => cert.featured);
  console.log("Featured certifications:", featuredCertifications);
  
  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50" id="certifications">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Professional Certifications</h2>
          <div className="flex justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }
  
  if (error) {
    return (
      <section className="py-16 bg-gray-50" id="certifications">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Professional Certifications</h2>
          <p className="text-center text-red-500">Failed to load certifications</p>
        </div>
      </section>
    );
  }
  
  // Always render the section, even if there are no featured certifications
  // This helps with debugging
  
  return (
    <section className="py-16 bg-gray-50" id="certifications">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-center mb-4">Professional Certifications</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Industry qualifications and credentials that validate my expertise and knowledge in project management and technical domains.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCertifications.length > 0 ? (
            featuredCertifications.map((certification: Certification, index: number) => (
              <motion.div
                key={certification.id}
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
                {/* Removed image section as requested */}
                
                <div className="p-8">
                  <h3 className={`text-2xl font-bold mb-3 transition-colors duration-300 ${
                    index % 5 === 0 ? "text-blue-700 group-hover:text-blue-800" : 
                    index % 5 === 1 ? "text-green-700 group-hover:text-green-800" : 
                    index % 5 === 2 ? "text-purple-700 group-hover:text-purple-800" : 
                    index % 5 === 3 ? "text-amber-700 group-hover:text-amber-800" : 
                    "text-cyan-700 group-hover:text-cyan-800"
                  }`}>{certification.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {certification.issuer} • Issued: {certification.issueDate}
                    {certification.expiryDate && <span> • Expires: {certification.expiryDate}</span>}
                  </p>
                  
                  <p className="text-gray-700 mb-4">{certification.description}</p>
                  
                  {Array.isArray(certification.skills) && certification.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {certification.skills.map((skill: string, i: number) => {
                        // Rotate through different color schemes for the badges
                        const colorSchemes = [
                          "bg-blue-50 text-blue-700 border-blue-200",
                          "bg-green-50 text-green-700 border-green-200",
                          "bg-purple-50 text-purple-700 border-purple-200",
                          "bg-amber-50 text-amber-700 border-amber-200",
                          "bg-cyan-50 text-cyan-700 border-cyan-200"
                        ];
                        const colorScheme = colorSchemes[i % colorSchemes.length];
                        
                        return (
                          <Badge key={i} variant="outline" className={colorScheme}>
                            {skill}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                  
                  {certification.credentialURL && (
                    <a 
                      href={certification.credentialURL} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-block mt-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Verify Credential →
                    </a>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-3 py-12 text-center">
              <p className="text-lg text-gray-600">
                No certifications found. Certifications will appear here once added.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Total certifications: {certifications.length}, Featured: {certifications.filter(c => c.featured).length}
              </p>
              <button 
                onClick={async () => {
                  try {
                    console.log("Triggering data sync...");
                    const response = await fetch("/api/admin/sync-data", {
                      method: "POST",
                      headers: { 'Content-Type': 'application/json' }
                    });
                    const result = await response.json();
                    console.log("Sync result:", result);
                    // Invalidate the cache and trigger a refetch
                    window.location.reload();
                  } catch (err) {
                    console.error("Sync error:", err);
                  }
                }}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Load Sample Data
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}