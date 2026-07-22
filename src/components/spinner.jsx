import { Loader2 } from "lucide-react";

const Spinner = () => (
  <div className="grid h-screen w-full place-items-center bg-background">
    <Loader2 className="h-6 w-6 animate-spin text-foreground/60" />
  </div>
);

export default Spinner;
