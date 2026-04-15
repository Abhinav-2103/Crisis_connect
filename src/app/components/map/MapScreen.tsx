import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, X, Clock, AlertCircle, Loader2, Search, Building2, ChevronDown } from 'lucide-react';
import { needsApi } from '../../utils/api';
import { mockNeeds, mockVolunteers, mockNGOs } from '../../data/mockData';
import { motion, AnimatePresence } from 'motion/react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// India centered map defaults
const INDIA_CENTER = { lat: 22.5, lng: 82.0 };
const INDIA_ZOOM = 5;

interface Need {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  urgency: string;
  status: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  userPhone?: string;
  lat?: number;
  lng?: number;
  responses?: number;
  ngoId?: string;
  ngoName?: string;
  contact?: string;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
}

const categories = ['All', 'Food', 'Water', 'Shelter', 'Medical', 'Transport', 'Rescue'];

const urgencyStyles: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

const urgencyColors: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-300 border-red-500/40',
  high: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  low: 'bg-green-500/20 text-green-300 border-green-500/40',
};

const markerColorMap: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

const ngoColorMap: Record<string, string> = {
  'ngo-1': '#a855f7',
  'ngo-2': '#3b82f6',
  'ngo-3': '#10b981',
  'ngo-4': '#f59e0b',
};

function createNeedEmojiIcon(category: string, urgencyColor: string) {
  const categoryIcons: Record<string, string> = {
    Medical: '🏥', Food: '🍱', Water: '💧', Shelter: '🏕️', Transport: '🚐', Rescue: '🆘',
  };
  const emoji = categoryIcons[category] || '📍';
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 32px; height: 32px;
      background-color: #1e293b;
      border: 3px solid ${urgencyColor};
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5), 0 0 10px ${urgencyColor}88;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      cursor: pointer;
      transition: transform 0.2s;
    ">${emoji}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

// Calculate centroid (mean lat/lng) of volunteer positions
function calculateCentroid(volunteers: any[]) {
  if (!volunteers.length) return null;
  const lats = volunteers.map(v => v.lat).filter(Boolean);
  const lngs = volunteers.map(v => v.lng).filter(Boolean);
  if (!lats.length) return null;
  return {
    lat: lats.reduce((a, b) => a + b, 0) / lats.length,
    lng: lngs.reduce((a, b) => a + b, 0) / lngs.length,
  };
}

// Calculate radius that covers all volunteers (in meters) + padding
function calculateCoverageRadius(volunteers: any[], centroid: { lat: number; lng: number }) {
  if (!volunteers.length || !centroid) return 15000;
  const BASE_RADIUS_PER_VOL = 8000; // 8km per volunteer
  const MIN_RADIUS = 10000;
  // Also compute max distance from centroid to any volunteer
  let maxDist = 0;
  volunteers.forEach(v => {
    if (!v.lat || !v.lng) return;
    const dLat = (v.lat - centroid.lat) * 111320;
    const dLng = (v.lng - centroid.lng) * 111320 * Math.cos((centroid.lat * Math.PI) / 180);
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist > maxDist) maxDist = dist;
  });
  return Math.max(MIN_RADIUS, maxDist * 1.4 + volunteers.length * BASE_RADIUS_PER_VOL);
}

