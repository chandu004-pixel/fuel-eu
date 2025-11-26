import { useState, useEffect } from 'react';
import type { PoolMember } from '../../../core/domain/Pool';
import { poolRepository } from '../../../shared/repositories';

export default function PoolingTab() {
    const [year, setYear] = useState(new Date().getFullYear());
    const [members, setMembers] = useState<PoolMember[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [creatingPool, setCreatingPool] = useState(false);

    useEffect(() => {
        fetchMembers();
    }, [year]);

    const fetchMembers = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await poolRepository.getAdjustedCB(year);
            setMembers(data);
        } catch (err) {
            setError('Failed to fetch ship compliance data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleMember = (shipId: string) => {
        setSelectedMembers(prev =>
            prev.includes(shipId)
                ? prev.filter(id => id !== shipId)
                : [...prev, shipId]
        );
    };

    const selectedPoolMembers = members.filter(m => selectedMembers.includes(m.shipId));
    const poolSum = selectedPoolMembers.reduce((sum, m) => sum + m.adjustedCB, 0);
    const totalSurplus = selectedPoolMembers.filter(m => m.adjustedCB > 0).reduce((s, m) => s + m.adjustedCB, 0);
    const totalDeficit = selectedPoolMembers.filter(m => m.adjustedCB < 0).reduce((s, m) => s + m.adjustedCB, 0);

    // Calculate projected CB after pooling (simplified equal distribution)
    const calculateCBAfter = (member: PoolMember): number => {
        if (!selectedMembers.includes(member.shipId)) return member.adjustedCB;

        const avgCB = poolSum / selectedMembers.length;

        // If deficit ship, try to improve but not beyond average
        if (member.adjustedCB < 0) {
            return Math.min(avgCB, 0);
        }
        // If surplus ship, contribute but don't go negative
        return Math.max(avgCB, 0);
    };

    // Validation rules
    const hasMinimumMembers = selectedMembers.length >= 2;
    const hasNonNegativeSum = poolSum >= 0;

    // Check if any deficit ship would exit worse
    const deficitShipsValid = selectedPoolMembers
        .filter(m => m.adjustedCB < 0)
        .every(m => calculateCBAfter(m) >= m.adjustedCB);

    // Check if any surplus ship would exit negative
    const surplusShipsValid = selectedPoolMembers
        .filter(m => m.adjustedCB > 0)
        .every(m => calculateCBAfter(m) >= 0);

    const allRulesValid = hasMinimumMembers && hasNonNegativeSum && deficitShipsValid && surplusShipsValid;

    const handleCreatePool = async () => {
        if (!allRulesValid) return;

        setCreatingPool(true);
        setError(null);
        setSuccessMessage(null);

        try {
            await poolRepository.createPool(selectedMembers, year);
            setSuccessMessage(`Pool created successfully with ${selectedMembers.length} ships! Net balance: ${poolSum.toLocaleString()} gCO₂e/MJ`);
            setSelectedMembers([]);
            await fetchMembers(); // Refresh data
        } catch (err: any) {
            setError(err.message || 'Failed to create pool');
            console.error(err);
        } finally {
            setCreatingPool(false);
        }
    };

    const getRuleStatus = (isValid: boolean) => ({
        icon: isValid ? '✅' : '❌',
        color: isValid ? 'text-green-400' : 'text-red-400'
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div>
                        <h2 className="text-2xl font-bold">Pooling Configuration</h2>
                        <p className="text-xs text-gray-500">Article 21 - Compliance Pooling</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-900/50 p-2 rounded-lg border border-gray-800">
                    <label className="text-sm text-gray-400">Year:</label>
                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="bg-gray-800 border-none rounded text-white px-3 py-1 focus:ring-1 focus:ring-neon-cyan outline-none"
                    >
                        {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Success/Error Messages */}
            {successMessage && (
                <div className="p-4 bg-green-900/20 border border-green-900/50 rounded-lg text-green-400 flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{successMessage}</span>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Members List */}
                <div className="lg:col-span-2 glass-card overflow-hidden">
                    <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between">
                        <h3 className="font-medium text-gray-300">Available Ships ({members.length})</h3>
                        {selectedMembers.length > 0 && (
                            <button
                                onClick={() => setSelectedMembers([])}
                                className="text-xs text-gray-400 hover:text-neon-cyan transition-colors"
                            >
                                Clear Selection
                            </button>
                        )}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th className="w-14 !px-4 text-center">
                                        <input
                                            type="checkbox"
                                            onChange={(e) => {
                                                if (e.target.checked) setSelectedMembers(members.map(m => m.shipId));
                                                else setSelectedMembers([]);
                                            }}
                                            checked={members.length > 0 && selectedMembers.length === members.length}
                                            className="rounded bg-gray-800 border-gray-600 text-neon-cyan focus:ring-neon-cyan"
                                        />
                                    </th>
                                    <th>Ship Name</th>
                                    <th>ID</th>
                                    <th className="text-right">CB Before</th>
                                    <th className="text-right">CB After Pool</th>
                                    <th className="text-center">Impact</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8">
                                            <div className="flex items-center justify-center gap-2 text-gray-400">
                                                <div className="w-5 h-5 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin"></div>
                                                Loading ships...
                                            </div>
                                        </td>
                                    </tr>
                                ) : members.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12">
                                            <div className="flex flex-col items-center gap-3">
                                                <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                </svg>
                                                <p className="text-gray-400">No ships found for {year}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    members.map((member) => {
                                        const isSelected = selectedMembers.includes(member.shipId);
                                        const cbAfter = calculateCBAfter(member);
                                        const improvement = cbAfter - member.adjustedCB;

                                        return (
                                            <tr
                                                key={member.shipId}
                                                className={`cursor-pointer transition-colors ${isSelected ? 'bg-neon-cyan/5 border-l-2 border-neon-cyan' : 'hover:bg-gray-800/30'}`}
                                                onClick={() => toggleMember(member.shipId)}
                                            >
                                                <td className="!px-4 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleMember(member.shipId)}
                                                        className="rounded bg-gray-800 border-gray-600 text-neon-cyan focus:ring-neon-cyan"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </td>
                                                <td className="font-medium text-white">{member.name}</td>
                                                <td className="font-mono text-gray-400 text-sm">{member.shipId}</td>
                                                <td className={`text-right font-mono font-bold ${member.adjustedCB >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {member.adjustedCB > 0 ? '+' : ''}{member.adjustedCB.toLocaleString()}
                                                </td>
                                                <td className={`text-right font-mono ${isSelected ? (cbAfter >= 0 ? 'text-green-400' : 'text-red-400') : 'text-gray-600'}`}>
                                                    {isSelected ? (
                                                        <>{cbAfter > 0 ? '+' : ''}{cbAfter.toLocaleString()}</>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </td>
                                                <td className="text-center">
                                                    {isSelected && improvement !== 0 && (
                                                        <span className={`text-xs px-2 py-1 rounded ${improvement > 0 ? 'bg-green-900/30 text-green-400' : 'bg-orange-900/30 text-orange-400'}`}>
                                                            {improvement > 0 ? '↑' : '↓'} {Math.abs(improvement).toFixed(0)}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pool Summary */}
                <div className="space-y-4">
                    <div className="glass-card p-6 sticky top-24">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Pool Summary
                        </h3>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Selected Ships</span>
                                <span className="text-white font-mono font-bold">{selectedMembers.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Total Surplus</span>
                                <span className="text-green-400 font-mono">
                                    +{totalSurplus.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Total Deficit</span>
                                <span className="text-red-400 font-mono">
                                    {totalDeficit.toLocaleString()}
                                </span>
                            </div>

                            <div className="h-px bg-gray-700 my-4"></div>

                            <div className="flex justify-between items-end">
                                <span className="text-gray-300 font-medium">Net Pool Balance</span>
                                <span className={`text-2xl font-bold font-mono ${poolSum >= 0 ? 'text-neon-cyan' : 'text-red-500'}`}>
                                    {poolSum > 0 ? '+' : ''}{poolSum.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Validation Rules */}
                        {selectedMembers.length > 0 && (
                            <div className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                                <h4 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Validation Rules</h4>
                                <div className="space-y-2 text-xs">
                                    <div className={`flex items-center gap-2 ${getRuleStatus(hasMinimumMembers).color}`}>
                                        <span>{getRuleStatus(hasMinimumMembers).icon}</span>
                                        <span>Minimum 2 members</span>
                                    </div>
                                    <div className={`flex items-center gap-2 ${getRuleStatus(hasNonNegativeSum).color}`}>
                                        <span>{getRuleStatus(hasNonNegativeSum).icon}</span>
                                        <span>Sum(CB) ≥ 0</span>
                                    </div>
                                    <div className={`flex items-center gap-2 ${getRuleStatus(deficitShipsValid).color}`}>
                                        <span>{getRuleStatus(deficitShipsValid).icon}</span>
                                        <span>Deficit ships don't exit worse</span>
                                    </div>
                                    <div className={`flex items-center gap-2 ${getRuleStatus(surplusShipsValid).color}`}>
                                        <span>{getRuleStatus(surplusShipsValid).icon}</span>
                                        <span>Surplus ships don't go negative</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleCreatePool}
                            disabled={!allRulesValid || creatingPool}
                            className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-200 ${allRulesValid && !creatingPool
                                ? 'bg-gradient-neon text-white hover:shadow-[0_0_30px_rgba(0,255,255,0.6)] hover:scale-[1.02] border-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.5)]'
                                : 'bg-gray-800/80 text-white cursor-not-allowed border-2 border-white/60 shadow-[0_0_10px_rgba(255,255,255,0.3)]'
                                }`}
                        >
                            {creatingPool ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Creating Pool...
                                </span>
                            ) : selectedMembers.length === 0 ? (
                                'Select Ships to Pool'
                            ) : !hasMinimumMembers ? (
                                'Need at Least 2 Ships'
                            ) : !hasNonNegativeSum ? (
                                'Invalid: Negative Pool Sum'
                            ) : !allRulesValid ? (
                                'Invalid: Rules Violated'
                            ) : (
                                'Create Pool'
                            )}
                        </button>

                        {!allRulesValid && selectedMembers.length > 0 && (
                            <p className="text-red-400 text-xs text-center mt-3">
                                Pool must satisfy all validation rules to proceed.
                            </p>
                        )}
                    </div>

                    {/* Info Panel */}
                    <div className="glass-card p-6 bg-gray-900/30">
                        <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Pooling Rules (Article 21)
                        </h4>
                        <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                            <li>Pool must have at least 2 members</li>
                            <li>Total pool CB must be ≥ 0</li>
                            <li>Deficit ships cannot exit worse than before</li>
                            <li>Surplus ships cannot exit with negative CB</li>
                            <li>CB is redistributed to balance the pool</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
