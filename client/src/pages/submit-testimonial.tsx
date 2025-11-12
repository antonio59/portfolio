import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { submitTestimonial } from "@/lib/pocketbase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Star } from "lucide-react";

export default function SubmitTestimonial() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    company: "",
    content: "",
    rating: 5,
    project_type: "",
    relationship: "",
  });

  const submitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await submitTestimonial(data);
    },
    onSuccess: () => {
      toast({
        title: "Thank you!",
        description: "Your testimonial has been submitted for review.",
      });
      setFormData({
        name: "",
        email: "",
        role: "",
        company: "",
        content: "",
        rating: 5,
        project_type: "",
        relationship: "",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit testimonial. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  if (submitMutation.isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primaryBg px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md text-center"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
          <p className="text-gray-600 mb-6">
            Your testimonial has been submitted successfully and is pending review.
            Antonio will review and publish it shortly.
          </p>
          <Button onClick={() => window.location.href = "/"}>
            Back to Home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primaryBg px-6 py-20">
      <div className="container mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-4 text-center">Share Your Experience</h1>
          <p className="text-gray-600 text-center mb-8">
            Worked with Antonio? Share your experience and help others understand the value
            of our collaboration.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Your Role <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Senior Developer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Company <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Tech Corp"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Project Type
              </label>
              <Input
                value={formData.project_type}
                onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
                placeholder="Web Development, Mobile App, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Working Relationship <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select...</option>
                <option value="colleague">Colleague</option>
                <option value="client">Client</option>
                <option value="manager">Manager</option>
                <option value="team_member">Team Member</option>
                <option value="stakeholder">Stakeholder</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= formData.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Your Testimonial <span className="text-red-500">*</span>
              </label>
              <Textarea
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Share your experience working with Antonio..."
                rows={6}
                minLength={50}
              />
              <p className="text-sm text-gray-500 mt-2">
                Minimum 50 characters. Please be specific about the project and results.
              </p>
            </div>

            <Button
              type="submit"
              disabled={submitMutation.isPending}
              className="w-full"
            >
              {submitMutation.isPending ? "Submitting..." : "Submit Testimonial"}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Your testimonial will be reviewed before being published on the website.
              We respect your privacy and will not share your email publicly.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