// Location Search Bar component
function LocationSearchBar({ mapInstance }: { mapInstance: L.Map | null }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searchMarker, setSearchMarker] = useState<L.Marker | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const searchLocation = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) { setResults([]); setShowDropdown(false); return; }
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=6&addressdetails=1&countrycodes=in`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data: SearchResult[] = await res.json();
      setResults(data);
      setShowDropdown(data.length > 0);
      setActiveIndex(-1);
    } catch (err) {
      console.error('Geocoding error:', err);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchLocation(val), 400);
  };

  const flyToResult = (result: SearchResult) => {
    if (!mapInstance) return;
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    if (searchMarker) searchMarker.remove();
    const pinIcon = L.divIcon({
      className: '',
      html: `<div style="position:relative; width:36px; height:36px;">
        <div style="width:36px;height:36px;background:linear-gradient(135deg,#a855f7,#3b82f6);border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 4px 16px rgba(168,85,247,0.6);"></div>
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:10px;height:10px;background:white;border-radius:50%;"></div>
      </div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    });
    const marker = L.marker([lat, lng], { icon: pinIcon })
      .bindPopup(`<div style="font-family:sans-serif;font-size:13px;max-width:200px;color:#111;"><strong>${result.display_name.split(',')[0]}</strong></div>`)
      .addTo(mapInstance).openPopup();
    setSearchMarker(marker);
    mapInstance.flyTo([lat, lng], 13, { duration: 1.2 });
    setQuery(result.display_name.split(',').slice(0, 2).join(','));
    setShowDropdown(false);
    setResults([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && activeIndex >= 0) { e.preventDefault(); flyToResult(results[activeIndex]); }
    else if (e.key === 'Escape') setShowDropdown(false);
  };

  const clearSearch = () => {
    setQuery(''); setResults([]); setShowDropdown(false);
    if (searchMarker) { searchMarker.remove(); setSearchMarker(null); }
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} className="absolute top-6 left-6" style={{ zIndex: 1000, width: '320px' }}>
      <div className="flex items-center gap-2 px-4 py-3 rounded-2xl backdrop-blur-xl bg-slate-900/90 border border-white/20 shadow-2xl shadow-black/40 transition-all duration-200 focus-within:border-purple-500/60">
        {isSearching ? <Loader2 className="w-4 h-4 text-purple-400 animate-spin flex-shrink-0" /> : <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />}
        <input ref={inputRef} type="text" value={query} onChange={handleInputChange} onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setShowDropdown(true)} placeholder="Search location in India..."
          className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none" />
        {query && <button onClick={clearSearch} className="text-gray-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>}
      </div>
      <AnimatePresence>
        {showDropdown && results.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
            className="mt-2 rounded-2xl backdrop-blur-xl bg-slate-900/95 border border-white/15 shadow-2xl overflow-hidden">
            {results.map((result, idx) => (
              <button key={result.place_id} onClick={() => flyToResult(result)} onMouseEnter={() => setActiveIndex(idx)}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors duration-100 ${idx === activeIndex ? 'bg-purple-500/20' : 'hover:bg-white/5'} ${idx !== 0 ? 'border-t border-white/5' : ''}`}>
                <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm text-white font-medium truncate">{result.display_name.split(',')[0]}</p>
                  <p className="text-xs text-gray-400 truncate">{result.display_name.split(',').slice(1, 3).join(',').trim()}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MapScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedNgo, setSelectedNgo] = useState<string>('all');
  const [selectedNeed, setSelectedNeed] = useState<Need | null>(null);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const volunteerLayerRef = useRef<L.LayerGroup | null>(null);
  const coverageLayerRef = useRef<L.LayerGroup | null>(null);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  useEffect(() => { loadNeeds(); }, [selectedCategory]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const map = L.map(mapRef.current, {
      center: [INDIA_CENTER.lat, INDIA_CENTER.lng],
      zoom: INDIA_ZOOM,
      zoomControl: true,
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    const volunteerLayer = L.layerGroup().addTo(map);
    const coverageLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    volunteerLayerRef.current = volunteerLayer;
    coverageLayerRef.current = coverageLayer;
    mapInstanceRef.current = map;
    setMapInstance(map);
    setMapLoading(false);

    return () => { map.remove(); mapInstanceRef.current = null; markersLayerRef.current = null; volunteerLayerRef.current = null; coverageLayerRef.current = null; setMapInstance(null); };
  }, []);

  // Update coverage circles when NGO selection changes
  useEffect(() => {
    if (!mapInstanceRef.current || !coverageLayerRef.current || !volunteerLayerRef.current) return;
    updateCoverageAndVolunteers();
  }, [selectedNgo, needs]);

  // Update need markers when needs change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    updateNeedMarkers();
  }, [needs, selectedNgo]);

  const updateNeedMarkers = () => {
    if (!markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();
    const filteredByNgo = selectedNgo === 'all' ? needs : needs.filter(n => n.ngoId === selectedNgo);
    filteredByNgo.forEach((need) => {
      if (!need.lat || !need.lng) return;
      const color = markerColorMap[need.urgency] || '#6366f1';
      const icon = createNeedEmojiIcon(need.category, color);
      const marker = L.marker([need.lat, need.lng], { icon }).on('click', () => {
        setSelectedNeed(need);
        mapInstanceRef.current?.panTo([need.lat!, need.lng!]);
      });
      marker.addTo(markersLayerRef.current!);
    });
  };

  const updateCoverageAndVolunteers = () => {
    if (!coverageLayerRef.current || !volunteerLayerRef.current) return;
    coverageLayerRef.current.clearLayers();
    volunteerLayerRef.current.clearLayers();

    const ngosToShow = selectedNgo === 'all' ? mockNGOs : mockNGOs.filter(n => n.id === selectedNgo);

    ngosToShow.forEach(ngo => {
      const ngoColor = ngoColorMap[ngo.id] || ngo.color || '#6366f1';
      const volunteers = mockVolunteers.filter(v => v.ngoId === ngo.id && v.lat && v.lng);

      // We no longer draw volunteer dots on the map per requirements.
      // They are only used mathematically to establish the geographical coverage bounding radius.

      // Draw coverage circle based on centroid and scatter of volunteers
      if (volunteers.length > 0) {
        const centroid = calculateCentroid(volunteers);
        if (centroid) {
          const radius = calculateCoverageRadius(volunteers, centroid);
          L.circle([centroid.lat, centroid.lng], {
            radius,
            color: ngoColor,
            fillColor: ngoColor,
            fillOpacity: 0.06,
            opacity: 0.35,
            weight: 2,
            dashArray: '8 6',
          }).bindTooltip(
            `<div style="font-size:12px;font-weight:bold;color:#fff;background:#111c;padding:4px 10px;border-radius:8px;border:1px solid ${ngoColor}55">${ngo.name}<br/><span style="font-weight:normal;font-size:11px;">${volunteers.length} volunteer${volunteers.length !== 1 ? 's' : ''} · ~${(radius / 1000).toFixed(0)}km radius</span></div>`,
            { sticky: false, direction: 'center' }
          ).addTo(coverageLayerRef.current!);

          // HQ pin
          L.circleMarker([centroid.lat, centroid.lng], {
            radius: 7,
            color: '#fff',
            fillColor: ngoColor,
            fillOpacity: 1,
            weight: 2,
          }).bindTooltip(`<b>${ngo.name}</b> HQ`, { sticky: true }).addTo(coverageLayerRef.current!);
        }
      }
    });
  };

  const loadNeeds = async () => {
    try {
      setLoading(true);
      const filters: any = { status: 'open' };
      if (selectedCategory !== 'All') filters.category = selectedCategory;
      let data: Need[] = [];
      try {
        const { needs: fetched } = await needsApi.getAll(filters);
        data = fetched?.length ? fetched : mockNeeds;
      } catch {
        data = mockNeeds;
      }
      setNeeds(data);
    } catch (error) {
      console.error('Failed to load needs:', error);
      setNeeds(mockNeeds);
    } finally {
      setLoading(false);
    }
  };

  const displayedNeeds = selectedNgo === 'all' ? needs : needs.filter(n => n.ngoId === selectedNgo);

  return (
    <div className="space-y-5">
      {/* Top controls row */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* NGO Filter */}
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={selectedNgo}
            onChange={(e) => setSelectedNgo(e.target.value)}
            className="appearance-none pl-10 pr-10 py-2.5 rounded-xl backdrop-blur-md text-sm font-medium border border-white/20 bg-white/10 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer min-w-[200px]"
          >
            <option value="all">All NGOs</option>
            {mockNGOs.map(ngo => (
              <option key={ngo.id} value={ngo.id}>{ngo.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2.5 rounded-full backdrop-blur-md text-sm font-medium border transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-purple-500/40 to-blue-500/40 border-purple-400/60 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-[calc(100vh-16rem)] rounded-2xl overflow-hidden border border-white/20 bg-gradient-to-br from-slate-900/90 via-purple-900/30 to-slate-900/90 backdrop-blur-sm">
        {/* Map Loading */}
        {mapLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-[1000] bg-slate-900/50 backdrop-blur-sm">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
              <p className="text-gray-300">Loading India Map...</p>
            </div>
          </div>
        )}

        <div ref={mapRef} className="w-full h-full" style={{ zIndex: 1 }}></div>

        {/* Location Search */}
        <LocationSearchBar mapInstance={mapInstance} />

        {/* NGO Legend — top right */}
        <div className="absolute top-6 right-6 p-4 rounded-2xl backdrop-blur-xl bg-slate-900/90 border border-white/20 shadow-xl" style={{ zIndex: 1000 }}>
          <div className="flex items-center gap-4 mb-3">
            <div>
              <p className="text-xs text-gray-400">Active Needs</p>
              <p className="text-2xl font-semibold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">{displayedNeeds.length}</p>
            </div>
            <div className="h-10 w-px bg-white/20"></div>
            <div>
              <p className="text-xs text-gray-400">Critical</p>
              <p className="text-2xl font-semibold text-red-400">{displayedNeeds.filter(m => m.urgency === 'critical').length}</p>
            </div>
          </div>
          {/* NGO color keys */}
          <div className="space-y-1.5 border-t border-white/10 pt-3">
            <p className="text-xs text-gray-500 mb-1.5">NGO Coverage</p>
            {mockNGOs.map(ngo => {
              const color = ngoColorMap[ngo.id] || ngo.color;
              const isSelected = selectedNgo === ngo.id || selectedNgo === 'all';
              return (
                <button
                  key={ngo.id}
                  onClick={() => setSelectedNgo(selectedNgo === ngo.id ? 'all' : ngo.id)}
                  className={`flex items-center gap-2 w-full text-left transition-opacity ${isSelected ? 'opacity-100' : 'opacity-40'}`}
                >
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }}></div>
                  <span className="text-xs text-gray-300 truncate">{ngo.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend — bottom left */}
        <div className="absolute bottom-6 left-6 p-4 rounded-xl backdrop-blur-xl bg-slate-900/90 border border-white/20 shadow-xl pointer-events-none" style={{ zIndex: 1000 }}>
          <h3 className="text-xs font-semibold text-gray-300 mb-2">Need Urgency</h3>
          <div className="space-y-1.5">
            {(['critical', 'high', 'medium', 'low'] as const).map((u) => (
              <div key={u} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${urgencyStyles[u]}`}></div>
                <span className="text-xs text-gray-300 capitalize">{u}</span>
              </div>
            ))}
            <div className="border-t border-white/10 pt-2 mt-2">
              <h4 className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Categories</h4>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                {Object.entries({
                  Medical: '🏥', Food: '🍱', Water: '💧', Shelter: '🏕️', Transport: '🚐', Rescue: '🆘'
                }).map(([cat, emoji]) => (
                  <div key={cat} className="flex items-center gap-1.5">
                    <span className="text-sm">{emoji}</span>
                    <span className="text-[10px] text-gray-400">{cat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Need Detail Popup */}
        {selectedNeed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute bottom-6 right-6 w-80 p-6 rounded-2xl bg-gradient-to-br from-slate-900/95 via-purple-900/30 to-slate-900/95 border border-white/20 backdrop-blur-xl shadow-2xl"
            style={{ zIndex: 1001 }}
          >
            <button onClick={() => setSelectedNeed(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${urgencyStyles[selectedNeed.urgency]}`}>
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${urgencyColors[selectedNeed.urgency]}`}>
                  {selectedNeed.urgency.toUpperCase()}
                </span>
              </div>
            </div>

            {selectedNeed.ngoName && (
              <div className="mb-3">
                <span className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold border w-fit"
                  style={{ color: ngoColorMap[selectedNeed.ngoId || ''] || '#6366f1', borderColor: (ngoColorMap[selectedNeed.ngoId || ''] || '#6366f1') + '55', backgroundColor: (ngoColorMap[selectedNeed.ngoId || ''] || '#6366f1') + '18' }}>
                  <Building2 className="w-3 h-3" />
                  {selectedNeed.ngoName}
                </span>
              </div>
            )}

            <h3 className="text-lg font-semibold mb-2">{selectedNeed.title}</h3>
            <p className="text-sm text-gray-300 mb-4 line-clamp-3">{selectedNeed.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span>{selectedNeed.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>{new Date(selectedNeed.timestamp).toLocaleString('en-IN')}</span>
              </div>
              {selectedNeed.contact && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="text-purple-400">📞</span>
                  <span>{selectedNeed.contact}</span>
                </div>
              )}
            </div>

            <button className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-200 font-medium text-sm">
              Respond to Need
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}