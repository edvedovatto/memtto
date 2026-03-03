"use client";

import { useState, useEffect, useCallback } from "react";
import { StatCard } from "./stat-card";
import { RecentEntries } from "./recent-entries";
import { QuickAccess } from "./quick-access";
import { DashboardSkeleton } from "./dashboard-skeleton";
import {
  getDashboardStats,
  getRecentEntries,
  getContextCounts,
  getTopTags,
} from "@/lib/services/entries";
import type { Entry, DashboardStats, ContextCount, TagCount } from "@/types";

interface DashboardProps {
  favorites: Entry[];
  contexts: string[];
}

export function Dashboard({ favorites, contexts }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<Entry[]>([]);
  const [contextCounts, setContextCounts] = useState<ContextCount[]>([]);
  const [topTags, setTopTags] = useState<TagCount[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const [s, r, cc, tt] = await Promise.all([
        getDashboardStats(),
        getRecentEntries(5),
        getContextCounts(),
        getTopTags(8),
      ]);
      s.totalContexts = contexts.length;
      setStats(s);
      setRecent(r);
      setContextCounts(cc);
      setTopTags(tt);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }, [contexts.length]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Re-fetch when favorites or entries change
  useEffect(() => {
    window.addEventListener("favoritesChanged", reload);
    return () => window.removeEventListener("favoritesChanged", reload);
  }, [reload]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8 fade-in-up" style={{ opacity: 0, animationFillMode: "forwards" }}>
      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <StatCard
            label="Total entries"
            value={stats.totalEntries}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
                <line x1="8" y1="10" x2="16" y2="10" />
                <line x1="8" y1="14" x2="16" y2="14" />
                <line x1="8" y1="18" x2="12" y2="18" />
              </svg>
            }
          />
          <StatCard
            label="Favorites"
            value={stats.totalFavorites}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            }
          />
          <StatCard
            label="Contexts"
            value={stats.totalContexts}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            }
          />
          <StatCard
            label="This week"
            value={stats.entriesThisWeek}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            }
          />
        </div>
      )}

      {/* Main content: recent + quick access */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <RecentEntries entries={recent} />
        </div>
        <div className="xl:col-span-2">
          <QuickAccess favorites={favorites} topTags={topTags} contextCounts={contextCounts} />
        </div>
      </div>
    </div>
  );
}
