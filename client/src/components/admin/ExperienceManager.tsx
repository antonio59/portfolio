import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ExperienceManager() {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Experience Management</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">Manage your work and educational experiences</p>
        <Button>Add New Experience</Button>
      </CardContent>
    </Card>
  );
}