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

import { EMPTY_MERCHANT } from "../data";
import MerchantForm from "./merchant-form";

export default function CreateMerchantDialog({
  open,
  onOpenChange,
  submitting,
  onSubmit,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1.5 h-4 w-4" /> Create merchant
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create merchant</DialogTitle>
          <DialogDescription>
            Provision a new tenant with basic details.
          </DialogDescription>
        </DialogHeader>
        <MerchantForm
          initial={EMPTY_MERCHANT}
          submitting={submitting}
          submitLabel="Create merchant"
          onSubmit={onSubmit}
          omitFields={["handle"]}
        />
      </DialogContent>
    </Dialog>
  );
}
