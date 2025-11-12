import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Star, Quote } from "lucide-react";
import { Button } from "./ui/button";
import { getTestimonials, type Testimonial } from "../lib/pocketbase";

export default function Testimonials() {
  const { data: testimonials = [], isLoading } = useQuery<Testimonial[]>({
    queryKey: ["testimonials"],
    queryFn: getTestimonials,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <section id="testimonials" className="py-20 bg-secondaryBg">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="testimonials" className="py-20 bg-secondaryBg">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-textColor">
            Client Testimonials
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Don't just take my word for it. Here's what people I've worked with have to say.
          </p>
        </motion.div>

        {testimonials.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center py-12"
          >
            <Quote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-6">No testimonials yet. Be the first!</p>
            <Button onClick={() => window.location.href = "/testimonial"}>
              Share Your Experience
            </Button>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex items-center mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{testimonial.name}</h3>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                      <p className="text-sm text-accentColor">{testimonial.company}</p>
                    </div>
                    <Quote className="w-8 h-8 text-accentColor opacity-20" />
                  </div>

                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < testimonial.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-gray-700 italic mb-4">"{testimonial.content}"</p>

                  {testimonial.project_type && (
                    <p className="text-xs text-gray-500">
                      Project: {testimonial.project_type}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <p className="text-gray-600 mb-4">
                Worked with me? I'd love to hear your feedback!
              </p>
              <Button onClick={() => window.location.href = "/testimonial"}>
                Share Your Experience
              </Button>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}
