// ... (previous imports and code remain the same)

  // Update a blog post (admin only)
  expressApp.put(
    "/api/admin/blog/posts/:id(\\d+)",
    isAuthenticated,
    async (req: Request, res: Response): Promise<void> => {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Not authenticated" });
        return;
      }

      try {
        const id = parseInt(req.params["id"], 10);
        const updateSchema = z.object({
          title: z.string().min(1, "Title is required").optional(),
          content: z.string().min(1, "Content is required").optional(),
          excerpt: z.string().optional(),
          slug: z.string().min(1, "Slug is required").optional(),
          published: z.boolean().optional(),
          publishedAt: z.date().optional(),
          categoryId: z.number().int().positive().optional(),
          tags: z.array(z.string()).optional(),
          featuredImage: z.string().optional(),
          metaTitle: z.string().optional(),
          metaDescription: z.string().optional(),
        });

        const validatedData = updateSchema.parse(req.body);
        const updatedPost = await storage.updateBlogPost(id, validatedData);

        if (!updatedPost) {
          res.status(404).json({ success: false, message: "Post not found" });
          return;
        }

        res.status(200).json({ success: true, data: updatedPost });
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json({
            success: false,
            message: "Validation error",
            errors: error.errors,
          });
          return;
        }

        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        logger.error("Error updating blog post: %s", errorMessage);
        res.status(500).json({
          success: false,
          message: "Error updating blog post",
        });
      }
    },
  );

// ... (rest of the file remains the same)
