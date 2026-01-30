import React, { useState, useEffect, useMemo } from 'react';
import { Map, List, Plus, Navigation, Search, Loader2, CheckCircle, LogOut, X } from 'lucide-react';
// Correct functionality: imports are relative to pages folder now, so we need to go up one level
import MapView from '../components/MapView';
import UpdateCard from '../components/UpdateCard';
import PostModal from '../components/PostModal';

import { CityUpdate, Coordinates, UpdateCategory, ViewState } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Demo initial data
const INITIAL_UPDATES: CityUpdate[] = [
    {
        id: '1',
        category: UpdateCategory.TRAFFIC,
        description: 'Heavy congestion due to road work on 5th Avenue.',
        timestamp: Date.now() - 1000 * 60 * 5, // 5 mins ago
        location: { lat: 40.7128, lng: -74.0060 },
        expiresAt: Date.now() + 3600000,
        likes: 12
    },
    {
        id: '2',
        category: UpdateCategory.EVENT,
        description: 'Pop-up farmers market near the central park entrance.',
        timestamp: Date.now() - 1000 * 60 * 30, // 30 mins ago
        location: { lat: 40.7138, lng: -74.0050 },
        expiresAt: Date.now() + 7200000,
        likes: 45
    },
    {
        id: '3',
        category: UpdateCategory.ISSUE,
        description: 'Street light malfunction at the intersection.',
        timestamp: Date.now() - 1000 * 60 * 15, // 15 mins ago
        location: { lat: 40.7118, lng: -74.0070 },
        expiresAt: Date.now() + 3600000,
        likes: 3
    }
];

// Helper for distance calculation (Haversine formula)
const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

