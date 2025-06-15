
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Settings = () => {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8">
      <Button asChild variant="outline" className="mb-4">
        <Link to="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>
      <h1 className="text-4xl font-bold mb-4">Settings</h1>
      <p className="text-muted-foreground">System configuration is being set up. You will be able to customize your experience soon.</p>
    </div>
  );
};

export default Settings;
