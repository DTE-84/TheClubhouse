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
  Flower2,
  Map as MapIcon,
  Layers,
  Sparkles,
  Waves,
  Zap,
  Crosshair,
  Compass,
  Briefcase,
  Camera,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

// Fluff Ecosystem Specs
const FLUFF_GREEN = '#30C476';
const FLUFF_SLATE = '#4A4A5A';

export default function App() {
  // ── SYSTEM STATE (MAINTAINING DATA INTEGRITY) ──
  const [user, setUser] = useState<User | null>(null);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  
  // ── DATA STATE ──
  const [courses, setCourses] = useState<GolfCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<GolfCourse | null>(null);
  const [teeTimes, setTeeTimes] = useState<TeeTime[]>([]);
  
  // ── FILTER STATE (OUTLIER MANAGEMENT) ──
  const [searchRadius, setSearchRadius] = useState(25);
  const [maxPrice, setMaxPrice] = useState(150);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [playerCount, setPlayerCount] = useState(4);

  // Uplink Auth Listener (PII Compliance)
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
          // Fallback to Chicago (Augusta Alpha-8 Coordinates)
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
      // Identifying Upstream Bug in API uplink, failing over to Heritage Mocks
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
        alert(`✅ Reservation Confirmed at ${selectedCourse.name}`);
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
    <div className="flex h-screen bg-[#0A0A0A] text-white font-space mesh-bg overflow-hidden selection:bg-[#30C476]/30">
      
      {/* ── DESKTOP SIDEBAR (ELITE ACCESS) ── */}
      <aside className={cn(
        "glass-surface hidden md:flex flex-col transition-all duration-700 z-50 border-r border-white/5 shadow-2xl",
        sidebarOpen ? "w-[340px]" : "w-[110px]"
      )}>
        {/* Brand Section */}
        <div className="p-12 flex flex-col gap-8 h-[220px] border-b border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#30C476]/40 via-[#30C476]/5 to-transparent" />
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#30C476] to-[#30C476]/60 rounded-[22px] flex items-center justify-center shrink-0 shadow-[0_0_50px_rgba(48,196,118,0.35)] rotate-3 group-hover:rotate-0 transition-transform duration-700">
              <span className="font-serif italic text-black text-4xl tracking-tighter">F</span>
            </div>
            {sidebarOpen && (
              <div className="animate-in fade-in slide-in-from-left-6 duration-1000">
                <h1 className="font-serif italic text-4xl tracking-tight leading-none text-[#30C476]">Fluff</h1>
                <p className="text-[10px] font-tech text-[#4A4A5A] uppercase tracking-[0.6em] mt-3">The 19th Hole</p>
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
          <NavItem icon={<LayoutDashboard size={28} />} label="Home" active={activeTab === 'dashboard'} expanded={sidebarOpen} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<Search size={28} />} label="The Links" active={activeTab === 'search'} expanded={sidebarOpen} onClick={() => setActiveTab('search')} />
          <NavItem icon={<MapIcon size={28} />} label="GPS Recon" active={activeTab === 'gps'} expanded={sidebarOpen} onClick={() => setActiveTab('gps')} />
          <NavItem icon={<Camera size={28} />} label="Swing Intel" active={activeTab === 'swing'} expanded={sidebarOpen} onClick={() => setActiveTab('swing')} />
          <NavItem icon={<BookOpen size={28} />} label="The Ledger" active={activeTab === 'ledger'} expanded={sidebarOpen} onClick={() => setActiveTab('ledger')} />
          <NavItem icon={<Briefcase size={28} />} label="The Bag" active={activeTab === 'bag'} expanded={sidebarOpen} onClick={() => setActiveTab('bag')} />
          <NavItem icon={<CloudRain size={28} />} label="Caddie Intel" active={activeTab === 'weather'} expanded={sidebarOpen} onClick={() => setActiveTab('weather')} />
        </nav>

        {/* User Card */}
        <div className="p-10 border-t border-white/5 bg-white/[0.01]">
          {sidebarOpen ? (
            <div className="flex flex-col gap-5 animate-in fade-in duration-1000">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-tech uppercase tracking-widest text-[#4A4A5A]">Locker Room</span>
                <span className="text-[10px] font-mono text-[#30C476] bg-[#30C476]/10 px-3 py-1 rounded-full uppercase border border-[#30C476]/20 font-bold">DT-08</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-[#30C476] animate-pulse shadow-[0_0_20px_rgba(48,196,118,0.7)]" />
                <span className="text-[12px] font-tech uppercase tracking-[0.3em] text-white/90 font-bold">Secure Uplink</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-4 h-4 rounded-full bg-[#30C476] animate-pulse shadow-[0_0_20px_rgba(48,196,118,0.7)]" />
            </div>
          )}
        </div>
      </aside>

      {/* ── MOBILE NAVIGATION (FLUFF STYLE) ── */}
      <nav className="md:hidden fixed bottom-8 left-6 right-6 h-20 glass-surface rounded-[30px] z-[100] flex items-center justify-around px-6 border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.9)] backdrop-blur-3xl">
        <MobileNavItem icon={<LayoutDashboard size={24} />} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <MobileNavItem icon={<Search size={24} />} active={activeTab === 'search'} onClick={() => setActiveTab('search')} />
        <MobileNavItem icon={<MapIcon size={24} />} active={activeTab === 'gps'} onClick={() => setActiveTab('gps')} />
        <MobileNavItem icon={<Camera size={24} />} active={activeTab === 'swing'} onClick={() => setActiveTab('swing')} />
        <MobileNavItem icon={<BookOpen size={24} />} active={activeTab === 'ledger'} onClick={() => setActiveTab('ledger')} />
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Responsive Header */}
        <header className="h-[100px] md:h-[130px] border-b border-white/5 flex items-center justify-between px-8 md:px-20 bg-[#0A0A0A]/80 backdrop-blur-3xl z-40 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
          <div className="flex items-center gap-6 md:gap-12">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden md:flex p-5 hover:bg-white/5 rounded-[22px] transition-all text-white/20 hover:text-[#30C476] border border-transparent hover:border-white/5 active:scale-95 shadow-2xl">
              {sidebarOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
            <div className="md:hidden flex flex-col">
              <h1 className="font-serif italic text-2xl text-[#30C476] leading-none">Fluff</h1>
              <span className="text-[7px] font-tech text-[#4A4A5A] uppercase tracking-[0.4em] mt-1">19TH HOLE</span>
            </div>
            <div className="h-8 md:h-12 w-px bg-white/10 hidden sm:block" />
            <div className="hidden sm:flex flex-col">
              <div className="flex items-center gap-2 md:gap-4 text-[10px] md:text-[12px] font-tech text-[#30C476]/80 tracking-[0.3em] md:tracking-[0.5em] uppercase leading-none font-bold">
                <ShieldCheck size={18} className="text-[#30C476]" />
                <span>Patron Verified</span>
              </div>
              <p className="text-[8px] md:text-[11px] font-mono text-[#4A4A5A] uppercase mt-1 md:mt-2.5 tracking-widest flex items-center gap-2 md:gap-3">
                <Target size={14} className="text-[#30C476]/40" />
                AUGUSTA-ALPHA-8
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 md:gap-12 group cursor-pointer">
            <div className="text-right hidden sm:block">
              <p className="text-[11px] font-tech text-[#4A4A5A] uppercase tracking-[0.6em] mb-2 leading-none font-bold">Elite Patron</p>
              <p className="text-lg font-bold uppercase tracking-tight group-hover:text-[#30C476] transition-colors duration-700 leading-none">{user?.displayName || 'DREW T ERNST'}</p>
            </div>
            <div className="relative">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[24px] border border-white/10 bg-[#30C476]/[0.02] flex items-center justify-center font-black text-sm md:text-base text-[#30C476] transition-all duration-1000 group-hover:border-[#30C476]/50 group-hover:shadow-[0_0_50px_rgba(48,196,118,0.3)] group-hover:-rotate-12 ring-1 ring-white/5 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent" />
                {user?.email?.substring(0,2).toUpperCase() || 'DE'}
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-black rounded-xl border-2 border-[#30C476]/20 p-1.5 flex items-center justify-center shadow-2xl">
                <div className="w-full h-full bg-[#30C476] rounded-sm animate-pulse" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-20 space-y-16 md:space-y-24 pb-40 md:pb-20">
          
          {activeTab === 'weather' ? (
            <CaddieIntelView location={userLocation} />
          ) : activeTab === 'gps' ? (
            <GPSReconView location={userLocation} courses={courses} />
          ) : activeTab === 'ledger' ? (
            <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 md:mb-16 border-b border-white/5 pb-12">
                <div>
                  <h3 className="font-display text-8xl md:text-9xl tracking-tighter mb-4 uppercase leading-none">The Ledger</h3>
                  <p className="text-[12px] font-tech text-[#4A4A5A] uppercase tracking-[0.8em]">Championship Round Logs</p>
                </div>
                <button className="bg-white text-black px-12 py-5 rounded-[30px] font-black uppercase text-xs hover:bg-[#30C476] transition-all hover:scale-105 active:scale-95 shadow-3xl w-full md:w-auto">Log Final Score</button>
              </div>
              <Scorecard courseName="Pebble Beach Golf Links" date="March 11, 2026" />
            </div>
          ) : activeTab === 'bag' ? (
            <MemberBagView />
          ) : !selectedCourse && activeTab === 'dashboard' ? (
            <div className="relative h-[550px] md:h-[750px] rounded-[60px] md:rounded-[100px] overflow-hidden border border-white/10 shadow-[0_80px_160px_rgba(0,0,0,1)] group ring-1 ring-white/5">
              <img src="https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1600" className="w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-[15s] ease-out grayscale group-hover:grayscale-0" alt="Championship Course" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
              
              <div className="absolute bottom-16 left-8 md:bottom-32 md:left-24 max-w-5xl animate-in fade-in slide-in-from-bottom-16 duration-[2000ms]">
                <div className="flex flex-wrap items-center gap-6 md:gap-8 mb-8 md:mb-12">
                  <div className="flex items-center gap-4 bg-[#30C476] text-black text-[11px] md:text-[12px] font-black px-6 md:px-10 py-3 md:py-4 rounded-full uppercase tracking-[0.4em] md:tracking-[0.6em] shadow-[0_0_60px_rgba(48,196,118,0.8)]">
                    <Award size={18} /> CHAIRMAN'S CHOICE
                  </div>
                </div>
                <h2 className="font-display text-8xl md:text-[18rem] mb-8 md:mb-12 leading-[0.7] md:leading-[0.6] tracking-tighter opacity-95 uppercase text-glow">PEBBLE BEACH</h2>
                <p className="text-[#4A4A5A] mb-12 md:mb-20 font-medium text-xl md:text-4xl leading-snug md:leading-tight max-w-3xl border-l-2 border-[#30C476]/20 pl-8 md:pl-16 italic">"The ultimate meeting of land and sea."</p>
                <div className="flex flex-col sm:flex-row gap-6 md:gap-12">
                  <button className="bg-white text-black px-12 md:px-24 py-6 md:py-10 rounded-[35px] md:rounded-[50px] font-black uppercase text-sm md:text-lg hover:bg-[#30C476] transition-all hover:scale-105 active:scale-95 shadow-[0_50px_100px_rgba(0,0,0,0.7)] flex items-center justify-center gap-6 md:gap-8 group/btn">
                    Secure Tee Time <ChevronRight size={28} className="group-hover/btn:translate-x-4 transition-transform duration-700" />
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {/* Links View */}
          {(activeTab === 'search' || (activeTab === 'dashboard' && !selectedCourse)) && !selectedCourse && (
            <section className="animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-700">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20 border-b border-white/5 pb-16 md:pb-20">
                <h3 className="font-display text-8xl md:text-9xl tracking-tighter mb-6 uppercase leading-none">The Links</h3>
                <div className="flex gap-6 items-center">
                  <div className="bg-white/[0.01] border border-white/5 p-5 md:p-6 rounded-[40px] shadow-4xl ring-1 ring-white/5">
                    <input type="range" min="5" max="100" value={searchRadius} onChange={(e) => setSearchRadius(Number(e.target.value))} className="accent-[#30C476] w-48 md:w-80 h-2 bg-white/10 rounded-full appearance-none cursor-pointer" />
                    <span className="text-[14px] md:text-[16px] font-mono text-[#30C476] ml-6 font-black">{searchRadius}MI</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 md:gap-20 pb-60">
                {courses.map(course => <CourseCard key={course.id} course={course} onClick={() => handleCourseSelect(course)} />)}
              </div>
            </section>
          )}

          {selectedCourse && <TeeTimeView course={selectedCourse} teeTimes={teeTimes} onBack={() => setSelectedCourse(null)} onBook={handleBooking} loading={loading} />}
        </div>
      </main>
    </div>
  );
}

const CourseCard = ({ course, onClick }: any) => (
  <div 
    onClick={onClick}
    className="group cursor-pointer glass-surface rounded-[40px] md:rounded-[60px] overflow-hidden transition-all duration-1000 hover:border-[#30C476]/50 hover:shadow-[0_100px_200px_rgba(0,0,0,1)] hover:translate-y-[-24px] kinetic-border"
  >
    {/* Image Container (Premier Layout) */}
    <div className="relative h-64 md:h-80 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden">
      <img
        src={course.photoUrl || 'https://images.unsplash.com/photo-1592919505780-303950717480?w=800'}
        alt={course.name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[5s] opacity-40 group-hover:opacity-100 grayscale group-hover:grayscale-0"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Price Badge */}
      <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md text-black px-5 py-2.5 rounded-full text-sm font-black tracking-tight shadow-2xl">
        $125+
      </div>

      {/* Rating Badge */}
      <div className="absolute top-6 left-6 bg-[#30C476] backdrop-blur-md text-black px-4 py-2 rounded-full text-xs font-black tracking-wide flex items-center gap-2 shadow-2xl">
        <Star size={12} className="fill-black" />
        {course.rating || '4.5'}
      </div>
    </div>

    {/* Content (Premier Design) */}
    <div className="p-10 md:p-12">
      <h3 className="text-4xl md:text-5xl font-display font-bold text-white mb-3 tracking-tight group-hover:text-[#30C476] transition-colors">{course.name}</h3>
      <div className="flex items-center gap-2 text-[#4A4A5A] mb-8">
        <MapPin size={16} className="flex-shrink-0 text-[#30C476]" />
        <span className="text-sm font-tech uppercase tracking-widest">{course.city}, {course.state}</span>
        <span className="text-xs font-mono text-[#30C476]">• {course.distance} mi</span>
      </div>

      {/* Stats Grid (The Gift Layout) */}
      <div className="grid grid-cols-3 gap-4 mb-8 pb-8 border-b border-white/5">
        <div className="text-center px-2 py-1">
          <div className="text-3xl font-display font-bold text-[#30C476] leading-none">18</div>
          <div className="text-[9px] text-[#4A4A5A] font-bold mt-2 tracking-widest uppercase">Holes</div>
        </div>
        <div className="text-center px-2 py-1 border-l border-r border-white/5">
          <div className="text-3xl font-display font-bold text-[#30C476] leading-none">Par {course.par || 72}</div>
          <div className="text-[9px] text-[#4A4A5A] font-bold mt-2 tracking-widest uppercase">Target</div>
        </div>
        <div className="text-center px-2 py-1">
          <div className="text-3xl font-display font-bold text-[#30C476] leading-none">{course.rating || '4.5'}</div>
          <div className="text-[9px] text-[#4A4A5A] font-bold mt-2 tracking-widest uppercase">Rank</div>
        </div>
      </div>

      {/* Availability */}
      <div className="flex items-center gap-4 mb-8 p-5 bg-white/[0.02] rounded-2xl border border-white/5 group-hover:border-[#30C476]/20 transition-colors">
        <Zap size={20} className="text-[#30C476] flex-shrink-0 animate-pulse" />
        <div>
          <span className="text-sm font-black text-white uppercase tracking-tighter">
            4 Deployment Slots
          </span>
          <div className="text-[10px] text-[#4A4A5A] font-bold uppercase tracking-widest">Available today</div>
        </div>
      </div>

      {/* Book Button */}
      <button
        className="w-full bg-[#30C476] hover:bg-white text-black font-black py-5 px-6 rounded-2xl transition-all duration-500 flex items-center justify-center gap-3 group/btn uppercase text-xs tracking-widest shadow-xl hover:shadow-[#30C476]/20 hover:scale-[1.02] active:scale-95"
      >
        <Trophy size={18} />
        Secure Round
        <ArrowUpRight size={16} className="opacity-0 group-hover/btn:opacity-100 transition-all duration-500 translate-y-1 group-hover/btn:translate-y-0" />
      </button>
    </div>
  </div>
);

const GPSReconView = ({ location, courses }: any) => (
  <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 h-full flex flex-col">
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-16 border-b border-white/5 pb-12">
      <div>
        <h3 className="font-display text-9xl tracking-tighter mb-6 uppercase leading-none text-glow">GPS Recon</h3>
        <div className="flex items-center gap-10">
          <p className="text-[13px] font-tech text-[#4A4A5A] uppercase tracking-[1em] font-bold">Satellite Tactical Display</p>
          <div className="h-2.5 w-2.5 rounded-full bg-[#30C476]/30 shadow-[0_0_20px_rgba(48,196,118,0.5)]" />
          <span className="text-[12px] font-mono text-[#30C476] uppercase tracking-[0.3em] font-black">Augusta Grade Precision</span>
        </div>
      </div>
    </div>
    <div className="flex-1 glass-surface rounded-[80px] border border-white/10 relative overflow-hidden shadow-4xl ring-1 ring-white/5 min-h-[600px] group">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526080652727-5e77c7f59dd3?w=1600')] bg-cover opacity-40 grayscale group-hover:grayscale-0 transition-all duration-[5s] scale-110 group-hover:scale-100" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-20 text-center">
        <div className="w-32 h-32 md:w-48 md:h-48 bg-[#30C476]/10 backdrop-blur-3xl rounded-full flex items-center justify-center mb-12 border border-[#30C476]/30 shadow-[0_0_100px_rgba(48,196,118,0.2)] animate-pulse">
          <Crosshair size={60} className="text-[#30C476] md:w-24 md:h-24" />
        </div>
        <h4 className="font-display text-6xl md:text-8xl uppercase tracking-tighter mb-8">Satellite Uplink Established</h4>
        <p className="text-xl md:text-2xl font-tech text-white/40 uppercase tracking-[0.5em] max-w-2xl mx-auto leading-relaxed italic">
          Coordinates Locked: {location?.latitude.toFixed(4) || 'SCANNING'} / {location?.longitude.toFixed(4) || 'SCANNING'}
        </p>
      </div>
      <div className="absolute bottom-12 right-12 w-48 h-48 rounded-full border-2 border-white/5 bg-black/40 backdrop-blur-2xl flex items-center justify-center overflow-hidden">
        <div className="absolute w-full h-full animate-[spin_4s_linear_infinite] bg-gradient-to-tr from-[#30C476]/20 to-transparent rounded-full" />
        <Compass size={32} className="text-[#30C476] opacity-40" />
      </div>
    </div>
  </div>
);

const MemberBagView = () => (
  <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20 border-b border-white/5 pb-16 md:pb-20">
      <div>
        <h3 className="font-display text-9xl tracking-tighter mb-6 uppercase leading-none text-glow">The Bag</h3>
        <p className="text-[13px] font-tech text-[#4A4A5A] uppercase tracking-[1em] font-bold">Equipment Registry</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
      <ClubCard label="Driver" model="TaylorMade Stealth 2" yardage="285" />
      <ClubCard label="3-Wood" model="Titleist TSR3" yardage="245" />
      <ClubCard label="7-Iron" model="Mizuno JPX923" yardage="175" />
      <ClubCard label="Putter" model="Scotty Cameron Newport" yardage="---" />
    </div>
  </div>
);

const ClubCard = ({ label, model, yardage }: any) => (
  <div className="glass-surface rounded-[40px] p-12 border border-white/5 hover:border-[#30C476]/30 transition-all duration-700 group">
    <p className="text-[11px] font-tech text-[#4A4A5A] uppercase tracking-[0.5em] mb-4 font-bold">{label}</p>
    <p className="text-3xl font-display text-white font-black tracking-tight mb-6 group-hover:text-[#30C476] transition-colors">{model}</p>
    <div className="space-y-2 border-t border-white/5 pt-8">
      <p className="text-4xl font-display text-[#30C476] uppercase tracking-widest font-black">{yardage} YDS</p>
    </div>
  </div>
);

const MobileNavItem = ({ icon, active, onClick }: any) => (
  <button onClick={onClick} className={cn("p-5 rounded-2xl transition-all duration-500 relative", active ? "text-[#30C476] bg-[#30C476]/10" : "text-[#4A4A5A]")}>
    {active && <motion.div layoutId="activeIndicatorMobile" className="absolute -top-10 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full bg-[#30C476] shadow-[0_0_20px_rgba(48,196,118,1)]" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
    {icon}
  </button>
);

const NavItem = ({ icon, label, active, expanded, onClick }: any) => (
  <button onClick={onClick} className={cn("flex items-center gap-8 w-full p-8 rounded-[40px] transition-all duration-700 group relative overflow-hidden", active ? "bg-[#30C476]/10 text-[#30C476] border border-[#30C476]/20 shadow-[0_0_80px_rgba(48,196,118,0.25)]" : "text-[#4A4A5A] hover:text-white hover:bg-white/[0.03] border border-transparent")}>
    {active && <div className="absolute left-0 w-3 h-14 bg-[#30C476] rounded-r-full shadow-[10px_0_50px_rgba(48,196,118,1)]" />}
    <div className={cn("shrink-0 transition-all duration-700", active ? "text-[#30C476] scale-125 rotate-6" : "group-hover:text-white group-hover:translate-x-3")}>{icon}</div>
    {expanded && <span className="text-[17px] font-black uppercase tracking-[0.4em] overflow-hidden whitespace-nowrap">{label}</span>}
  </button>
);

const TeeTimeView = ({ course, teeTimes, onBack, onBook, loading }: any) => (
  <div className="animate-in fade-in duration-1000 slide-in-from-right-20">
    <button onClick={onBack} className="mb-24 text-[16px] font-tech text-[#30C476] uppercase tracking-[1em] flex items-center gap-10 hover:translate-x-[-20px] transition-all group">
      <div className="bg-[#30C476]/10 p-6 rounded-[40px] group-hover:bg-[#30C476]/20 transition-colors border border-[#30C476]/20 shadow-4xl"><ChevronRight size={40} className="rotate-180" /></div>Return to Global Network
    </button>
    <div className="glass-surface rounded-[120px] p-40 mb-32 relative overflow-hidden ring-1 ring-white/10 shadow-[0_120px_240px_rgba(0,0,0,1)]">
      <div className="absolute top-0 right-0 w-[1200px] h-[1200px] bg-[#30C476]/[0.05] blur-[300px] rounded-full translate-x-1/2 -translate-y-1/2" />
      <div className="relative z-10"><h2 className="font-display text-[15rem] md:text-[20rem] mb-16 tracking-tighter leading-[0.65] uppercase text-[#30C476] text-glow">{course.name}</h2></div>
    </div>
    <div className="space-y-16 max-w-[1600px] pb-80">
      {teeTimes.map((t: any) => (
        <div key={t.id} className="group bg-white/[0.01] backdrop-blur-[200px] border border-white/5 p-20 rounded-[100px] flex flex-col lg:flex-row items-center justify-between hover:border-[#30C476]/50 transition-all duration-1000 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-40 relative z-10">
            <div className="text-center"><div className="font-display text-[14rem] tracking-tighter text-[#30C476] group-hover:text-white transition-colors leading-none">{t.time}</div></div>
            <div className="grid grid-cols-2 gap-x-32 gap-y-12">
              <div className="space-y-6"><div className="flex items-center gap-8 text-4xl font-mono text-white/60 font-black"><Users size={40} className="text-[#30C476]" /><span>{t.availableSlots} Players</span></div></div>
              <div className="space-y-6"><div className="flex items-center gap-8 text-4xl font-mono text-[#30C476] font-black"><DollarSign size={40} /><span>${t.price}</span></div></div>
            </div>
          </div>
          <button onClick={() => onBook(t)} className="bg-[#30C476] text-black px-32 py-12 rounded-[60px] font-black uppercase text-xl hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-10 group/btn relative z-10">Confirm Round <ChevronRight size={40} className="group-hover/btn:translate-x-6 transition-transform duration-1000" /></button>
        </div>
      ))}
    </div>
  </div>
);

const Scorecard = ({ courseName, date }: any) => (
  <div className="glass-surface rounded-[80px] p-20 border border-white/10 relative overflow-hidden shadow-[0_80px_160px_rgba(0,0,0,0.9)] ring-1 ring-white/5">
    <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-16 px-4 md:px-0">
      <h4 className="text-6xl font-display uppercase tracking-tight text-white mb-4 leading-none text-glow">{courseName}</h4>
      <div className="flex gap-12 bg-white/[0.02] p-8 rounded-[40px] border border-white/5 w-full sm:w-auto">
        <div className="text-center flex-1 px-8"><p className="text-7xl font-display text-[#30C476] font-black tracking-tighter">-2</p></div>
        <div className="text-center border-l border-white/10 flex-1 px-8"><p className="text-7xl font-display text-white font-black tracking-tighter">18</p></div>
      </div>
    </div>
    <div className="overflow-x-auto custom-scrollbar pb-12"><div className="inline-flex gap-6 min-w-full">{Array.from({ length: 18 }).map((_, i) => (<div key={i} className="w-32 shrink-0 bg-white/[0.01] border border-white/5 rounded-[40px] p-10 text-center hover:bg-[#30C476]/[0.03] transition-all duration-700 group cursor-pointer hover:shadow-2xl"><p className="text-[11px] font-tech text-[#4A4A5A] uppercase tracking-widest mb-6 font-bold">Hole {i + 1}</p><p className="text-5xl font-display text-white font-black group-hover:scale-125 transition-transform leading-none mb-6">4</p></div>))}</div></div>
  </div>
);

const CaddieIntelView = ({ location }: any) => (
  <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
    <h3 className="font-display text-9xl tracking-tighter mb-6 uppercase leading-none text-glow">Caddie Intel</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
      <IntelCard icon={<Wind size={32} className="text-[#30C476]" />} label="Atmospheric Drift" value="12 MPH" subValue="Direction: NE" trend="GUSTS UP TO 18 MPH" />
      <IntelCard icon={<Waves size={32} className="text-[#30C476]" />} label="Surface Integrity" value="STIMP 13.5" subValue="Firmness: Tournament Ready" trend="MOISTURE: 4%" />
      <IntelCard icon={<Zap size={32} className="text-[#30C476]" />} label="Playability Index" value="98 / 100" subValue="Elite Tier Deployment" trend="CONDITION: OPTIMAL" />
    </div>
  </div>
);

const IntelCard = ({ icon, label, value, subValue, trend }: any) => (
  <div className="glass-surface rounded-[60px] p-16 border border-white/5 hover:border-[#30C476]/30 transition-all duration-700 group">
    <div className="w-20 h-20 bg-white/[0.02] rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform border border-white/5 group-hover:bg-[#30C476]/5">{icon}</div>
    <p className="text-[11px] font-tech text-[#4A4A5A] uppercase tracking-[0.5em] mb-4 font-bold">{label}</p>
    <p className="text-7xl font-display text-white font-black tracking-tight mb-6 group-hover:text-[#30C476] transition-colors">{value}</p>
    <div className="space-y-2 border-t border-white/5 pt-8"><p className="text-[10px] font-mono text-[#4A4A5A] uppercase font-bold">{subValue}</p><p className="text-[10px] font-mono text-[#30C476] uppercase font-black">{trend}</p></div>
  </div>
);