const Home: React.FC = () => {
    // Auth State
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [updates, setUpdates] = useState<CityUpdate[]>(INITIAL_UPDATES);
    const [viewState, setViewState] = useState<ViewState>({
        mode: 'MAP',
        center: { lat: 40.7128, lng: -74.0060 }, // NYC default
        zoom: 15
    });
    const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [loadingLoc, setLoadingLoc] = useState(false);

    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);

    // Load user location on mount
    useEffect(() => {
        if ('geolocation' in navigator) {
            setLoadingLoc(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const coords = { lat: latitude, lng: longitude };
                    setUserLocation(coords);
                    setViewState(prev => ({
                        ...prev,
                        center: coords
                    }));
                },
                (err) => {
                    console.error("Geo error", err);
                    setLoadingLoc(false);
                }
            );
        }
    }, []);

    // Filter updates by time AND distance (e.g., within 20km of current view center)
    const activeUpdates = useMemo(() => {
        const now = Date.now();
        return updates.filter(u => {
            const isNotExpired = u.expiresAt > now;
            const distance = getDistanceFromLatLonInKm(
                viewState.center.lat, viewState.center.lng,
                u.location.lat, u.location.lng
            );
            return isNotExpired && distance < 20; // 20km radius
        }).sort((a, b) => b.timestamp - a.timestamp);
    }, [updates, viewState.center]);

    const handlePostUpdate = (description: string, category: UpdateCategory, location: Coordinates) => {
        const newUpdate: CityUpdate = {
            id: Date.now().toString(),
            category,
            description,
            timestamp: Date.now(),
            location: location,
            expiresAt: Date.now() + 3600000 * 2, // 2 hours
            likes: 0
        };

        setUpdates(prev => [newUpdate, ...prev]);
        setIsPostModalOpen(false);

        // Switch to map to see the drop
        setViewState(prev => ({ ...prev, mode: 'MAP', center: location }));

        // Show success notification
        setNotification({ message: 'Update posted successfully!', type: 'success' });
        setTimeout(() => setNotification(null), 3000);
    };



    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        // Close mobile search if open
        setShowMobileSearch(false);

        try {
            // Use OpenStreetMap Nominatim for geocoding
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
            );
            const data = await response.json();

            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                setViewState(prev => ({
                    ...prev,
                    center: { lat: parseFloat(lat), lng: parseFloat(lon) },
                    zoom: 13, // Standard city zoom
                    mode: 'MAP'
                }));
                setSearchQuery('');
                // setAiSummary(null); // Removed
            } else {
                alert('Location not found');
            }
        } catch (error) {
            console.error('Search failed', error);
            alert('Search failed. Please try again.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    return (
        <div className="h-screen w-full flex flex-col bg-slate-100 overflow-hidden relative">
            {/* Toast Notification */}
            {notification && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1000] animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className={`px-6 py-3 rounded-full shadow-xl text-white font-medium flex items-center space-x-2 ${notification.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
                        }`}>
                        <CheckCircle className="w-5 h-5" />
                        <span>{notification.message}</span>
                    </div>
                </div>
            )}

            {/* Top Header */}
            <header className="bg-white/90 backdrop-blur-md z-20 border-b border-slate-200 px-4 py-3 flex justify-between items-center shadow-sm shrink-0 gap-3 min-h-[60px]">
                {showMobileSearch ? (
                    // Mobile Search View
                    <div className="w-full flex items-center animate-in fade-in slide-in-from-top-2 duration-200">
                        <form onSubmit={handleSearch} className="flex-1 relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search city..."
                                autoFocus
                                className="w-full bg-slate-100 border border-slate-200 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all rounded-full py-2 pl-10 pr-4 text-sm outline-none text-slate-700"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            </div>
                        </form>
                        <button
                            onClick={() => {
                                setShowMobileSearch(false);
                                setSearchQuery('');
                            }}
                            className="ml-3 p-2 text-slate-500 hover:bg-slate-100 rounded-full"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    // Standard Header View
                    <>
                        {/* Logo Section */}
                        <div className="flex items-center space-x-2 shrink-0">
                            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                                <Navigation className="w-5 h-5" />
                            </div>
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-cyan-500 hidden sm:block">
                                CityPulse
                            </h1>
                        </div>

                        {/* Desktop Search Bar */}
                        <form onSubmit={handleSearch} className="flex-1 max-w-md relative hidden sm:block mx-4">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search city or place..."
                                className="w-full bg-slate-100 border border-slate-200 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all rounded-full py-2 pl-10 pr-4 text-sm outline-none text-slate-700 placeholder:text-slate-400"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            </div>
                        </form>

                        {/* Controls Section */}
                        <div className="flex items-center space-x-2 shrink-0">
                            {/* Mobile Search Toggle */}
                            <button
                                onClick={() => setShowMobileSearch(true)}
                                className="sm:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <Search className="w-5 h-5" />
                            </button>

                            {/* Desktop View Toggles */}
                            <div className="hidden md:flex bg-slate-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setViewState(prev => ({ ...prev, mode: 'MAP' }))}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewState.mode === 'MAP' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    Map View
                                </button>
                                <button
                                    onClick={() => setViewState(prev => ({ ...prev, mode: 'FEED' }))}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewState.mode === 'FEED' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    Live Feed
                                </button>
                            </div>

                            <button
                                onClick={() => setIsPostModalOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-full text-sm font-semibold shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center"
                            >
                                <Plus className="w-4 h-4 mr-1 md:mr-2" />
                                <span className="hidden md:inline">Post</span>
                                <span className="md:hidden">Post</span>
                            </button>

                            <button
                                onClick={handleLogout}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                                title="Log Out"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </>
                )}
            </header>

            {/* Main Content Area - Split for Desktop, Toggled for Mobile */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* Map Container */}
                <div className={`absolute inset-0 md:relative md:w-2/3 lg:w-3/4 transition-transform duration-300 ${viewState.mode === 'FEED' ? 'translate-x-[-100%] md:translate-x-0' : 'translate-x-0'
                    }`}>
                    <MapView
                        center={viewState.center}
                        zoom={viewState.zoom}
                        updates={activeUpdates}
                        onMarkerClick={(u) => {
                            console.log(u);
                        }}
                    />

                </div>

                {/* Feed Container */}
                <div className={`absolute inset-0 md:relative md:w-1/3 lg:w-1/4 bg-slate-50 z-10 transition-transform duration-300 flex flex-col border-l border-slate-200 ${viewState.mode === 'MAP' ? 'translate-x-[100%] md:translate-x-0' : 'translate-x-0'
                    }`}>
                    <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
                        <h2 className="font-bold text-slate-700">Nearby Updates</h2>
                        <span className="text-xs font-medium bg-slate-100 px-2 py-1 rounded text-slate-500">
                            {activeUpdates.length} Active
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
                        {activeUpdates.length === 0 ? (
                            <div className="text-center py-10 opacity-50 flex flex-col items-center justify-center h-40">
                                <div className="bg-slate-100 p-3 rounded-full mb-3">
                                    <Navigation className="w-6 h-6 text-slate-400" />
                                </div>
                                <p className="text-slate-500 font-medium">No updates in this area.</p>
                                <p className="text-xs text-slate-400 mt-1">Move the map or post something!</p>
                            </div>
                        ) : (
                            activeUpdates.map(update => (
                                <UpdateCard
                                    key={update.id}
                                    update={update}
                                    distance={getDistanceFromLatLonInKm(
                                        viewState.center.lat,
                                        viewState.center.lng,
                                        update.location.lat,
                                        update.location.lng
                                    )}
                                    onClick={() => {
                                        setViewState(prev => ({ ...prev, mode: 'MAP', center: update.location }));
                                    }}
                                />
                            ))
                        )}
                    </div>
                </div>

            </div>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden bg-white border-t border-slate-200 px-6 py-3 flex justify-around items-center z-30 shrink-0 safe-area-bottom">
                <button
                    onClick={() => setViewState(prev => ({ ...prev, mode: 'MAP' }))}
                    className={`flex flex-col items-center space-y-1 ${viewState.mode === 'MAP' ? 'text-blue-600' : 'text-slate-400'}`}
                >
                    <Map className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Map</span>
                </button>

                {/* Floating Action Button for Mobile within Nav area - visual overlap */}
                <div className="relative -top-6">
                    <button
                        onClick={() => setIsPostModalOpen(true)}
                        className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-4 rounded-full shadow-lg shadow-blue-200 hover:scale-105 transition-transform"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                </div>

                <button
                    onClick={() => setViewState(prev => ({ ...prev, mode: 'FEED' }))}
                    className={`flex flex-col items-center space-y-1 ${viewState.mode === 'FEED' ? 'text-blue-600' : 'text-slate-400'}`}
                >
                    <List className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Feed</span>
                </button>
            </div>

            {/* Modals */}
            <PostModal
                isOpen={isPostModalOpen}
                onClose={() => setIsPostModalOpen(false)}
                onSubmit={handlePostUpdate}
                loading={false}
                userLocation={userLocation}
                mapCenter={viewState.center}
            />
        </div>
    );
};

export default Home;
