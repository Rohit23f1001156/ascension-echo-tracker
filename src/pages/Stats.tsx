
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Stats = () => {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8">
      <Button asChild variant="outline" className="mb-4">
        <Link to="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>
      <h1 className="text-4xl font-bold mb-4">Stats</h1>
      <p className="text-muted-foreground">Your stats page is being calibrated. Return soon to see your progress.</p>
    </div>
  );
};

export default Stats;
