import { ChartBar, ChartColumn, ChartLine, ChartPie, Table2 } from '@lucide/vue'
import type { Component } from 'vue'

// Dashboard charts (docs/backoffice-features.md §8). Each card offers only the forms that fit its
// data: a donut only for parts of a whole, a line only for an ordered axis. The table is always
// there, so no value depends on hover or on colour alone.

export type ChartKind = 'donut' | 'bar' | 'column' | 'line' | 'table'

export interface ChartDatum {
  key: string
  label: string
  /** Axis label for column / line when `label` is long. */
  short?: string
  value: number
  /** Where a click on the mark goes (e.g. the filtered list). */
  href?: string
}

export const CHART_ICONS: Record<ChartKind, Component> = {
  donut: ChartPie,
  bar: ChartBar,
  column: ChartColumn,
  line: ChartLine,
  table: Table2,
}

/**
 * Categorical slots for donut slices, in this order (dataviz reference palette, validated for
 * adjacent pairs: worst CVD ΔE 9.1, normal-vision 19.6). Slots 3–5 are under 3:1 on white, so the
 * donut always ships its legend with values. Never more than 6: anything past that folds into
 * the last slot's "other".
 */
export const SERIES_COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300']
