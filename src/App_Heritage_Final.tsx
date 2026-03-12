import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  Navigation, 
  Filter, 
  Star, 
  Clock, 
  Phone, 
  Globe, 
  ChevronRight,
  LayoutDashboard,
  Search,
  BookOpen,
  CloudRain,
  Activity,
  LogOut,
  Menu,
  X,
  AlertCircle,
  ShieldCheck,
  TrendingUp,
  Wind,
  Target,
  Trophy,
  Lock,
  Award,
  Thermometer,
  Waves,
  Zap,
  Flower2,
  Map as MapIcon,
  Layers
} from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// DTE Ecosystem Services
import { auth, db } from './firebase';
import { golfAPI, GolfCourse, TeeTime } from './services/golfAPIService';
import { handleClubhouseBooking } from './services/fluffIntegration';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  // ── SYSTEM STATE ──
  const [user, setUser] = useState<User | null>(null);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Closed by default for cleaner entry
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  
  // ── DATA STATE ──
  const [courses, setCourses] = useState<GolfCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<GolfCourse | null>(null);
  const [teeTimes, setTeeTimes] = useState<TeeTime[]>([]);
  
  // ── FILTER STATE ──
  const [searchRadius, setSearchRadius] = useState(25);
  const [maxPrice, setMaxPrice] = useState(150);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [playerCount, setPlayerCount] = useState(4);

  // Uplink Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Uplink Location & Search
  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      performLiveSearch();
    }
  }, [userLocation, searchRadius]);

  const getUserLocation = () => {
    setLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        () => {
          setUserLocation({ latitude: 41.8781, longitude: -87.6298 });
          setLoading(false);
        }
      );
    }
  };

  const performLiveSearch = async () => {
    if (!userLocation) return;
    setLoading(true);
    try {
      const results = await golfAPI.searchCourses({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        radius: searchRadius
      });
      const coursesWithDistance = results.map(course => ({
        ...course,
        distance: golfAPI.calculateDistance(userLocation.latitude, userLocation.longitude, course.latitude, course.longitude)
      }));
      setCourses(coursesWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0)));
    } catch (err: any) {
      loadMockCourses();
    } finally {
      setLoading(false);
    }
  };

  const loadMockCourses = () => {
    const mockCourses: GolfCourse[] = [
      {
        id: '1',
        name: 'Pebble Beach Golf Links',
        address: '1700 17-Mile Drive',
        city: 'Pebble Beach',
        state: 'CA',
        zipCode: '93953',
        latitude: 36.5674,
        longitude: -121.9500,
        rating: 4.9,
        holes: 18,
        par: 72,
        distance: 12.4,
        photoUrl: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800'
      },
      {
        id: '2',
        name: 'Augusta National',
        address: '2604 Washington Rd',
        city: 'Augusta',
        state: 'GA',
        zipCode: '30904',
        latitude: 33.5028,
        longitude: -82.0200,
        rating: 5.0,
        holes: 18,
        par: 72,
        distance: 45.2,
        photoUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800'
      }
    ];
    setCourses(mockCourses);
  };

  const handleCourseSelect = async (course: GolfCourse) => {
    setSelectedCourse(course);
    setLoading(true);
    try {
      const times = await golfAPI.getTeeTimes(course.id, selectedDate);
      setTeeTimes(times.filter(t => t.price <= maxPrice));
    } catch (err) {
      setTeeTimes([
        { id: 't1', courseId: course.id, time: '7:30 AM', date: selectedDate, availableSlots: 4, price: 85, holes: 18 },
        { id: 't2', courseId: course.id, time: '9:00 AM', date: selectedDate, availableSlots: 2, price: 110, holes: 18 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (teeTime: TeeTime) => {
    if (!selectedCourse) return;
    setLoading(true);
    try {
      const result = await handleClubhouseBooking(teeTime, selectedCourse, playerCount);
      if (result.success) {
        alert(`✅ Reservation Confirmed: Your round at ${selectedCourse.name} is secured.`);
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      alert(`❌ Booking Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#000000] text-white font-space mesh-bg overflow-hidden">
      
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className={cn(
        "glass-surface hidden md:flex flex-col transition-all duration-700 z-50 border-r border-white/5",
        sidebarOpen ? "w-[360px]" : "w-[120px]"
      )}>
        {/* Brand Section */}
        <div className="p-12 flex flex-col gap-8 h-[220px] border-b border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-accent/40 via-accent/5 to-transparent" />
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/60 rounded-[24px] flex items-center justify-center shrink-0 shadow-[0_0_50px_rgba(0,255,204,0.35)] rotate-3 group-hover:rotate-0 transition-transform duration-700">
              <span className="font-black text-black text-4xl tracking-tighter">D</span>
            </div>
            {sidebarOpen && (
              <div className="animate-in fade-in slide-in-from-left-6 duration-1000">
                <h1 className="font-display text-4xl tracking-tight leading-none text-glow uppercase">Clubhouse</h1>
                <p className="text-[10px] font-tech text-accent/50 uppercase tracking-[0.6em] mt-3">Elite Member Portal</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <div className="flex items-center gap-3 bg-white/[0.03] p-3 rounded-2xl border border-white/5">
              <Award className="text-yellow-500 w-5 h-5 shadow-[0_0_15px_rgba(234,179,8,0.4)]" />
              <div className="flex flex-col">
                <span className="text-[9px] font-tech text-white/40 uppercase tracking-widest leading-none">Heritage Status</span>
                <span className="text-[10px] font-bold text-yellow-500/90 uppercase mt-1 tracking-tighter text-nowrap">Augusta Circle • 8x Patron</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-10 space-y-6 mt-6">
          <NavItem 
            icon={<LayoutDashboard size={28} />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            expanded={sidebarOpen}
            onClick={() => setActiveTab('dashboard')}
          />
          <NavItem 
            icon={<Search size={28} />} 
            label="The Links" 
            active={activeTab === 'search'} 
            expanded={sidebarOpen}
            onClick={() => setActiveTab('search')}
          />
          <NavItem 
            icon={<BookOpen size={28} />} 
            label="The Ledger" 
            active={activeTab === 'ledger'} 
            expanded={sidebarOpen}
            onClick={() => setActiveTab('ledger')}
          />
          <NavItem 
            icon={<CloudRain size={28} />} 
            label="Caddie Intel" 
            active={activeTab === 'weather'} 
            expanded={sidebarOpen}
            onClick={() => setActiveTab('weather')}
          />
        </nav>

        {/* User Card */}
        <div className="p-10 border-t border-white/5 bg-white/[0.01]">
          {sidebarOpen ? (
            <div className="flex flex-col gap-5 animate-in fade-in duration-1000">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-tech uppercase tracking-widest text-white/30">Locker No.</span>
                <span className="text-[10px] font-mono text-accent bg-accent/10 px-3 py-1 rounded-full uppercase border border-accent/20 font-bold">DT-08</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-accent animate-pulse shadow-[0_0_20px_rgba(0,255,204,0.7)]" />
                <span className="text-[12px] font-tech uppercase tracking-[0.3em] text-white/90">System: Operational</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-4 h-4 rounded-full bg-accent animate-pulse shadow-[0_0_20px_rgba(0,255,204,0.7)]" />
            </div>
          )}
        </div>
      </aside>

      {/* ── MOBILE NAVIGATION ── */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 h-20 glass-surface rounded-[30px] z-[100] flex items-center justify-around px-6 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        <MobileNavItem icon={<LayoutDashboard size={22} />} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <MobileNavItem icon={<Search size={22} />} active={activeTab === 'search'} onClick={() => setActiveTab('search')} />
        <MobileNavItem icon={<BookOpen size={22} />} active={activeTab === 'ledger'} onClick={() => setActiveTab('ledger')} />
        <MobileNavItem icon={<CloudRain size={22} />} active={activeTab === 'weather'} onClick={() => setActiveTab('weather')} />
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Responsive Header */}
        <header className="h-[100px] md:h-[130px] border-b border-white/5 flex items-center justify-between px-8 md:px-20 bg-black/40 backdrop-blur-3xl z-40 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
          <div className="flex items-center gap-6 md:gap-12">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex p-5 hover:bg-white/5 rounded-[22px] transition-all text-white/20 hover:text-accent border border-transparent hover:border-white/5 active:scale-95 shadow-2xl"
            >
              {sidebarOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
            <div className="md:hidden w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,255,204,0.4)]">
              <span className="font-black text-black text-xl">D</span>
            </div>
            <div className="h-8 md:h-12 w-px bg-white/10" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2 md:gap-4 text-[10px] md:text-[12px] font-tech text-accent/80 tracking-[0.3em] md:tracking-[0.5em] uppercase leading-none">
                <ShieldCheck size={14} className="text-accent md:hidden" />
                <ShieldCheck size={18} className="text-accent hidden md:block" />
                <span>Sector Alpha Verified</span>
              </div>
              <p className="text-[8px] md:text-[11px] font-mono text-white/20 uppercase mt-1 md:mt-2.5 tracking-widest flex items-center gap-2 md:gap-3">
                <Target size={10} className="text-accent/40 md:hidden" />
                <Target size={14} className="text-accent/40 hidden md:block" />
                AUGUSTA-ALPHA-8
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 md:gap-12 group cursor-pointer">
            <div className="text-right hidden sm:block">
              <p className="text-[9px] md:text-[11px] font-tech text-white/20 uppercase tracking-[0.6em] mb-1 md:mb-2 leading-none">Member</p>
              <p className="text-sm md:text-lg font-bold uppercase tracking-tight group-hover:text-accent transition-colors duration-700 leading-none">{user?.displayName || 'DREW T ERNST'}</p>
            </div>
            <div className="relative">
              <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-[24px] border border-white/10 bg-accent/[0.02] flex items-center justify-center font-black text-xs md:text-base text-accent transition-all duration-1000 group-hover:border-accent/50 group-hover:shadow-[0_0_50px_rgba(0,255,204,0.3)] group-hover:-rotate-12 ring-1 ring-white/5 overflow-hidden">
                {user?.email?.substring(0,2).toUpperCase() || 'DE'}
              </div>
              <div className="absolute -bottom-1 -right-1 md:-bottom-1.5 md:-right-1.5 w-4 h-4 md:w-6 md:h-6 bg-black rounded-lg md:rounded-xl border-2 border-accent/20 p-1 md:p-1.5 flex items-center justify-center shadow-2xl">
                <div className="w-full h-full bg-accent rounded-sm animate-pulse" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-20 space-y-16 md:space-y-24 pb-32 md:pb-20">
          
          {activeTab === 'weather' ? (
            <CaddieIntelView location={userLocation} />
          ) : activeTab === 'ledger' ? (
            <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 md:mb-16 border-b border-white/5 pb-12">
                <div>
                  <h3 className="font-display text-6xl md:text-8xl tracking-tighter mb-4 uppercase leading-none text-glow">The Ledger</h3>
                  <div className="flex items-center gap-6">
                    <p className="text-[10px] md:text-[12px] font-tech text-white/20 uppercase tracking-[0.8em]">Round Logs</p>
                    <div className="h-1.5 w-1.5 rounded-full bg-accent/40 shadow-[0_0_15px_rgba(0,255,204,0.5)]" />
                    <span className="text-[10px] md:text-[11px] font-mono text-accent uppercase tracking-widest">3 Rounds Verified</span>
                  </div>
                </div>
                <button className="bg-white text-black px-10 md:px-12 py-4 md:py-5 rounded-[24px] md:rounded-[30px] font-black uppercase text-[10px] md:text-xs hover:bg-accent transition-all hover:scale-105 active:scale-95 shadow-3xl w-full md:w-auto">Start New Round</button>
              </div>
              <Scorecard courseName="Pebble Beach Golf Links" date="March 11, 2026" />
            </div>
          ) : !selectedCourse && activeTab === 'dashboard' ? (
            <div className="relative h-[450px] md:h-[750px] rounded-[40px] md:rounded-[100px] overflow-hidden border border-white/10 shadow-[0_80px_160px_rgba(0,0,0,1)] group ring-1 ring-white/5">
              <img 
                src="https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1600" 
                className="w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-[15s] ease-out grayscale group-hover:grayscale-0"
                alt="Championship Course"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              
              <div className="absolute bottom-12 left-8 md:bottom-32 md:left-24 max-w-5xl animate-in fade-in slide-in-from-bottom-16 duration-[2000ms]">
                <div className="flex flex-wrap items-center gap-4 md:gap-8 mb-6 md:mb-12">
                  <div className="flex items-center gap-3 bg-accent text-black text-[9px] md:text-[12px] font-black px-4 md:px-10 py-2 md:py-4 rounded-full uppercase tracking-[0.4em] md:tracking-[0.6em] shadow-[0_0_60px_rgba(0,255,204,0.8)]">
                    <Award size={14} className="md:w-[18px] md:h-[18px]" />
                    CHAIRMAN'S CHOICE
                  </div>
                  <div className="flex items-center gap-3 md:gap-4 text-[9px] md:text-[12px] font-tech text-white/40 uppercase tracking-widest border border-white/10 px-4 md:px-10 py-2 md:py-4 rounded-full backdrop-blur-3xl">
                    <TrendingUp size={16} className="text-accent md:w-[22px] md:h-[22px]" />
                    MEMBER ACCESS: PRIORITY
                  </div>
                </div>
                <h2 className="font-display text-7xl md:text-[18rem] mb-6 md:mb-12 leading-[0.8] md:leading-[0.6] tracking-tighter text-glow opacity-95 uppercase">PEBBLE BEACH</h2>
                <p className="text-white/30 mb-8 md:mb-20 font-medium text-lg md:text-4xl leading-snug md:leading-tight max-w-3xl border-l-2 border-accent/20 pl-6 md:pl-16 italic">"The ultimate meeting of land and sea."</p>
                <div className="flex flex-col sm:flex-row gap-4 md:gap-12">
                  <button className="bg-white text-black px-10 md:px-24 py-4 md:py-10 rounded-[24px] md:rounded-[50px] font-black uppercase text-xs md:text-lg hover:bg-accent transition-all hover:scale-105 active:scale-95 shadow-[0_50px_100px_rgba(0,0,0,0.7)] flex items-center justify-center gap-4 md:gap-8 group/btn">
                    Secure Tee Time
                    <ChevronRight size={20} className="md:w-[28px] md:h-[28px] group-hover/btn:translate-x-4 transition-transform duration-700" />
                  </button>
                  <button className="bg-white/[0.02] backdrop-blur-3xl text-white px-10 md:px-24 py-4 md:py-10 rounded-[24px] md:rounded-[50px] font-black uppercase text-xs md:text-lg border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-4 md:gap-8">
                    <Activity size={20} className="text-accent md:w-[32px] md:h-[32px]" />
                    Course Intel
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {/* Finder Section */}
          {(activeTab === 'search' || (activeTab === 'dashboard' && !selectedCourse)) && !selectedCourse && (
            <section className="animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-700">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-16 md:mb-24 border-b border-white/5 pb-16 md:pb-20">
                <div>
                  <h3 className="font-display text-7xl md:text-9xl tracking-tighter mb-4 md:mb-6 uppercase leading-none text-glow">The Links</h3>
                  <div className="flex items-center gap-6 md:gap-10">
                    <p className="text-[10px] md:text-[13px] font-tech text-white/20 uppercase tracking-[0.6em] md:tracking-[1em]">Championship Network Finder</p>
                    <div className="h-1.5 md:h-2.5 w-1.5 md:w-2.5 rounded-full bg-accent/30" />
                    <span className="text-[9px] md:text-[12px] font-mono text-accent/80 uppercase tracking-[0.2em] md:tracking-[0.3em] font-black">{courses.length} DESTINATIONS ONLINE</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-6 md:gap-12 items-stretch sm:items-center">
                  <div className="flex items-center justify-between gap-4 bg-white/[0.01] border border-white/5 p-4 md:p-6 rounded-[30px] md:rounded-[45px] shadow-4xl ring-1 ring-white/5">
                    <div className="flex items-center gap-4 md:gap-8 px-2 sm:px-6">
                      <span className="text-[9px] md:text-[12px] font-tech text-white/20 uppercase tracking-[0.3em] md:tracking-[0.5em] hidden sm:block">Range</span>
                      <input 
                        type="range" min="5" max="100" value={searchRadius} 
                        onChange={(e) => setSearchRadius(Number(e.target.value))}
                        className="accent-accent w-full sm:w-48 lg:w-80 h-1.5 md:h-2.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                      />
                      <span className="text-[12px] md:text-[16px] font-mono text-accent font-black">{searchRadius}MI</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 sm:gap-6">
                    <button 
                      onClick={() => setViewMode(viewMode === 'grid' ? 'map' : 'grid')}
                      className="flex-1 sm:flex-none p-6 md:p-10 bg-white/[0.01] border border-white/5 rounded-[30px] md:rounded-[45px] hover:border-accent/50 transition-all text-white/20 hover:text-accent shadow-4xl ring-1 ring-white/5 flex items-center justify-center gap-4"
                    >
                      {viewMode === 'grid' ? <MapIcon size={24} className="md:w-[40px] md:h-[40px]" /> : <Layers size={24} className="md:w-[40px] md:h-[40px]" />}
                      <span className="md:hidden font-tech text-[10px] uppercase tracking-widest">Toggle View</span>
                    </button>
                    <button className="flex-1 sm:flex-none p-6 md:p-10 bg-white/[0.01] border border-white/5 rounded-[30px] md:rounded-[45px] hover:border-accent/50 transition-all text-white/20 hover:text-accent shadow-4xl ring-1 ring-white/5 flex items-center justify-center">
                      <Filter size={24} className="md:w-[40px] md:h-[40px]" />
                    </button>
                  </div>
                </div>
              </div>

              {viewMode === 'map' ? (
                <div className="h-[600px] md:h-[800px] glass-surface rounded-[60px] md:rounded-[100px] border border-white/10 flex items-center justify-center overflow-hidden relative group">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526080652727-5e77c7f59dd3?w=1600')] bg-cover opacity-40 grayscale group-hover:grayscale-0 transition-all duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                  <div className="relative z-10 text-center space-y-8 p-12">
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-accent/10 backdrop-blur-3xl rounded-full flex items-center justify-center mx-auto border border-accent/20 animate-pulse">
                      <Navigation size={40} className="text-accent md:w-[60px] md:h-[60px]" />
                    </div>
                    <h4 className="font-display text-5xl md:text-7xl uppercase tracking-tighter">Satellite Uplink Pending</h4>
                    <p className="text-[11px] md:text-[14px] font-tech text-white/40 uppercase tracking-[0.5em] max-w-md mx-auto">Requires Google Maps/Mapbox Integration for Overhead Tactical Display</p>
                    <button className="bg-white text-black px-10 md:px-16 py-4 md:py-6 rounded-full font-black uppercase text-[10px] md:text-xs tracking-widest shadow-3xl hover:bg-accent transition-all">Authorize GPS Line</button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-20 pb-40">
                  {loading && !courses.length ? (
                    [1,2,3].map(i => (
                      <div key={i} className="aspect-[4/5] bg-white/[0.01] rounded-[60px] md:rounded-[100px] border border-white/5 animate-pulse p-12 md:p-20 flex flex-col gap-12" />
                    ))
                  ) : (
                    courses.map(course => (
                      <CourseCard key={course.id} course={course} onClick={() => handleCourseSelect(course)} />
                    ))
                  )}
                </div>
              )}
            </section>
          )}

          {selectedCourse && (
            <TeeTimeView course={selectedCourse} teeTimes={teeTimes} onBack={() => setSelectedCourse(null)} onBook={handleBooking} loading={loading} />
          )}
        </div>
      </main>
    </div>
  );
}

const MobileNavItem = ({ icon, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "p-4 rounded-2xl transition-all duration-500 relative",
      active ? "text-accent bg-accent/10" : "text-white/20"
    )}
  >
    {active && <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full shadow-[0_0_10px_rgba(0,255,204,1)]" />}
    {icon}
  </button>
);

const NavItem = ({ icon, label, active, expanded, onClick }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex items-center gap-8 w-full p-8 rounded-[40px] transition-all duration-700 group relative overflow-hidden",
      active ? "bg-accent/10 text-accent border border-accent/20 shadow-[0_0_80px_rgba(0,255,204,0.25)]" : "text-white/20 hover:text-white hover:bg-white/[0.03] border border-transparent"
    )}
  >
    {active && <div className="absolute left-0 w-3 h-14 bg-accent rounded-r-full shadow-[10px_0_50px_rgba(0,255,204,1)]" />}
    <div className={cn("shrink-0 transition-all duration-700", active ? "text-accent scale-125 rotate-6" : "group-hover:text-white group-hover:translate-x-3")}>{icon}</div>
    {expanded && (
      <span className="text-[17px] font-black uppercase tracking-[0.4em] overflow-hidden whitespace-nowrap">{label}</span>
    )}
  </button>
);

const CourseCard = ({ course, onClick }: any) => (
  <div 
    onClick={onClick}
    className="group cursor-pointer glass-surface rounded-[60px] md:rounded-[80px] overflow-hidden transition-all duration-1000 hover:border-accent/50 hover:shadow-[0_100px_200px_rgba(0,0,0,1)] hover:translate-y-[-24px] kinetic-border"
  >
    <div className="aspect-[4/3] overflow-hidden relative">
      <img 
        src={course.photoUrl || 'https://images.unsplash.com/photo-1592919505780-303950717480?w=800'} 
        className="w-full h-full object-cover group-hover:scale-150 transition-transform duration-[10s] opacity-30 group-hover:opacity-100 grayscale group-hover:grayscale-0" 
        alt={course.name} 
      />
      <div className="absolute top-8 right-8 md:top-12 md:right-12 bg-black/90 backdrop-blur-3xl px-6 py-2 md:px-10 md:py-4 rounded-full border border-white/10 flex items-center gap-4 md:gap-6 shadow-4xl">
        <Star size={16} className="text-yellow-500 fill-yellow-500 md:w-6 md:h-6" />
        <span className="text-[14px] md:text-[18px] font-black tracking-tighter">{course.rating || '4.5'}</span>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
      <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12">
        <div className="bg-accent/30 backdrop-blur-3xl px-5 py-2 md:px-8 md:py-3.5 rounded-2xl md:rounded-[30px] border border-accent/50 flex items-center gap-3 md:gap-5 shadow-3xl">
          <MapPin size={16} className="text-accent md:w-6 md:h-6" />
          <span className="text-[11px] md:text-[16px] font-mono text-white font-black tracking-tight uppercase whitespace-nowrap">{course.distance} MILES</span>
        </div>
      </div>
    </div>
    <div className="p-10 md:p-20">
      <h4 className="font-display text-4xl md:text-7xl mb-4 md:mb-6 group-hover:text-accent transition-colors duration-1000 leading-none tracking-tight uppercase text-glow">{course.name}</h4>
      <div className="flex items-center gap-4 md:gap-6 text-[11px] md:text-[14px] font-tech text-white/20 uppercase tracking-[0.6em] md:tracking-[0.8em] mb-10 md:mb-16 border-l-2 border-accent/20 pl-6 md:pl-10">
        {course.city}, {course.state}
      </div>
      <div className="flex justify-between items-center text-[10px] md:text-[12px] font-mono text-white/10 uppercase tracking-[0.4em] md:tracking-[0.6em] border-t border-white/5 pt-10 md:pt-16">
        <div className="flex items-center gap-3 md:gap-5 bg-white/[0.03] px-4 py-2 md:px-8 md:py-4 rounded-2xl md:rounded-3xl border border-white/5">
          <span className="text-accent font-black text-lg md:text-2xl">18</span>
          <span>Holes</span>
        </div>
        <div className="flex items-center gap-3 md:gap-5">
          <span className="text-white/20 hidden sm:block">TOURNAMENT PAR</span>
          <span className="text-white font-black text-xl md:text-4xl">{course.par || 72}</span>
        </div>
      </div>
    </div>
  </div>
);

const TeeTimeView = ({ course, teeTimes, onBack, onBook, loading }: any) => (
  <div className="animate-in fade-in duration-1000 slide-in-from-right-20">
    <button 
      onClick={onBack} 
      className="mb-12 md:mb-24 text-[12px] md:text-[16px] font-tech text-accent uppercase tracking-[0.6em] md:tracking-[1em] flex items-center gap-6 md:gap-10 hover:translate-x-[-15px] transition-all group"
    >
      <div className="bg-accent/10 p-4 md:p-6 rounded-2xl md:rounded-[40px] group-hover:bg-accent/20 transition-colors border border-accent/20 shadow-4xl">
        <ChevronRight size={24} className="rotate-180 md:w-10 md:h-10" />
      </div>
      <span className="hidden sm:block">Return to Global Network</span>
      <span className="sm:hidden text-[10px]">Back</span>
    </button>
    
    <div className="glass-surface rounded-[60px] md:rounded-[120px] p-12 md:p-40 mb-16 md:mb-32 relative overflow-hidden ring-1 ring-white/10 shadow-[0_120px_240px_rgba(0,0,0,1)]">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] md:w-[1200px] md:h-[1200px] bg-accent/[0.05] blur-[200px] md:blur-[300px] rounded-full translate-x-1/2 -translate-y-1/2" />
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row items-start justify-between gap-12 md:gap-24">
          <div className="space-y-8 md:space-y-16">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 md:gap-10">
              <span className="bg-accent text-black px-6 md:px-12 py-3 md:py-5 rounded-full border border-accent/20 font-black text-[10px] md:text-[14px] tracking-[0.4em] md:tracking-[0.8em] uppercase shadow-[0_0_80px_rgba(0,255,204,0.6)] w-fit">DEPLOYMENT SECURED</span>
              <div className="flex items-center gap-4 md:gap-6 text-[10px] md:text-[14px] font-tech text-white/30 uppercase tracking-[0.4em] md:tracking-[0.6em]">
                <ShieldCheck size={20} className="text-accent md:w-7 md:h-7" />
                Patron Access Verified
              </div>
            </div>
            <h2 className="font-display text-7xl md:text-[20rem] mb-10 md:mb-16 tracking-tighter leading-[0.8] md:leading-[0.65] uppercase text-glow shadow-accent">{course.name}</h2>
            <div className="flex flex-col sm:flex-row flex-wrap gap-8 md:gap-20 text-white/40 text-[11px] md:text-[16px] font-tech uppercase tracking-[0.5em] md:tracking-[0.8em] items-start sm:items-center">
              <div className="flex items-center gap-4 md:gap-8 bg-white/[0.02] px-6 md:px-12 py-3 md:py-6 rounded-[25px] md:rounded-[45px] border border-white/5 shadow-3xl"><MapPin size={20} className="text-accent md:w-9 md:h-9" /> {course.address}</div>
              <div className="flex items-center gap-4 md:gap-8 bg-white/[0.02] px-6 md:px-12 py-3 md:py-6 rounded-[25px] md:rounded-[45px] border border-white/5 shadow-3xl"><Phone size={18} className="text-accent md:w-8 md:h-8" /> {course.phone || 'ENCRYPTED MEMBER LINE'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="space-y-10 md:space-y-16 max-w-[1600px] pb-80">
      <div className="flex items-center gap-10 md:gap-16 mb-16 md:mb-24 px-4 sm:px-0">
        <div className="h-px flex-1 bg-white/5" />
        <h3 className="text-[12px] md:text-[16px] font-tech text-white/20 uppercase tracking-[0.8em] md:tracking-[1.5em] flex items-center gap-6 md:gap-10">
          <Clock size={24} className="text-accent md:w-9 md:h-9" />
          AVAILABLE START TIMES
        </h3>
        <div className="h-px flex-1 bg-white/5" />
      </div>
      
      {loading ? (
        [1,2,3,4].map(i => <div key={i} className="h-40 md:h-60 bg-white/[0.01] rounded-[60px] md:rounded-[100px] animate-pulse" />)
      ) : teeTimes.length > 0 ? (
        teeTimes.map((t: any) => (
          <div 
            key={t.id} 
            className="group bg-white/[0.01] backdrop-blur-[100px] border border-white/5 p-10 md:p-20 rounded-[60px] md:rounded-[100px] flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-40 hover:border-accent/50 hover:bg-white/[0.03] transition-all duration-1000 shadow-[0_80px_160px_rgba(0,0,0,0.7)] ring-1 ring-white/5 hover:translate-x-4 lg:hover:translate-x-12 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="flex flex-col sm:flex-row items-center gap-12 sm:gap-40 relative z-10 w-full lg:w-auto">
              <div className="text-center group-hover:scale-110 transition-transform duration-1000">
                <div className="text-[12px] md:text-[15px] font-tech text-white/20 uppercase tracking-[0.4em] md:tracking-[0.8em] mb-4 md:mb-8">Start Time</div>
                <div className="font-display text-8xl md:text-[14rem] tracking-tighter text-accent group-hover:text-white transition-colors leading-none">{t.time}</div>
              </div>
              <div className="hidden sm:block h-32 md:h-48 w-px bg-white/10" />
              <div className="grid grid-cols-2 gap-x-16 sm:gap-x-32 gap-y-8 md:gap-y-12 w-full sm:w-auto">
                <div className="space-y-3 md:space-y-6">
                  <div className="text-[11px] md:text-[14px] font-tech text-white/20 uppercase tracking-[0.3em] md:tracking-[0.6em]">Open Slots</div>
                  <div className="flex items-center gap-4 md:gap-8 text-xl md:text-4xl font-mono text-white/60 uppercase tracking-tighter">
                    <Users size={24} className="text-accent md:w-10 md:h-10" /> 
                    <span className="font-black whitespace-nowrap">{t.availableSlots} Players</span>
                  </div>
                </div>
                <div className="space-y-3 md:space-y-6">
                  <div className="text-[11px] md:text-[14px] font-tech text-white/20 uppercase tracking-[0.3em] md:tracking-[0.6em]">Green Fee</div>
                  <div className="flex items-center gap-4 md:gap-8 text-xl md:text-4xl font-mono text-accent uppercase font-black tracking-tighter">
                    <DollarSign size={24} className="md:w-10 md:h-10" /> 
                    <span>${t.price} <span className="text-[10px] md:text-[14px] text-white/20 ml-2 md:ml-4">PER ROUND</span></span>
                  </div>
                </div>
              </div>
            </div>
            <button 
              onClick={() => onBook(t)}
              className="bg-accent text-black px-12 sm:px-32 py-6 sm:py-12 rounded-[30px] sm:rounded-[60px] font-black uppercase text-sm sm:text-xl hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-[0_50px_120px_rgba(0,255,204,0.6)] hover:shadow-[0_60px_180px_rgba(255,255,255,0.2)] flex items-center justify-center gap-6 md:gap-10 group/btn relative z-10 w-full lg:w-auto"
            >
              Confirm Round
              <ChevronRight size={24} className="md:w-10 md:h-10 group-hover/btn:translate-x-4 transition-transform duration-1000" />
            </button>
          </div>
        ))
      ) : (
        <div className="glass-surface p-24 md:p-60 rounded-[60px] md:rounded-[120px] text-center border-dashed border-white/10 shadow-5xl">
          <div className="w-20 h-20 md:w-32 md:h-32 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-10 md:mb-16 shadow-3xl">
            <Lock size={32} className="text-white/20 md:w-[50px] md:h-[50px]" />
          </div>
          <p className="text-white/20 font-tech uppercase tracking-[1em] text-sm md:text-2xl">Member booking offline for this window</p>
        </div>
      )}
    </div>
  </div>
);

const Scorecard = ({ courseName, date }: any) => (
  <div className="glass-surface rounded-[60px] md:rounded-[80px] p-10 md:p-20 border border-white/10 relative overflow-hidden shadow-[0_80px_160px_rgba(0,0,0,0.9)] ring-1 ring-white/5">
    <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-16 px-4 md:px-0">
      <div className="text-center lg:text-left">
        <h4 className="text-4xl md:text-6xl font-display uppercase tracking-tight text-white mb-4 leading-none">{courseName}</h4>
        <div className="flex items-center justify-center lg:justify-start gap-6">
          <p className="text-[10px] md:text-[12px] font-tech text-white/20 uppercase tracking-[0.4em] md:tracking-[0.6em]">{date} • 18 HOLES</p>
          <div className="h-1.5 w-1.5 rounded-full bg-accent/20" />
          <span className="text-[9px] md:text-[11px] font-mono text-accent/60 uppercase tracking-widest hidden sm:block">Tournament Verified</span>
        </div>
      </div>
      <div className="flex gap-8 md:gap-12 bg-white/[0.02] p-6 md:p-8 rounded-[30px] md:rounded-[40px] border border-white/5 w-full sm:w-auto">
        <div className="text-center flex-1 sm:flex-none sm:px-8">
          <p className="text-[10px] md:text-[11px] font-tech text-white/20 uppercase tracking-widest mb-2 md:mb-3">Total Score</p>
          <p className="text-5xl md:text-7xl font-display text-accent font-black tracking-tighter text-glow">-2</p>
        </div>
        <div className="text-center border-l border-white/10 flex-1 sm:flex-none sm:px-8">
          <p className="text-[10px] md:text-[11px] font-tech text-white/20 uppercase tracking-widest mb-2 md:mb-3">Thru Hole</p>
          <p className="text-5xl md:text-7xl font-display text-white font-black tracking-tighter">18</p>
        </div>
      </div>
    </div>

    <div className="overflow-x-auto custom-scrollbar pb-12">
      <div className="inline-flex gap-4 md:gap-6 min-w-full px-4 md:px-0">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="w-24 md:w-32 shrink-0 bg-white/[0.01] border border-white/5 rounded-[30px] md:rounded-[40px] p-6 md:p-10 text-center hover:bg-accent/[0.03] hover:border-accent/30 transition-all duration-700 group cursor-pointer hover:shadow-2xl">
            <p className="text-[9px] md:text-[11px] font-tech text-white/20 uppercase tracking-widest mb-4 md:mb-6 group-hover:text-accent transition-colors whitespace-nowrap">Hole {i + 1}</p>
            <p className="text-3xl md:text-5xl font-display text-white font-black group-hover:scale-125 transition-transform leading-none mb-4 md:mb-6 group-hover:text-glow">4</p>
            <div className="space-y-1.5 border-t border-white/5 pt-4 md:pt-6 opacity-40 group-hover:opacity-100 transition-opacity">
              <p className="text-[8px] md:text-[10px] font-mono text-white uppercase tracking-tighter font-bold whitespace-nowrap">PAR 4</p>
              <p className="text-[8px] md:text-[10px] font-mono text-accent uppercase tracking-tighter font-black whitespace-nowrap">412 YDS</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const CaddieIntelView = ({ location }: any) => (
  <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-16 md:mb-20 border-b border-white/5 pb-12 md:pb-16">
      <div>
        <h3 className="font-display text-7xl md:text-9xl tracking-tighter mb-4 md:mb-6 uppercase leading-none text-glow">Caddie Intel</h3>
        <div className="flex items-center gap-6 md:gap-10">
          <p className="text-[11px] md:text-[13px] font-tech text-white/20 uppercase tracking-[0.6em] md:tracking-[1em]">Real-Time Sector Analysis</p>
          <div className="h-2 w-2 md:h-2.5 md:w-2.5 rounded-full bg-accent/30 shadow-[0_0_20px_rgba(0,255,204,0.5)]" />
          <span className="text-[10px] md:text-[12px] font-mono text-accent uppercase tracking-[0.3em] font-black">Augusta Grade Precision</span>
        </div>
      </div>
      <div className="flex items-center gap-4 bg-accent/5 border border-accent/20 px-6 md:px-8 py-3 md:py-4 rounded-[24px] md:rounded-[30px] shadow-[0_0_30px_rgba(0,255,204,0.1)] w-fit">
        <Flower2 size={24} className="text-accent animate-pulse md:w-8 md:h-8" />
        <div className="flex flex-col">
          <span className="text-[9px] md:text-[10px] font-tech text-white/40 uppercase tracking-widest leading-none">Flora Status</span>
          <span className="text-[10px] md:text-[11px] font-bold text-accent uppercase mt-1 tracking-tighter">Azaleas in Peak Bloom</span>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
      <IntelCard 
        icon={<Wind size={32} className="text-accent" />} 
        label="Atmospheric Drift" 
        value="12 MPH" 
        subValue="Direction: NE (CROSS-WIND)" 
        trend="GUSTS UP TO 18 MPH"
      />
      <IntelCard 
        icon={<Waves size={32} className="text-accent" />} 
        label="Surface Integrity" 
        value="STIMP 13.5" 
        subValue="Firmness: High (Tournament Ready)" 
        trend="MOISTURE: 4% AT ROOT"
      />
      <IntelCard 
        icon={<Zap size={32} className="text-accent" />} 
        label="Playability Index" 
        value="98 / 100" 
        subValue="Elite Tier Deployment Status" 
        trend="CONDITION: OPTIMAL"
      />
    </div>

    <div className="mt-12 md:mt-20 glass-surface rounded-[60px] md:rounded-[80px] p-10 md:p-20 border border-white/10 relative overflow-hidden shadow-4xl ring-1 ring-white/5">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/[0.02] blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2" />
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 md:gap-10 mb-8 md:mb-10">
          <h4 className="font-display text-5xl md:text-6xl uppercase tracking-tight text-white/80">Pro Scout Report</h4>
          <div className="h-px flex-1 bg-white/5 hidden sm:block" />
          <span className="text-[9px] md:text-[10px] font-mono text-accent/40 uppercase tracking-widest">TS-Augusta-Verified</span>
        </div>
        <p className="text-xl md:text-3xl font-medium text-white/40 leading-relaxed max-w-5xl border-l-4 border-accent/20 pl-8 md:pl-16 italic">
          "Course conditions are currently mimicking early Sunday at Augusta. Green speeds are peak, requiring precise approach landing angles. Wind drift will affect high-lofted deployments significantly between holes 11 and 13. Amen Corner is playing firm and fast."
        </p>
      </div>
    </div>
  </div>
);

const IntelCard = ({ icon, label, value, subValue, trend }: any) => (
  <div className="glass-surface rounded-[40px] md:rounded-[60px] p-10 md:p-16 border border-white/5 hover:border-accent/30 transition-all duration-700 hover:shadow-[0_40px_80px_rgba(0,0,0,0.8)] group">
    <div className="w-16 h-16 md:w-20 md:h-20 bg-white/[0.02] rounded-2xl md:rounded-3xl flex items-center justify-center mb-8 md:mb-10 group-hover:scale-110 transition-transform duration-500 border border-white/5 group-hover:border-accent/20 group-hover:bg-accent/5">
      {icon}
    </div>
    <p className="text-[10px] md:text-[11px] font-tech text-white/20 uppercase tracking-[0.4em] md:tracking-[0.5em] mb-4">{label}</p>
    <p className="text-5xl md:text-7xl font-display text-white font-black tracking-tight mb-6 group-hover:text-accent transition-colors">{value}</p>
    <div className="space-y-2 border-t border-white/5 pt-6 md:pt-8">
      <p className="text-[9px] md:text-[10px] font-mono text-white/40 uppercase tracking-widest leading-none">{subValue}</p>
      <p className="text-[9px] md:text-[10px] font-mono text-accent uppercase tracking-widest font-black">{trend}</p>
    </div>
  </div>
);
