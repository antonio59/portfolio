import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProjectsManager() {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Project Management</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">Manage all your portfolio projects</p>
        <Button>Add New Project</Button>
      </CardContent>
    </Card>
  );
}