import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { EMPTY_PLAN } from "../data";
import PlanForm from "./plan-form";

export default function CreatePlanDialog({ open, onOpenChange, submitting, onSubmit }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1.5 h-4 w-4" /> Create plan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create plan</DialogTitle>
          <DialogDescription>
            Define plan code, quotas and overage rates. Save to make it available.
          </DialogDescription>
        </DialogHeader>
        <PlanForm
          initial={EMPTY_PLAN}
          submitting={submitting}
          submitLabel="Create plan"
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
