import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  useActivatePlanMutation,
  useCreatePlanMutation,
  useListPlansQuery,
} from "@/api/services/plans";

import CreatePlanDialog from "./components/create-plan-dialog";
import PlansTable from "./components/plans-table";

const readResults = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  return [];
};

export default function PlansPage() {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading, isFetching, error } = useListPlansQuery({
    search: search || undefined,
  });
  const [activatePlan, { isLoading: activating }] = useActivatePlanMutation();
  const [createPlan, { isLoading: creating }] = useCreatePlanMutation();
  const plans = readResults(data);

  const onActivate = async (id) => {
    try {
      await activatePlan(id).unwrap();
      toast.success("Plan activated");
    } catch (err) {
      toast.error(err?.data?.detail || "Activation failed");
    }
  };

  const onCreate = async (payload) => {
    try {
      await createPlan(payload).unwrap();
      toast.success("Plan created");
      setCreateOpen(false);
    } catch (err) {
      toast.error(err?.data?.detail || "Create failed");
      throw err;
    }
  };

  return (
    <div className="os-enter p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Plans</h1>
          <p className="text-sm text-muted-foreground">
            Billing plans available to merchants across the platform.
          </p>
        </div>
        <CreatePlanDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          submitting={creating}
          onSubmit={onCreate}
        />
      </div>

      <div className="mb-3 flex items-center gap-2">
        <Input
          placeholder="Search plans…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        {isFetching ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      <PlansTable
        plans={plans}
        isLoading={isLoading}
        error={error}
        onActivate={onActivate}
        activating={activating}
      />
    </div>
  );
}
