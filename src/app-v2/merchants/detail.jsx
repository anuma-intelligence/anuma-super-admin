import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, PowerOff, Power, Tag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useAssignPlanMutation,
  useDeleteMerchantMutation,
  useGetMerchantQuery,
  useToggleActiveMutation,
  useUpdateMerchantMutation,
} from "@/api/services/merchants";

import AssignPlanDialog from "./components/assign-plan-dialog";
import MerchantForm from "./components/merchant-form";
import MerchantModulesPanel from "./components/merchant-modules-panel";
import { planId, planLabel } from "./data";

const formatDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
};

function MetaCell({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 truncate text-sm text-foreground">{value ?? "—"}</p>
    </div>
  );
}

export default function MerchantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignOpen, setAssignOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: merchant, isLoading, error } = useGetMerchantQuery(id);
  const [updateMerchant, { isLoading: updating }] = useUpdateMerchantMutation();
  const [assignPlan, { isLoading: assigning }] = useAssignPlanMutation();
  const [toggleActive, { isLoading: toggling }] = useToggleActiveMutation();
  const [deleteMerchant, { isLoading: deleting }] = useDeleteMerchantMutation();

  const onUpdate = async (payload) => {
    try {
      await updateMerchant({ id, ...payload }).unwrap();
      toast.success("Merchant updated");
    } catch (err) {
      toast.error(err?.data?.detail || "Update failed");
      throw err;
    }
  };

  const onAssign = async (nextPlanId) => {
    try {
      await assignPlan({ id, plan_id: nextPlanId }).unwrap();
      toast.success("Plan assigned");
      setAssignOpen(false);
    } catch (err) {
      toast.error(err?.data?.detail || "Assign failed");
      throw err;
    }
  };

  const onToggleActive = async () => {
    try {
      await toggleActive(id).unwrap();
      toast.success("Status updated");
    } catch (err) {
      toast.error(err?.data?.detail || "Toggle failed");
    }
  };

  const onDelete = async () => {
    try {
      await deleteMerchant(id).unwrap();
      toast.success("Merchant deleted");
      setDeleteOpen(false);
      navigate("/merchants");
    } catch (err) {
      toast.error(err?.data?.detail || "Delete failed");
      // Keep the dialog open so the toast reads against the same context and
      // the admin can retry without re-navigating.
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl p-6 text-sm text-muted-foreground">
        Loading merchant…
      </div>
    );
  }
  if (error) {
    return (
      <div className="mx-auto max-w-6xl p-6 text-sm text-destructive">
        Failed to load merchant ({error.status || "network error"}).
      </div>
    );
  }
  if (!merchant) return null;

  const isActive = merchant.is_active !== false;
  const userCount = Array.isArray(merchant.users) ? merchant.users.length : 0;

  return (
    <div className="os-enter mx-auto max-w-6xl space-y-6 p-6">
      {/* Header — back link + title + status + action cluster */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link
            to="/merchants"
            className="mt-1 flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-foreground">
                {merchant.name}
              </h1>
              <Badge variant={isActive ? "default" : "secondary"}>
                {isActive ? "active" : "inactive"}
              </Badge>
            </div>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              {merchant.handle}
              {merchant.domain ? ` · ${merchant.domain}` : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setAssignOpen(true)}>
            <Tag className="mr-1.5 h-4 w-4" /> Assign plan
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleActive}
            disabled={toggling}
          >
            {isActive ? (
              <PowerOff className="mr-1.5 h-4 w-4" />
            ) : (
              <Power className="mr-1.5 h-4 w-4" />
            )}
            {isActive ? "Deactivate" : "Activate"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
            disabled={deleting}
          >
            <Trash2 className="mr-1.5 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      {/* Metadata strip — quick facts pulled from the merchant payload */}
      <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-muted/20 p-4 sm:grid-cols-3 lg:grid-cols-6">
        <MetaCell label="ID" value={<span className="font-mono">{merchant.id}</span>} />
        <MetaCell label="Plan" value={planLabel(merchant.plan)} />
        <MetaCell label="Owner" value={merchant.owner_email || merchant.owner || "—"} />
        <MetaCell label="Users" value={userCount} />
        <MetaCell label="Created" value={formatDate(merchant.created_at)} />
        <MetaCell label="Updated" value={formatDate(merchant.updated_at)} />
      </div>

      {/* Details form — sectioned, no full-width card */}
      <section className="rounded-lg border border-border bg-card p-6">
        <MerchantForm
          initial={merchant}
          submitting={updating}
          submitLabel="Save changes"
          onSubmit={onUpdate}
        />
      </section>

      {/* Modules — grid of toggle tiles grouped by domain */}
      <MerchantModulesPanel
        merchantId={id}
        merchantModules={merchant.merchant_modules}
      />

      <AssignPlanDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        currentPlanId={planId(merchant.plan)}
        submitting={assigning}
        onAssign={onAssign}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {merchant.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the merchant
              <span className="font-mono"> {merchant.handle} </span>
              along with its {userCount} user assignment
              {userCount === 1 ? "" : "s"}, enabled modules and plan
              subscription. This cannot be undone — deactivate instead if you
              only need to suspend access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
              // preventDefault keeps Radix from auto-closing, so a failed
              // delete leaves the dialog up for a retry.
              onClick={(e) => {
                e.preventDefault();
                onDelete();
              }}
            >
              {deleting ? "Deleting…" : "Delete merchant"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
