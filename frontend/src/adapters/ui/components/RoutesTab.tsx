import { useState, useEffect, useMemo } from 'react';
import type { Route } from '../../../core/domain/Route';
import { routeRepository } from '../../../shared/repositories';

export default function RoutesTab() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [allRoutes, setAllRoutes] = useState<Route[]>([]); // Store all routes for filter options
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        vesselType: '',
        fuelType: '',
        year: '',
    });

    // Get unique values for dropdowns
    const { vesselTypes, fuelTypes, years } = useMemo(() => {
        const vesselTypes = Array.from(new Set(allRoutes.map(r => r.vesselType))).sort();
        const fuelTypes = Array.from(new Set(allRoutes.map(r => r.fuelType))).sort();
        const years = Array.from(new Set(allRoutes.map(r => r.year))).sort((a, b) => b - a);
        return { vesselTypes, fuelTypes, years };
    }, [allRoutes]);

    // Fetch all routes initially to populate filter options
    useEffect(() => {
        const fetchAllRoutes = async () => {
            try {
                const data = await routeRepository.getRoutes({});
                setAllRoutes(data);
            } catch (error) {
                console.error('Failed to fetch routes for filters:', error);
            }
        };
        fetchAllRoutes();
    }, []);

    // Fetch filtered routes with debouncing
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchRoutes();
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [filters]);

    const fetchRoutes = async () => {
        setLoading(true);
        try {
            const filterParams: any = {};
            if (filters.vesselType) filterParams.vesselType = filters.vesselType;
            if (filters.fuelType) filterParams.fuelType = filters.fuelType;
            if (filters.year) filterParams.year = parseInt(filters.year);

            const data = await routeRepository.getRoutes(filterParams);
            setRoutes(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSetBaseline = async (routeId: string) => {
        try {
            await routeRepository.setBaseline(routeId);

            // Update local state immediately
            setRoutes(prevRoutes => prevRoutes.map(r => ({
                ...r,
                isBaseline: r.routeId === routeId
            })));

            alert('Baseline set successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to set baseline');
        }
    };

    const clearFilters = () => {
        setFilters({
            vesselType: '',
            fuelType: '',
            year: '',
        });
    };

    const hasActiveFilters = filters.vesselType || filters.fuelType || filters.year;

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                        <svg className="w-5 h-5 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filter Routes
                    </h3>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="text-sm text-gray-400 hover:text-neon-cyan transition-colors duration-200 flex items-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Clear Filters
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Vessel Type Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Vessel Type</label>
                        <div className="relative">
                            <select
                                className="input-field appearance-none pr-10 cursor-pointer"
                                value={filters.vesselType}
                                onChange={(e) => setFilters({ ...filters, vesselType: e.target.value })}
                            >
                                <option value="">All Vessel Types</option>
                                {vesselTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Fuel Type Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Fuel Type</label>
                        <div className="relative">
                            <select
                                className="input-field appearance-none pr-10 cursor-pointer"
                                value={filters.fuelType}
                                onChange={(e) => setFilters({ ...filters, fuelType: e.target.value })}
                            >
                                <option value="">All Fuel Types</option>
                                {fuelTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Year Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Year</label>
                        <div className="relative">
                            <select
                                className="input-field appearance-none pr-10 cursor-pointer"
                                value={filters.year}
                                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                            >
                                <option value="">All Years</option>
                                {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        <span className="text-xs text-gray-500">Active filters:</span>
                        {filters.vesselType && (
                            <span className="px-2 py-1 bg-neon-cyan/10 border border-neon-cyan/30 rounded text-xs text-neon-cyan">
                                Vessel: {filters.vesselType}
                            </span>
                        )}
                        {filters.fuelType && (
                            <span className="px-2 py-1 bg-neon-purple/10 border border-neon-purple/30 rounded text-xs text-neon-purple">
                                Fuel: {filters.fuelType}
                            </span>
                        )}
                        {filters.year && (
                            <span className="px-2 py-1 bg-green-500/10 border border-green-500/30 rounded text-xs text-green-400">
                                Year: {filters.year}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Results Summary */}
            <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center gap-2">
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin"></div>
                            <span>Loading routes...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>
                                Showing <strong className="text-neon-cyan">{routes.length}</strong> route{routes.length !== 1 ? 's' : ''}
                                {hasActiveFilters && <span className="text-gray-500"> (filtered)</span>}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Route ID</th>
                                <th>Vessel Type</th>
                                <th>Fuel Type</th>
                                <th>Year</th>
                                <th>GHG Intensity (gCO₂e/MJ)</th>
                                <th>Consumption (t)</th>
                                <th>Distance (km)</th>
                                <th>Emissions (t)</th>
                                <th>Baseline</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="text-center py-8 text-gray-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin"></div>
                                            Loading routes...
                                        </div>
                                    </td>
                                </tr>
                            ) : routes.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="text-center py-12">
                                        <div className="flex flex-col items-center gap-3">
                                            <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                            </svg>
                                            <div className="text-gray-400">
                                                <p className="font-medium">No routes found</p>
                                                {hasActiveFilters && (
                                                    <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                routes.map((route) => {
                                    const isBaseline = route.isBaseline;
                                    return (
                                        <tr key={route.routeId}>
                                            <td className="font-mono text-sm text-gray-300">{route.routeId}</td>
                                            <td>{route.vesselType}</td>
                                            <td>
                                                <span className="px-2 py-1 rounded bg-gray-800 text-xs border border-gray-700">
                                                    {route.fuelType}
                                                </span>
                                            </td>
                                            <td>{route.year}</td>
                                            <td className="font-mono text-neon-cyan">{route.ghgIntensity.toFixed(2)}</td>
                                            <td className="font-mono">{route.fuelConsumption.toLocaleString()}</td>
                                            <td className="font-mono">{route.distance.toLocaleString()}</td>
                                            <td className="font-mono">{route.totalEmissions.toLocaleString()}</td>
                                            <td>
                                                <button
                                                    onClick={() => handleSetBaseline(route.routeId)}
                                                    disabled={isBaseline}
                                                    className={`text-xs px-3 py-1 transition-all duration-200 ${isBaseline
                                                        ? 'bg-gray-800 text-gray-400 border border-gray-700 cursor-not-allowed'
                                                        : 'btn-neon'
                                                        }`}
                                                >
                                                    {isBaseline ? "Baseline" : "Set Baseline"}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
