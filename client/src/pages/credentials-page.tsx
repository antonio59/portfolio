/**
 * Credentials Page - Professional Certifications & Training
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Award, Download, ExternalLink, Calendar, X, Eye } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { pb } from "@/lib/pocketbase";

interface Certification {
  id: string;
  name: string;
  title?: string;
  issuer: string;
  issue_date: string;
  credential_url?: string;
  description?: string;
  certificate_file?: string;
  collectionId?: string;
  collectionName?: string;
}

export default function CredentialsPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [viewingCert, setViewingCert] = useState<{url: string, name: string} | null>(null);

  // Fetch certifications
  const { data: certifications = [], isLoading } = useQuery({
    queryKey: ["all-certifications"],
    queryFn: async () => {
      const records = await pb.collection("certifications").getFullList<Certification>({
        sort: "-issue_date",
      });
      return records;
    },
  });

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        isMobileMenuOpen={isMobileMenuOpen}
        toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
              <Award className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-5xl font-bold mb-4">Credentials</h1>
            <p className="text-xl text-muted-foreground">
              Professional certifications and training programs that validate my expertise
            </p>
          </motion.div>

          {/* Certifications Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted rounded-lg h-64"></div>
                </div>
              ))}
            </div>
          ) : certifications.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-6">
                No certifications available yet.
              </p>
              <Button asChild>
                <Link href="/">← Back to Home</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {certifications.map((cert, index) => (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
                      {/* Decorative corner */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full" />
                      
                      <CardHeader className="relative">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Award className="h-6 w-6 text-primary" />
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {formatDate(cert.issue_date)}
                          </Badge>
                        </div>
                        
                        <CardTitle className="group-hover:text-primary transition-colors leading-snug">
                          {cert.name || cert.title}
                        </CardTitle>
                        {cert.issuer && (
                          <CardDescription className="mt-2 text-muted-foreground">
                            {cert.issuer}
                          </CardDescription>
                        )}
                      </CardHeader>

                      {cert.description && (
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {cert.description}
                          </p>
                        </CardContent>
                      )}

                      <CardFooter className="mt-auto flex gap-2">
                        {/* PocketBase file or external URL */}
                        {(cert.certificate_file || cert.credential_url) && (() => {
                          // Build PocketBase file URL if certificate_file exists
                          const fileUrl = cert.certificate_file 
                            ? `https://pb.antoniosmith.xyz/api/files/${cert.collectionId}/${cert.id}/${cert.certificate_file}`
                            : cert.credential_url;
                          
                          const isCredly = cert.credential_url?.includes('credly.com');
                          const isPDF = fileUrl?.endsWith('.pdf') || cert.certificate_file?.endsWith('.pdf');
                          const isImage = /\.(jpg|jpeg|png|webp)$/i.test(fileUrl || '');
                          
                          return (
                            <>
                              {/* View button for PDFs and images */}
                              {(isPDF || isImage) && cert.certificate_file && (
                                <Button 
                                  variant="default"
                                  className="flex-1"
                                  onClick={() => setViewingCert({ url: fileUrl!, name: cert.name || cert.title || 'Certificate' })}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                              )}
                              
                              {/* External link button */}
                              {(isCredly || !cert.certificate_file) && (
                                <Button 
                                  variant={cert.certificate_file ? "outline" : "default"}
                                  className="flex-1"
                                  asChild
                                >
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    {isCredly ? 'View Badge' : 'View Credential'}
                                  </a>
                                </Button>
                              )}
                            </>
                          );
                        })()}
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-muted/50 rounded-lg p-8 text-center"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <div className="text-4xl font-bold text-primary mb-2">
                      {certifications.length}
                    </div>
                    <div className="text-muted-foreground">
                      Professional Certifications
                    </div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-primary mb-2">
                      {new Set(certifications.map(c => c.issuer)).size}
                    </div>
                    <div className="text-muted-foreground">
                      Accredited Organizations
                    </div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-primary mb-2">
                      {new Date().getFullYear() - Math.min(...certifications.map(c => new Date(c.issue_date).getFullYear()))}+
                    </div>
                    <div className="text-muted-foreground">
                      Years of Continuous Learning
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Back Button */}
              <div className="text-center mt-12">
                <Button variant="outline" size="lg" asChild>
                  <Link href="/">← Back to Home</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />

      {/* Certificate Viewer Modal */}
      <Dialog open={!!viewingCert} onOpenChange={() => setViewingCert(null)}>
        <DialogContent className="max-w-7xl h-[95vh] p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-xl">{viewingCert?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden bg-muted/30" style={{ height: 'calc(95vh - 70px)' }}>
            {viewingCert && (
              <iframe
                src={viewingCert.url}
                className="w-full h-full border-0"
                title={viewingCert.name}
                style={{ display: 'block' }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
