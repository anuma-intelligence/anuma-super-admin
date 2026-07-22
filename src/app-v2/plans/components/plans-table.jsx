import { useMemo } from "react";
import { useNavigate } from "react-router";
import { Zap } from "lucide-react";

import AnumaGrid from "@/components/data-grid/anuma-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { badgeVariantForVisibility, durationLabel } from "../data";

const CodeCell = ({ value }) => (
  <span className="font-mono text-xs">{value}</span>
);

const NameCell = ({ value }) => (
  <span className="font-medium text-foreground">{value}</span>
);

const VisibilityCell = ({ value }) => (
  <Badge variant={badgeVariantForVisibility(value)}>{value}</Badge>
);

const DurationCell = ({ data }) => <span>{durationLabel(data)}</span>;

const ModulesCell = ({ value }) => (
  <span className="text-muted-foreground">
    {Array.isArray(value) ? value.length : 0}
  </span>
);

function ActionsCell({ data, onActivate, activating }) {
  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={activating}
      onClick={(e) => {
        e.stopPropagation();
        onActivate(data.id);
      }}
    >
      <Zap className="mr-1 h-3.5 w-3.5" /> Activate
    </Button>
  );
}

export default function PlansTable({
  plans,
  isLoading,
  error,
  onActivate,
  activating,
}) {
  const navigate = useNavigate();

  const columnDefs = useMemo(
    () => [
      {
        field: "code",
        headerName: "Code",
        cellRenderer: CodeCell,
        width: 140,
      },
      {
        field: "name",
        headerName: "Name",
        cellRenderer: NameCell,
        flex: 1,
        minWidth: 180,
      },
      {
        field: "visibility",
        headerName: "Visibility",
        cellRenderer: VisibilityCell,
        width: 130,
      },
      {
        field: "duration_type",
        headerName: "Duration",
        cellRenderer: DurationCell,
        width: 140,
      },
      {
        field: "modules",
        headerName: "Modules",
        cellRenderer: ModulesCell,
        width: 110,
      },
      {
        headerName: "",
        cellRenderer: ActionsCell,
        cellRendererParams: { onActivate, activating },
        width: 130,
        cellClass: "flex items-center justify-end",
      },
    ],
    [onActivate, activating],
  );

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-destructive">
        Failed to load plans ({error.status || "network error"}).
      </div>
    );
  }

  return (
    <AnumaGrid
      columnDefs={columnDefs}
      rowData={plans}
      loading={isLoading}
      overlayNoRowsTemplate="<span>No plans yet.</span>"
      onRowClicked={(e) => e.data && navigate(`/plans/${e.data.id}`)}
    />
  );
}
