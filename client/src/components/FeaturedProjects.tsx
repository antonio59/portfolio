/**
 * Featured Projects Section for Homepage
 * Shows only featured projects from PocketBase
 */

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ExternalLink, Github, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { pb } from "@/lib/pocketbase";

interface Project {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  project_url?: string;
  github_url?: string;
  technologies?: string;
  is_featured?: boolean;
}

export default function FeaturedProjects() {
  // Fetch only featured projects
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["featured-projects"],
    queryFn: async () => {
      const records = await pb.collection("projects").getFullList<Project>({
        filter: "is_featured = true",
        sort: "-created",
      });
      return records;
    },
  });

  return (
    <section id="projects" className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Featured Projects</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A selection of my favorite projects I've worked on
          </p>
        </motion.div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg h-64"></div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-6">
              No featured projects yet. Check back soon!
            </p>
            <Button asChild>
              <Link href="/projects">View All Projects</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {projects.slice(0, 3).map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                    {project.image_url && (
                      <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                        <img
                          src={project.image_url}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {project.title}
                      </CardTitle>
                      <CardDescription
                        className="line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: project.description }}
                      />
                    </CardHeader>
                    <CardContent>
                      {project.technologies && (
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.split(",").slice(0, 4).map((tech, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {tech.trim()}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      {project.project_url && (
                        <Button variant="default" size="sm" asChild>
                          <a
                            href={project.project_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Demo
                          </a>
                        </Button>
                      )}
                      {project.github_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Github className="h-4 w-4 mr-1" />
                            Code
                          </a>
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* View All Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Button size="lg" variant="outline" asChild>
                <Link href="/projects" className="group">
                  View All Projects
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}
