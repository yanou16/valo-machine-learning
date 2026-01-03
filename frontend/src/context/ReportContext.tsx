'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

// Types for report data
export interface ReportData {
    team_name: string;
    matches_analyzed: number;
    report: string;
    stats: {
        team_id: string;
        team_name: string;
        total_series: number;
        series_wins: number;
        series_losses: number;
        series_win_rate: number;
        total_maps: number;
        map_wins: number;
        map_losses: number;
        map_win_rate: number;
        map_stats: Array<{
            map: string;
            wins: number;
            losses: number;
            games: number;
            win_rate: number;
        }>;
        top_opponents: Array<{
            name: string;
            matches: number;
            wins: number;
            win_rate: number;
        }>;
    };
    insights: string[];
}

interface ReportContextType {
    reportData: ReportData | null;
    setReportData: (data: ReportData | null) => void;
    hasReport: boolean;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export function ReportProvider({ children }: { children: ReactNode }) {
    const [reportData, setReportData] = useState<ReportData | null>(null);

    return (
        <ReportContext.Provider
            value={{
                reportData,
                setReportData,
                hasReport: reportData !== null,
            }}
        >
            {children}
        </ReportContext.Provider>
    );
}

export function useReport() {
    const context = useContext(ReportContext);
    if (context === undefined) {
        throw new Error('useReport must be used within a ReportProvider');
    }
    return context;
}
