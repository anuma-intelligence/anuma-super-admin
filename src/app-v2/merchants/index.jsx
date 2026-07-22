import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  useCreateMerchantMutation,
  useListMerchantsQuery,
} from "@/api/services/merchants";

import CreateMerchantDialog from "./components/create-merchant-dialog";
import MerchantsTable from "./components/merchants-table";

const readResults = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  return [];
};

export default function MerchantsPage() {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading, isFetching, error } = useListMerchantsQuery({
    search: search || undefined,
  });
  const [createMerchant, { isLoading: creating }] = useCreateMerchantMutation();
  const merchants = readResults(data);

  const onCreate = async (payload) => {
    try {
      await createMerchant(payload).unwrap();
      toast.success("Merchant created");
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
          <h1 className="text-lg font-semibold text-foreground">Merchants</h1>
          <p className="text-sm text-muted-foreground">
            All tenants on the platform.
          </p>
        </div>
        <CreateMerchantDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          submitting={creating}
          onSubmit={onCreate}
        />
      </div>

      <div className="mb-3 flex items-center gap-2">
        <Input
          placeholder="Search merchants…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        {isFetching ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      <MerchantsTable merchants={merchants} isLoading={isLoading} error={error} />
    </div>
  );
}
