import { forwardRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";

import { cn } from "@/lib/utils";
import { anumaGridTheme } from "./anuma-grid-theme";

// Register community modules once, at module load, so consumers don't have to
// remember to. Safe on re-imports — AG Grid deduplicates.
ModuleRegistry.registerModules([AllCommunityModule]);

const defaultColDef = {
  resizable: true,
  sortable: false,
  suppressHeaderMenuButton: true,
  cellClass: "flex items-center",
};

// Reusable Anuma AG Grid wrapper.
//
// Owns:
//  · outer chrome — `rounded-xl border bg-card overflow-hidden`
//  · header casing — uppercase + tracking-wide (v1's <th> look)
//  · theme + baseline defaults (headerHeight, rowHeight, animateRows, no cell
//    focus outline)
//
// Height:
//  · omit `height` → grid auto-sizes to its rows (list feel, page scrolls).
//  · pass `height` (e.g. "60vh" or 480) → grid virtualises inside that box.
//
// Everything else forwards to <AgGridReact />, so `columnDefs`, `rowData`,
// `onRowClicked`, `pinnedTopRowData`, etc. all work directly.
const AnumaGrid = forwardRef(function AnumaGrid(
  {
    className,
    wrapperClassName,
    columnDefs,
    rowData,
    height,
    minWidth,
    ...rest
  },
  ref,
) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-card",
        "[&_.ag-header-cell-text]:uppercase [&_.ag-header-cell-text]:tracking-wide",
        wrapperClassName,
      )}
    >
      <div
        className={cn("w-full", className)}
        style={{ height: height ?? "auto", minWidth }}
      >
        <AgGridReact
          ref={ref}
          theme={anumaGridTheme}
          domLayout={height ? "normal" : "autoHeight"}
          columnDefs={columnDefs}
          rowData={rowData}
          defaultColDef={defaultColDef}
          animateRows
          suppressCellFocus
          {...rest}
        />
      </div>
    </div>
  );
});

export default AnumaGrid;
