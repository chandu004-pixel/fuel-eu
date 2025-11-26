import { useState, useEffect } from 'react';
import type { ComplianceStatus, BankEntry } from '../../../core/domain/Compliance';
import { complianceRepository } from '../../../shared/repositories';
import { API_BASE_URL } from '../../../shared/config';

export default function BankingTab() {
    const [year, setYear] = useState(new Date().getFullYear());
    const [shipId, setShipId] = useState('SHIP-001');
    const [status, setStatus] = useState<ComplianceStatus | null>(null);
    const [totalBanked, setTotalBanked] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [bankingHistory, setBankingHistory] = useState<BankEntry[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    // Banking form state
    const [bankAmount, setBankAmount] = useState('');
    const [applyAmount, setApplyAmount] = useState('');

    const fetchCompliance = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await complianceRepository.getCompliance(year, shipId);
            setStatus(data);
        } catch (err) {
            setError('Failed to fetch compliance data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTotalBanked = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/banking/total/${shipId}`);
            if (response.ok) {
                const data = await response.json();
                setTotalBanked(data.totalBanked || 0);
            }
        } catch (err) {
            console.error('Failed to fetch total banked:', err);
        }
    };

    const fetchBankingHistory = async () => {
        try {
            const records = await complianceRepository.getBankingRecords(shipId, year);
            setBankingHistory(records);
        } catch (err) {
            console.error('Failed to fetch banking history:', err);
        }
    };

    useEffect(() => {
        fetchCompliance();
        fetchTotalBanked();
        fetchBankingHistory();
    }, [year, shipId]);

    const handleBank = async () => {
        if (!status || status.cb_after <= 0) {
            setError('Cannot bank negative or zero CB');
            return;
        }

        const amount = parseFloat(bankAmount);
        if (!amount || amount <= 0) {
            setError('Please enter a valid amount to bank');
            return;
        }

        if (amount > status.cb_after) {
            setError(`Cannot bank more than available CB (${status.cb_after})`);
            return;
        }

        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await fetch(`${API_BASE_URL}/banking/bank`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shipId, year, amount })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to bank surplus');
            }

            setSuccessMessage(`Successfully banked ${amount} gCO₂e/MJ`);
            setBankAmount('');
            await fetchCompliance();
            await fetchTotalBanked();
            await fetchBankingHistory();
        } catch (err: any) {
            setError(err.message || 'Failed to bank surplus');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        const amount = parseFloat(applyAmount);
        if (!amount || amount <= 0) {
            setError('Please enter a valid amount to apply');
            return;
        }

        if (amount > totalBanked) {
            setError(`Insufficient banked surplus. Available: ${totalBanked}`);
            return;
        }

        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await fetch(`${API_BASE_URL}/banking/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shipId, year, amount })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to apply banked surplus');
            }

            setSuccessMessage(`Successfully applied ${amount} gCO₂e/MJ from banked surplus`);
            setApplyAmount('');
            await fetchCompliance();
            await fetchTotalBanked();
            await fetchBankingHistory();
        } catch (err: any) {
            setError(err.message || 'Failed to apply surplus');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const maxBankAmount = status?.cb_after || 0;
    const canBank = status && status.cb_after > 0;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header with Selectors */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-2xl font-bold">Banking & Compliance</h2>
                </div>

                <div className="flex gap-3">
                    {/* Ship Selector */}
                    <div className="flex items-center gap-2 bg-gray-900/50 p-2 rounded-lg border border-gray-800">
                        <label className="text-sm text-gray-400">Ship:</label>
                        <select
                            value={shipId}
                            onChange={(e) => setShipId(e.target.value)}
                            className="bg-gray-800 border-none rounded text-white px-3 py-1 focus:ring-1 focus:ring-neon-cyan outline-none"
                        >
                            <option value="SHIP-001">Ship 001</option>
                            <option value="SHIP-002">Ship 002</option>
                            <option value="SHIP-003">Ship 003</option>
                            <option value="SHIP-004">Ship 004</option>
                            <option value="SHIP-005">Ship 005</option>
                        </select>
                    </div>

                    {/* Year Selector */}
                    <div className="flex items-center gap-2 bg-gray-900/50 p-2 rounded-lg border border-gray-800">
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
            </div>

            {/* Success/Error Messages */}
            {successMessage && (
                <div className="p-4 bg-green-900/20 border border-green-900/50 rounded-lg text-green-400 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {successMessage}
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                </div>
            )}

            {/* Main KPI Cards */}
            {loading ? (
                <div className="glass-card p-8 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                        <div className="w-5 h-5 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin"></div>
                        Loading compliance data...
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* CB Before Banking */}
                    <div className="glass-card p-6 text-center">
                        <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">CB Before Banking</p>
                        <p className="text-3xl font-bold font-mono text-white">{status?.cb_before.toLocaleString() ?? '-'}</p>
                        <p className="text-xs text-gray-600 mt-1">gCO₂e/MJ</p>
                    </div>

                    {/* Applied Amount */}
                    <div className="glass-card p-6 text-center">
                        <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">Applied</p>
                        <p className="text-3xl font-bold font-mono text-purple-400">{status?.applied.toLocaleString() ?? 0}</p>
                        <p className="text-xs text-gray-600 mt-1">gCO₂e/MJ</p>
                    </div>

                    {/* CB After Banking */}
                    <div className="glass-card p-6 text-center">
                        <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">CB After Banking</p>
                        <p className={`text-3xl font-bold font-mono ${status && status.cb_after >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {status?.cb_after.toLocaleString() ?? '-'}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">gCO₂e/MJ</p>
                    </div>

                    {/* Total Banked */}
                    <div className="glass-card p-6 text-center border-2 border-neon-cyan/30">
                        <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">Total Banked</p>
                        <p className="text-3xl font-bold font-mono text-neon-cyan">{totalBanked.toLocaleString()}</p>
                        <p className="text-xs text-gray-600 mt-1">Available</p>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bank Surplus Card */}
                <div className="glass-card p-6 space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Bank Surplus</h3>
                            <p className="text-xs text-gray-500">Article 20 - Banking</p>
                        </div>
                    </div>

                    <p className="text-gray-400 text-sm">
                        Bank your positive compliance balance to use in future years. Only available if CB &gt; 0.
                    </p>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-400">Amount to Bank (gCO₂e/MJ)</label>
                        <input
                            type="number"
                            value={bankAmount}
                            onChange={(e) => setBankAmount(e.target.value)}
                            placeholder="Enter amount"
                            max={maxBankAmount}
                            min="0"
                            step="0.01"
                            disabled={!canBank}
                            className="input-field w-full"
                        />
                        <p className="text-xs text-gray-500">
                            Max available: <span className="text-neon-cyan font-mono">{maxBankAmount.toLocaleString()}</span>
                        </p>
                    </div>

                    <button
                        onClick={handleBank}
                        disabled={!canBank || !bankAmount || parseFloat(bankAmount) <= 0}
                        className={`w-full py-3 rounded-lg font-semibold transition-all ${!canBank || !bankAmount || parseFloat(bankAmount) <= 0
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                            }`}
                    >
                        Bank Surplus
                    </button>
                </div>

                {/* Apply Banking Card */}
                <div className="glass-card p-6 space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Apply Banking</h3>
                            <p className="text-xs text-gray-500">Use Banked Surplus</p>
                        </div>
                    </div>

                    <p className="text-gray-400 text-sm">
                        Use previously banked surplus to cover a deficit in the current year. Can only apply to negative CB.
                    </p>

                    {/* Validation Messages */}
                    {totalBanked <= 0 && (
                        <div className="p-3 bg-yellow-900/20 border border-yellow-900/50 rounded-lg text-yellow-400 text-xs">
                            ⚠️ No banked surplus available. Bank positive CB first.
                        </div>
                    )}
                    {(status?.cb_after ?? -1) >= 0 && totalBanked > 0 && (
                        <div className="p-3 bg-yellow-900/20 border border-yellow-900/50 rounded-lg text-yellow-400 text-xs">
                            ⚠️ Cannot apply to positive CB. Only deficit ships can use banked surplus.
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-400">Amount to Apply (gCO₂e/MJ)</label>
                        <input
                            type="number"
                            value={applyAmount}
                            onChange={(e) => setApplyAmount(e.target.value)}
                            placeholder="Enter amount"
                            max={totalBanked}
                            min="0"
                            step="0.01"
                            disabled={totalBanked <= 0 || (status?.cb_after ?? -1) >= 0}
                            className="input-field w-full"
                        />
                        <p className="text-xs text-gray-500">
                            Available to apply: <span className="text-neon-cyan font-mono">{totalBanked.toLocaleString()}</span>
                        </p>
                    </div>

                    <button
                        onClick={handleApply}
                        disabled={totalBanked <= 0 || !applyAmount || parseFloat(applyAmount) <= 0 || (status?.cb_after ?? -1) >= 0}
                        className={`w-full py-3 rounded-lg font-semibold transition-all ${totalBanked <= 0 || !applyAmount || parseFloat(applyAmount) <= 0 || (status?.cb_after ?? -1) >= 0
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20'
                            }`}
                    >
                        {totalBanked <= 0
                            ? 'No Banked Surplus Available'
                            : (status?.cb_after ?? -1) >= 0
                                ? 'Cannot Apply to Positive CB'
                                : 'Apply Banked Amount'
                        }
                    </button>
                </div>
            </div>

            {/* Banking History */}
            <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Banking History
                    </h3>
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="text-sm text-neon-cyan hover:text-cyan-300 transition-colors"
                    >
                        {showHistory ? 'Hide History' : 'Show History'}
                    </button>
                </div>

                {showHistory && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs text-gray-400 border-b border-gray-800 bg-gray-900/30">
                                    <th className="p-4 font-medium uppercase tracking-wider">Date</th>
                                    <th className="p-4 font-medium uppercase tracking-wider">Type</th>
                                    <th className="p-4 font-medium uppercase tracking-wider text-right">Amount</th>
                                    <th className="p-4 font-medium uppercase tracking-wider text-right">Year</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {bankingHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-gray-500">
                                            No banking records found
                                        </td>
                                    </tr>
                                ) : (
                                    bankingHistory.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-800/30 transition-colors">
                                            <td className="p-4 text-gray-300 font-mono text-sm">
                                                {new Date(record.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${record.amountGco2eq > 0
                                                    ? 'bg-blue-900/30 text-blue-400'
                                                    : 'bg-purple-900/30 text-purple-400'
                                                    }`}>
                                                    {record.amountGco2eq > 0 ? 'BANKED' : 'APPLIED'}
                                                </span>
                                            </td>
                                            <td className={`p-4 text-right font-mono font-bold ${record.amountGco2eq > 0 ? 'text-blue-400' : 'text-purple-400'
                                                }`}>
                                                {record.amountGco2eq > 0 ? '+' : ''}{record.amountGco2eq.toLocaleString()}
                                            </td>
                                            <td className="p-4 text-right text-gray-400 font-mono">
                                                {record.year}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Info Panel */}
            <div className="glass-card p-6 bg-gray-900/30">
                <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Banking Rules (Article 20)
                </h4>
                <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                    <li>Can only bank positive CB (CB &gt; 0)</li>
                    <li>Cannot bank more than available CB</li>
                    <li>Banked surplus can be used in future years to cover deficits</li>
                    <li>Applying banked surplus reduces the total banked amount</li>
                </ul>
            </div>
        </div >
    );
}
