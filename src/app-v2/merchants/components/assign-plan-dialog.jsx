import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useListPlansQuery } from "@/api/services/plans";

const readResults = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  return [];
};

export default function AssignPlanDialog({
  open,
  onOpenChange,
  currentPlanId,
  submitting,
  onAssign,
}) {
  const { data, isLoading } = useListPlansQuery(undefined, { skip: !open });
  const plans = readResults(data);

  const [selected, setSelected] = useState(
    currentPlanId == null ? "" : String(currentPlanId),
  );

  useEffect(() => {
    if (open) setSelected(currentPlanId == null ? "" : String(currentPlanId));
  }, [open, currentPlanId]);

  const disabled = submitting || !selected;

  const handleAssign = async () => {
    if (!selected) return;
    try {
      await onAssign(Number(selected));
    } catch {
      // parent surfaces errors
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign plan</DialogTitle>
          <DialogDescription>
            Choose a plan to assign to this merchant.
          </DialogDescription>
        </DialogHeader>

        <div>
          <Label htmlFor="assign-plan">Plan</Label>
          <Select value={selected} onValueChange={setSelected} disabled={isLoading}>
            <SelectTrigger id="assign-plan" className="mt-1.5">
              <SelectValue placeholder={isLoading ? "Loading plans…" : "Select a plan"} />
            </SelectTrigger>
            <SelectContent>
              {plans.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.name} ({p.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={disabled}>
            {submitting ? "Assigning…" : "Assign plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
