import { themeQuartz } from "ag-grid-community";

// Shared AG Grid theme for app-v2 list surfaces, tuned to the v1 aesthetic:
// rounded card with a muted header row, subtle hover, tabular-friendly cells.
// Colors bind to the app's CSS variables (see src/index.css) so a theme swap
// propagates without touching AG Grid.
//
// Consumers should render through <AnumaGrid /> (anuma-grid.jsx) rather than
// wiring the theme onto <AgGridReact /> directly — the wrapper also owns the
// outer border, radius, and header text-transform so those stay consistent.
export const anumaGridTheme = themeQuartz.withParams({
  fontFamily: "inherit",
  fontSize: 13,
  headerFontWeight: 600,
  headerFontSize: 11,
  headerHeight: 40,
  rowHeight: 44,
  cellHorizontalPadding: 12,
  wrapperBorderRadius: 12,
  // Outer border is drawn by the wrapper — AG Grid draws only inter-row lines.
  wrapperBorder: false,
  borderColor: "hsl(var(--border))",
  headerBackgroundColor: "hsl(var(--muted) / 0.3)",
  headerTextColor: "hsl(var(--muted-foreground))",
  rowHoverColor: "hsl(var(--muted) / 0.2)",
  backgroundColor: "hsl(var(--card))",
  foregroundColor: "hsl(var(--foreground))",
  oddRowBackgroundColor: "transparent",
});
