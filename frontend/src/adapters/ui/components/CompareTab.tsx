import { useState, useEffect, useMemo } from 'react';
import type { RoutesComparisonResponse } from '../../../core/domain/Route';
import { routeRepository } from '../../../shared/repositories';

export default function CompareTab() {
    const [data, setData] = useState<RoutesComparisonResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchComparison = async () => {
            try {
                const response = await routeRepository.getComparison();
                setData(response);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchComparison();
    }, []);

    const { baselineIntensity, targetIntensity, comparisons, compliantCount, averageIntensity } = useMemo(() => {
        if (!data) return {
            baselineIntensity: 0,
            targetIntensity: 0,
            comparisons: [],
            compliantCount: 0,
            averageIntensity: 0
        };

        const baselineIntensity = data.baseline.ghgIntensity;
        const targetIntensity = data.targetIntensity; // Use fixed target from backend
        const comparisons = data.routes;
        const compliantCount = comparisons.filter(c => c.compliant).length;
        const averageIntensity = comparisons.length > 0
            ? comparisons.reduce((acc, c) => acc + c.ghgIntensity, 0) / comparisons.length
            : 0;

        return { baselineIntensity, targetIntensity, comparisons, compliantCount, averageIntensity };
    }, [data]);

    if (loading) {
        return <div className="text-center py-12 text-gray-400">Loading comparison data...</div>;
    }

    if (!data) {
        return <div className="text-center py-12 text-gray-400">No comparison data available. Please set a baseline in the Routes tab.</div>;
    }

    return (
        <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6">
                    <h3 className="text-gray-400 text-sm font-medium mb-2">Target GHG Intensity</h3>
                    <div className="text-3xl font-bold text-neon-cyan">{targetIntensity.toFixed(4)} <span className="text-sm text-gray-500">gCO₂e/MJ</span></div>
                    <p className="text-xs text-gray-500 mt-2">2% reduction from 91.16 baseline (fixed target)</p>
                </div>
                <div className="glass-card p-6">
                    <h3 className="text-gray-400 text-sm font-medium mb-2">Compliant Routes</h3>
                    <div className="text-3xl font-bold text-green-400">
                        {compliantCount} <span className="text-sm text-gray-500">/ {comparisons.length}</span>
                    </div>
                </div>
                <div className="glass-card p-6">
                    <h3 className="text-gray-400 text-sm font-medium mb-2">Average Intensity</h3>
                    <div className="text-3xl font-bold text-purple-400">
                        {averageIntensity.toFixed(4)}
                    </div>
                </div>
            </div>

            {/* Chart Section */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-6">Intensity Comparison</h3>
                <div className="space-y-4">
                    {comparisons.map((route) => (
                        <div key={route.routeId} className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-300">{route.routeId} ({route.vesselType})</span>
                                <span className="font-mono">{route.ghgIntensity.toFixed(4)}</span>
                            </div>
                            <div className="h-4 bg-gray-800 rounded-full overflow-hidden relative">
                                {/* Target Line */}
                                <div
                                    className="absolute top-0 bottom-0 w-0.5 bg-neon-cyan z-10"
                                    style={{ left: `${(targetIntensity / 100) * 100}%` }}
                                    title={`Target: ${targetIntensity.toFixed(4)}`}
                                />

                                {/* Bar */}
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${route.compliant ? 'bg-green-500' : 'bg-red-500'}`}
                                    style={{ width: `${Math.min((route.ghgIntensity / 100) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div> Compliant
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div> Non-Compliant
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-0.5 h-4 bg-neon-cyan"></div> Target ({targetIntensity.toFixed(4)})
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Route ID</th>
                                <th>Vessel</th>
                                <th className="!text-right">GHG Intensity</th>
                                <th className="!text-right">Baseline</th>
                                <th className="!text-right">% Difference</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comparisons.map((route) => (
                                <tr key={route.routeId}>
                                    <td className="font-mono text-gray-300">{route.routeId}</td>
                                    <td>{route.vesselType}</td>
                                    <td className="font-mono font-bold text-right">{route.ghgIntensity.toFixed(4)}</td>
                                    <td className="font-mono text-gray-500 text-right">{baselineIntensity.toFixed(4)}</td>
                                    <td className={`font-mono font-bold text-right ${route.percentDiff <= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {route.percentDiff > 0 ? '+' : ''}{route.percentDiff.toFixed(2)}%
                                    </td>
                                    <td>
                                        {route.compliant ? (
                                            <span className="status-badge status-positive">✅ Compliant</span>
                                        ) : (
                                            <span className="status-badge status-negative">❌ Non-Compliant</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
