import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SectionsManager() {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Content Sections Management</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">Manage website content sections</p>
        <Button>Add New Section</Button>
      </CardContent>
    </Card>
  );
}