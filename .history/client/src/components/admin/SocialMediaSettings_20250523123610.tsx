import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm, type SubmitHandler, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, Twitter, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define the schema for social media settings
const socialMediaSchema = z.object({
  twitter: z.object({
    enabled: z.boolean().default(false),
    apiKey: z.string().optional(),
    apiSecret: z.string().optional(),
    accessToken: z.string().optional(),
    accessTokenSecret: z.string().optional(),
  }),
  bluesky: z.object({
    enabled: z.boolean().default(false),
    identifier: z.string().optional(),
    password: z.string().optional(),
  }),
  defaultFormat: z.string().min(1, "Post format template is required"),
  includeTags: z.boolean().default(true),
  includeImage: z.boolean().default(true),
  baseUrl: z.string().url("Must be a valid URL"),
});

type SocialMediaSettings = z.infer<typeof socialMediaSchema>;

export default function SocialMediaSettings() {
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<{
    twitter?: { success: boolean; message?: string };
    bluesky?: { success: boolean; message?: string };
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Fetch current settings
  const { data: settings, isLoading } = useQuery<SocialMediaSettings>({
    queryKey: ["/api/admin/social-media/config"],
    refetchOnWindowFocus: false,
  });

  // Initialize form with default values
  const form = useForm<SocialMediaSettings>({
    // @ts-expect-error - Type compatibility issue between react-hook-form and zod
    resolver: zodResolver(socialMediaSchema),
    defaultValues: {
      twitter: {
        enabled: false,
        apiKey: "",
        apiSecret: "",
        accessToken: "",
        accessTokenSecret: "",
      },
      bluesky: {
        enabled: false,
        identifier: "",
        password: "",
      },
      defaultFormat: "{title}\\n\\n{excerpt}\\n\\nRead more: {url}",
      includeTags: true,
      includeImage: true,
      baseUrl: "https://antoniosmith.me/blog/",
    },
  });

  // Update form when settings are fetched
  useEffect(() => {
    if (settings) {
      const formValues = {
        ...form.getValues(),
        ...settings,
      };

      form.reset(formValues);
    }
  }, [settings, form]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: SocialMediaSettings) => {
      return apiRequest("/api/admin/social-media/config", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Your social media settings have been saved successfully.",
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/social-media/config"],
      });
    },
    onError: (error) => {
      logger.error("Failed to save social media settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Test connection mutation
  const testMutation = useMutation({
    mutationFn: async (data: SocialMediaSettings) => {
      return apiRequest("/api/admin/social-media/test", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      setTestResults(data);
      toast({
        title: "Test completed",
        description: "Connection test completed. Check results above.",
      });
    },
    onError: (error) => {
      logger.error("Failed to test social media connections:", error);
      toast({
        title: "Error",
        description: "Failed to test connections. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit: SubmitHandler<SocialMediaSettings> = async (data) => {
    try {
      await saveMutation.mutateAsync(data);
    } catch (error) {
      logger.error("Error saving settings:", error);
    }
  };

  const handleTestConnection = async () => {
    try {
      setIsTesting(true);
      const currentSettings = form.getValues();
      await testMutation.mutateAsync(currentSettings);
    } catch (error) {
      logger.error("Error testing connection:", error);
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return <div>Loading settings...</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Social Media Integration</CardTitle>
        <CardDescription>
          Configure settings for automatically posting new blog content to
          social media platforms
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
              {/* Twitter Configuration */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium flex items-center">
                      <Twitter className="mr-2 h-5 w-5 text-[#1DA1F2]" />
                      Twitter Integration
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Configure Twitter API credentials to auto-post new blog
                      content
                    </p>
                  </div>
                  <FormField
                    control={form.control}
                    name="twitter.enabled"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch("twitter.enabled") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                    <FormField
                      control={form.control}
                      name="twitter.apiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Key</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Twitter API Key" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="twitter.apiSecret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Secret</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              placeholder="Twitter API Secret"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="twitter.accessToken"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Access Token</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Twitter Access Token"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="twitter.accessTokenSecret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Access Token Secret</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              placeholder="Twitter Access Token Secret"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* Bluesky Configuration */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium flex items-center">
                      <span className="mr-2 h-5 w-5 text-[#0085FF] font-bold">
                        𝕬
                      </span>
                      Bluesky Integration
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Configure Bluesky credentials to auto-post new blog
                      content
                    </p>
                  </div>
                  <FormField
                    control={form.control}
                    name="bluesky.enabled"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch("bluesky.enabled") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                    <FormField
                      control={form.control}
                      name="bluesky.identifier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Identifier</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Bluesky handle or email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bluesky.password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password/App Password</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              placeholder="Bluesky password"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* General Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Post Settings</h3>

                <FormField
                  control={form.control}
                  name="defaultFormat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Post Format Template</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Post format template" />
                      </FormControl>
                      <FormDescription>
                        Use {"{title}"}, {"{excerpt}"}, and {"{url}"} as
                        placeholders
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="includeTags"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Include Tags
                          </FormLabel>
                          <FormDescription>
                            Add post tags to social media posts
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="includeImage"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Include Featured Image
                          </FormLabel>
                          <FormDescription>
                            Add featured image to social media posts
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="baseUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blog Base URL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="https://example.com/blog/"
                        />
                      </FormControl>
                      <FormDescription>
                        The base URL for blog posts (post slug will be appended
                        to this)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Test Results */}
              {testResults && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Test Results</h3>
                  <div className="space-y-2">
                    {testResults.twitter && (
                      <Alert
                        variant={
                          testResults.twitter.success
                            ? "default"
                            : "destructive"
                        }
                      >
                        <div className="flex items-center">
                          {testResults.twitter.success ? (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          ) : (
                            <AlertCircle className="h-4 w-4 mr-2" />
                          )}
                          <AlertTitle>Twitter</AlertTitle>
                        </div>
                        <AlertDescription>
                          {testResults.twitter.message}
                        </AlertDescription>
                      </Alert>
                    )}
                    {testResults.bluesky && (
                      <Alert
                        variant={
                          testResults.bluesky.success
                            ? "default"
                            : "destructive"
                        }
                      >
                        <div className="flex items-center">
                          {testResults.bluesky.success ? (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          ) : (
                            <AlertCircle className="h-4 w-4 mr-2" />
                          )}
                          <AlertTitle>Bluesky</AlertTitle>
                        </div>
                        <AlertDescription>
                          {testResults.bluesky.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              )}
            </div>

            <CardFooter className="flex justify-between px-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={isTesting || saveMutation.isPending}
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  "Test Connection"
                )}
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                Save Settings
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
