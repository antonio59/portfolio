/**
 * Resume Section - Simple download link
 */

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FileText, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pb } from "@/lib/pocketbase";

export default function Resume() {
  // Fetch profile with resume URL
  const { data: profile } = useQuery({
    queryKey: ["profile-resume"],
    queryFn: async () => {
      const records = await pb.collection("profiles").getFullList();
      return records[0] || null;
    },
  });

  // Build resume URL
  const resumeUrl = (profile as any)?.resume_file
    ? `https://pb.antoniosmith.xyz/api/files/${(profile as any).collectionId}/${(profile as any).id}/${(profile as any).resume_file}`
    : (profile as any)?.resume_url;

  if (!resumeUrl) return null;

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
            <FileText className="h-10 w-10 text-primary" />
          </div>

          {/* Heading */}
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Resume</h2>
          <p className="text-xl text-muted-foreground mb-8">
            View my complete professional background and experience
          </p>

          {/* Download Button */}
          <Button size="lg" className="text-lg px-8 py-6" asChild>
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="mr-2 h-5 w-5" />
              Download Resume
            </a>
          </Button>

          {/* Optional: Add alternative text link */}
          <p className="mt-4 text-sm text-muted-foreground">
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-primary transition-colors"
            >
              View in browser
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
