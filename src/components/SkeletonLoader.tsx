/**
 * SkeletonLoader.tsx — Système de squelettes de chargement premium
 * GRH BANQUE — AFG Bank Gabon
 *
 * Exports: SkeletonBar, CardSkeleton, TableSkeleton, DashboardSkeleton
 */

import React from "react";

/* ──────────────────────────────────────────────────────────────────────
   Custom shimmer keyframes injected once via <style>
   ────────────────────────────────────────────────────────────────────── */

const SHIMMER_STYLE_ID = "grh-skeleton-shimmer";

function ensureShimmerStyle(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(SHIMMER_STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = SHIMMER_STYLE_ID;
  style.textContent = `
    @keyframes grh-shimmer {
      0%   { background-position: -400px 0; }
      100% { background-position: 400px 0;  }
    }
    .grh-shimmer {
      background: linear-gradient(
        90deg,
        #0D0E14 0%,
        #1A1B22 40%,
        #26272F 50%,
        #1A1B22 60%,
        #0D0E14 100%
      );
      background-size: 800px 100%;
      animation: grh-shimmer 1.8s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
}

/* ──────────────────────────────────────────────────────────────────────
   SkeletonBar — Utilitaire: barre animée unique
   ────────────────────────────────────────────────────────────────────── */

interface SkeletonBarProps {
  width?: string;
  height?: string;
  className?: string;
}

export function SkeletonBar({
  width = "100%",
  height = "14px",
  className = "",
}: SkeletonBarProps) {
  ensureShimmerStyle();

  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={`grh-shimmer rounded-md ${className}`}
      style={{ width, height, minHeight: height }}
    />
  );
}

/* ──────────────────────────────────────────────────────────────────────
   CardSkeleton — Carte squelette premium
   ────────────────────────────────────────────────────────────────────── */

interface CardSkeletonProps {
  className?: string;
  key?: React.Key;
}

export function CardSkeleton({ className = "" }: CardSkeletonProps) {
  ensureShimmerStyle();

  return (
    <div
      role="presentation"
      aria-hidden="true"
      aria-label="Chargement de la carte"
      className={`rounded-2xl bg-[#07080D] border border-white/5 p-6 flex flex-col gap-4 shadow-xl ${className}`}
    >
      {/* Icône + titre */}
      <div className="flex items-center gap-3">
        <SkeletonBar width="40px" height="40px" className="rounded-xl shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <SkeletonBar width="55%" height="12px" />
          <SkeletonBar width="35%" height="10px" />
        </div>
      </div>

      {/* Valeur principale */}
      <SkeletonBar width="70%" height="28px" className="rounded-lg" />

      {/* Indicateur bas */}
      <div className="flex items-center gap-2 mt-auto">
        <SkeletonBar width="80px" height="10px" />
        <SkeletonBar width="50px" height="10px" />
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   TableSkeleton — Table squelette (8 rangées, en-tête compris)
   ────────────────────────────────────────────────────────────────────── */

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

const COLUMN_WIDTHS = ["18%", "25%", "20%", "15%", "12%", "10%"];
const HEADER_WIDTHS = ["60%", "75%", "65%", "55%", "50%", "40%"];

export function TableSkeleton({
  rows = 8,
  columns = 6,
  className = "",
}: TableSkeletonProps) {
  ensureShimmerStyle();

  const cols = Math.min(columns, COLUMN_WIDTHS.length);

  return (
    <div
      role="presentation"
      aria-hidden="true"
      aria-label="Chargement du tableau"
      className={`w-full rounded-2xl bg-[#07080D] border border-white/5 overflow-hidden shadow-xl ${className}`}
    >
      {/* Header row */}
      <div className="flex items-center gap-4 px-5 py-4 border-b border-white/5 bg-[#0A0B11]">
        {Array.from({ length: cols }).map((_, ci) => (
          <div key={`hdr-${ci}`} className="flex-1" style={{ maxWidth: HEADER_WIDTHS[ci] }}>
            <SkeletonBar width={HEADER_WIDTHS[ci]} height="14px" className="rounded" />
          </div>
        ))}
      </div>

      {/* Data rows */}
      {Array.from({ length: rows }).map((_, ri) => (
        <div
          key={`row-${ri}`}
          className="flex items-center gap-4 px-5 py-3.5 border-b border-white/[0.03] last:border-b-0"
          style={{ animationDelay: `${ri * 60}ms` }}
        >
          {Array.from({ length: cols }).map((_, ci) => (
            <div key={`cell-${ri}-${ci}`} className="flex-1">
              <SkeletonBar
                width={COLUMN_WIDTHS[ci]}
                height="11px"
                className="rounded"
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   DashboardSkeleton — 4 cartes KPI + zone graphique
   ────────────────────────────────────────────────────────────────────── */

interface DashboardSkeletonProps {
  className?: string;
}

export function DashboardSkeleton({ className = "" }: DashboardSkeletonProps) {
  ensureShimmerStyle();

  return (
    <div
      role="presentation"
      aria-hidden="true"
      aria-label="Chargement du tableau de bord"
      className={`w-full flex flex-col gap-6 ${className}`}
    >
      {/* Top bar skeleton */}
      <div className="flex items-center justify-between">
        <SkeletonBar width="220px" height="20px" className="rounded-lg" />
        <div className="flex items-center gap-3">
          <SkeletonBar width="120px" height="36px" className="rounded-full" />
          <SkeletonBar width="100px" height="36px" className="rounded-full" />
        </div>
      </div>

      {/* 4 KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={`kpi-${i}`} />
        ))}
      </div>

      {/* Large chart area */}
      <div className="rounded-2xl bg-[#07080D] border border-white/5 p-6 shadow-xl">
        {/* Chart header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col gap-2">
            <SkeletonBar width="180px" height="14px" />
            <SkeletonBar width="120px" height="10px" />
          </div>
          <SkeletonBar width="100px" height="32px" className="rounded-lg" />
        </div>

        {/* Fake chart bars */}
        <div className="flex items-end gap-3 h-48">
          {[65, 40, 85, 55, 70, 30, 90, 50, 75, 45, 60, 80].map((h, i) => (
            <div key={`bar-${i}`} className="flex-1 flex flex-col justify-end">
              <SkeletonBar
                width="100%"
                height={`${h}%`}
                className="rounded-t-md"
              />
            </div>
          ))}
        </div>

        {/* X-axis labels */}
        <div className="flex items-center gap-3 mt-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={`label-${i}`} className="flex-1 flex justify-center">
              <SkeletonBar width="24px" height="8px" className="rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Default export (convenience)
   ────────────────────────────────────────────────────────────────────── */

const SkeletonLoader = {
  Bar: SkeletonBar,
  Card: CardSkeleton,
  Table: TableSkeleton,
  Dashboard: DashboardSkeleton,
};

export default SkeletonLoader;
