import { useNavigate, useParams, Link } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, Trash2, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  useActivatePlanMutation,
  useDeletePlanMutation,
  useGetPlanQuery,
  useUpdatePlanMutation,
} from "@/api/services/plans";

import PlanForm from "./components/plan-form";

export default function PlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: plan, isLoading, error } = useGetPlanQuery(id);
  const [updatePlan, { isLoading: updating }] = useUpdatePlanMutation();
  const [deletePlan, { isLoading: deleting }] = useDeletePlanMutation();
  const [activatePlan, { isLoading: activating }] = useActivatePlanMutation();

  const onUpdate = async (payload) => {
    try {
      await updatePlan({ id, ...payload }).unwrap();
      toast.success("Plan updated");
    } catch (err) {
      toast.error(err?.data?.detail || "Update failed");
      throw err;
    }
  };

  const onActivate = async () => {
    try {
      await activatePlan(id).unwrap();
      toast.success("Plan activated");
    } catch (err) {
      toast.error(err?.data?.detail || "Activation failed");
    }
  };

  const onDelete = async () => {
    if (!confirm("Delete this plan? This cannot be undone.")) return;
    try {
      await deletePlan(id).unwrap();
      toast.success("Plan deleted");
      navigate("/plans");
    } catch (err) {
      toast.error(err?.data?.detail || "Delete failed");
    }
  };

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading plan…</div>;
  }
  if (error) {
    return (
      <div className="p-6 text-sm text-destructive">
        Failed to load plan ({error.status || "network error"}).
      </div>
    );
  }
  if (!plan) return null;

  return (
    <div className="os-enter p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/plans"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-foreground">{plan.name}</h1>
            <p className="font-mono text-xs text-muted-foreground">{plan.code}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onActivate} disabled={activating}>
            <Zap className="mr-1.5 h-4 w-4" /> Activate
          </Button>
          <Button
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
            disabled={deleting}
          >
            <Trash2 className="mr-1.5 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="rounded-md border border-border p-6">
        <PlanForm
          initial={plan}
          submitting={updating}
          submitLabel="Save changes"
          onSubmit={onUpdate}
        />
      </div>
    </div>
  );
}
