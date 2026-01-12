import { useMemo } from 'react';
import { useDebtorStore } from '../stores/useDebtorStore';
import { useLetterHistoryStore } from '../stores/useLetterHistoryStore';
import { usePropertyStore } from '../stores/usePropertyStore';

export interface EffectivenessMetric {
    totalLetters: number;
    successCount: number; // Debt decreased or fully paid
    partialCount: number; // Debt decreased but not paid off
    failureCount: number; // Debt same or increased
    recoveredAmount: number;
    successRate: number;
}

export const useCollectionEffectiveness = () => {
    const { getReportByPeriod, reports } = useDebtorStore();
    const { records: letterRecords } = useLetterHistoryStore();
    const { activePropertyId } = usePropertyStore();

    const metrics = useMemo(() => {
        if (!activePropertyId) return null;

        // 1. Get all periods available and sort them descending
        const periods = reports
            .filter(r => r.propertyId === activePropertyId)
            .map(r => r.periodo)
            .sort()
            .reverse();

        // Need at least 2 periods to compare
        if (periods.length < 2) return null;

        const results: Record<string, EffectivenessMetric> = {};

        // Analyze each period T against T-1 (Reverse chronological: T is latest)
        // actually we want to see effects of letters sent in T-1 on period T
        // So we iterate from index 1 (T-1) to end

        // Example: Jan (T-1), Feb (T). Letters sent in Jan should be checked against Feb balance.

        let totalStats: EffectivenessMetric = {
            totalLetters: 0,
            successCount: 0,
            partialCount: 0,
            failureCount: 0,
            recoveredAmount: 0,
            successRate: 0
        };

        for (let i = 0; i < periods.length - 1; i++) {
            const periodTarget = periods[i];     // Feb (Outcome)
            const periodAction = periods[i + 1];   // Jan (Action)

            const reportAction = getReportByPeriod(periodAction, activePropertyId);
            const reportTarget = getReportByPeriod(periodTarget, activePropertyId);

            if (!reportAction || !reportTarget) continue;

            // Find letters sent during 'periodAction'
            // We assume period format "YYYY-MM"
            const relevantLetters = letterRecords.filter(r =>
                r.propertyId === activePropertyId &&
                r.fecha.startsWith(periodAction)
            );

            let periodStats: EffectivenessMetric = {
                totalLetters: relevantLetters.length,
                successCount: 0,
                partialCount: 0,
                failureCount: 0,
                recoveredAmount: 0,
                successRate: 0
            };

            relevantLetters.forEach(letter => {
                // Find debtor in both reports
                // Matching by Unit (unidad) is safer than ID if IDs change between uploads logic
                const debtStart = reportAction.debtors.find(d => d.unidad === letter.unidad);
                const debtEnd = reportTarget.debtors.find(d => d.unidad === letter.unidad);

                if (debtStart) {
                    const initialAmount = debtStart.totalPagar;
                    const finalAmount = debtEnd ? debtEnd.totalPagar : 0; // If not in next report, assume paid (0)

                    if (finalAmount < initialAmount) {
                        periodStats.successCount++;
                        periodStats.recoveredAmount += (initialAmount - finalAmount);
                        if (finalAmount > 0) periodStats.partialCount++;
                    } else {
                        periodStats.failureCount++;
                    }
                }
            });

            periodStats.successRate = periodStats.totalLetters > 0
                ? (periodStats.successCount / periodStats.totalLetters) * 100
                : 0;

            results[periodAction] = periodStats; // Store by the Action month

            // Aggregate global stats
            totalStats.totalLetters += periodStats.totalLetters;
            totalStats.successCount += periodStats.successCount;
            totalStats.partialCount += periodStats.partialCount;
            totalStats.failureCount += periodStats.failureCount;
            totalStats.recoveredAmount += periodStats.recoveredAmount;
        }

        totalStats.successRate = totalStats.totalLetters > 0
            ? (totalStats.successCount / totalStats.totalLetters) * 100
            : 0;

        return {
            global: totalStats,
            byPeriod: results,
            availablePeriods: periods
        };

    }, [reports, letterRecords, activePropertyId, getReportByPeriod]);

    return metrics;
};
