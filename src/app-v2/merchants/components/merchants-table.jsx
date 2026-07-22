import { useMemo } from "react";
import { useNavigate } from "react-router";

import AnumaGrid from "@/components/data-grid/anuma-grid";
import { Badge } from "@/components/ui/badge";

import { planLabel } from "../data";

const NameCell = ({ value }) => (
  <span className="font-medium text-foreground">{value}</span>
);

const HandleCell = ({ value }) => (
  <span className="font-mono text-xs">{value}</span>
);

const DomainCell = ({ value }) => (
  <span className="text-muted-foreground">{value || "—"}</span>
);

const PlanCell = ({ value }) => <span>{planLabel(value)}</span>;

const StatusCell = ({ value }) => {
  const active = value !== false;
  return (
    <Badge variant={active ? "default" : "secondary"}>
      {active ? "active" : "inactive"}
    </Badge>
  );
};

export default function MerchantsTable({ merchants, isLoading, error }) {
  const navigate = useNavigate();

  const columnDefs = useMemo(
    () => [
      {
        field: "name",
        headerName: "Name",
        cellRenderer: NameCell,
        flex: 1,
        minWidth: 200,
      },
      {
        field: "handle",
        headerName: "Handle",
        cellRenderer: HandleCell,
        width: 160,
      },
      {
        field: "domain",
        headerName: "Domain",
        cellRenderer: DomainCell,
        flex: 1,
        minWidth: 180,
      },
      {
        field: "plan",
        headerName: "Plan",
        cellRenderer: PlanCell,
        width: 160,
      },
      {
        field: "is_active",
        headerName: "Status",
        cellRenderer: StatusCell,
        width: 120,
      },
    ],
    [],
  );

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-destructive">
        Failed to load merchants ({error.status || "network error"}).
      </div>
    );
  }

  return (
    <AnumaGrid
      columnDefs={columnDefs}
      rowData={merchants}
      loading={isLoading}
      overlayNoRowsTemplate="<span>No merchants yet.</span>"
      onRowClicked={(e) => e.data && navigate(`/merchants/${e.data.id}`)}
    />
  );
}
