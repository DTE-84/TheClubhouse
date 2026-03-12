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
  X
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Types
interface GolfCourse {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  rating?: number;
  holes?: number;
  par?: number;
  distance?: number;
  photoUrl?: string;
}

interface TeeTime {
  id: string;
  courseId: string;
  time: string;
  date: string;
  availableSlots: number;
  price: number;
  holes: number;
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

export default function App() {
  // State Management
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [courses, setCourses] = useState<GolfCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<GolfCourse | null>(null);
  const [teeTimes, setTeeTimes] = useState<TeeTime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Filter State
  const [searchRadius, setSearchRadius] = useState(25);
  const [maxPrice, setMaxPrice] = useState(150);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [playerCount, setPlayerCount] = useState(4);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      searchCourses();
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
          setLoading(false);
        },
        () => {
          setUserLocation({ latitude: 41.8781, longitude: -87.6298 });
          setError('Location access denied. Using default: Chicago.');
          setLoading(false);
        }
      );
    }
  };

  const searchCourses = async () => {
    // Mock loading sequence
    setLoading(true);
    setTimeout(() => {
      loadMockCourses();
    }, 1000);
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
      },
      {
        id: '3',
        name: 'TPC Sawgrass',
        address: '110 Championship Way',
        city: 'Ponte Vedra Beach',
        state: 'FL',
        zipCode: '32082',
        latitude: 30.1977,
        longitude: -81.3936,
        rating: 4.8,
        holes: 18,
        par: 72,
        distance: 8.7,
        photoUrl: 'https://images.unsplash.com/photo-1592919505780-303950717480?w=800'
      }
    ];
    setCourses(mockCourses);
    setLoading(false);
  };

  const loadTeeTimes = (courseId: string) => {
    const mockTeeTimes: TeeTime[] = [
      { id: '1', courseId, time: '7:30 AM', date: selectedDate, availableSlots: 4, price: 85, holes: 18 },
      { id: '2', courseId, time: '9:00 AM', date: selectedDate, availableSlots: 2, price: 110, holes: 18 },
      { id: '3', courseId, time: '1:30 PM', date: selectedDate, availableSlots: 4, price: 75, holes: 18 }
    ];
    setTeeTimes(mockTeeTimes);
  };

  const handleCourseSelect = (course: GolfCourse) => {
    setSelectedCourse(course);
    loadTeeTimes(course.id);
  };

  return (
    <div className="flex h-screen bg-[#000000] text-white font-inter">
      
      {/* ── THE 19TH HOLE SIDEBAR ── */}
      <aside className={cn(
        "bg-[#080808] border-r border-white/5 flex flex-col transition-all duration-500 z-50",
        sidebarOpen ? "w-[280px]" : "w-[80px]"
      )}>
        {/* Logo Section */}
        <div className="p-6 flex items-center gap-4 border-b border-white/5 h-[100px]">
          <div className="w-10 h-10 bg-[#00ffcc] rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(0,255,204,0.3)]">
            <span className="font-black text-black text-xl">D</span>
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden whitespace-nowrap">
              <h1 className="font-display text-xl tracking-tighter">CLUBHOUSE</h1>
              <p className="text-[8px] font-tech text-[#00ffcc] tracking-[0.4em] uppercase">The 19th Hole</p>
            </div>
          )}
        </div>

        {/* Tactical Links */}
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Nexus Dashboard" 
            active={activeTab === 'dashboard'} 
            expanded={sidebarOpen}
            onClick={() => setActiveTab('dashboard')}
          />
          <NavItem 
            icon={<Search size={20} />} 
            label="Course Finder" 
            active={activeTab === 'search'} 
            expanded={sidebarOpen}
            onClick={() => setActiveTab('search')}
          />
          <NavItem 
            icon={<BookOpen size={20} />} 
            label="Booking History" 
            active={activeTab === 'history'} 
            expanded={sidebarOpen}
            onClick={() => setActiveTab('history')}
          />
          <NavItem 
            icon={<CloudRain size={20} />} 
            label="Weather Intel" 
            active={activeTab === 'weather'} 
            expanded={sidebarOpen}
            onClick={() => setActiveTab('weather')}
          />
        </nav>

        {/* System Status */}
        <div className="p-6 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#00ffcc] animate-pulse" />
            {sidebarOpen && (
              <span className="text-[10px] font-tech uppercase tracking-widest text-white/40">Uplink Active</span>
            )}
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT PANE ── */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Top Header */}
        <header className="h-[100px] border-b border-white/5 flex items-center justify-between px-8 bg-black/50 backdrop-blur-xl z-40">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-[#00ffcc]"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-tech text-white/40 uppercase tracking-widest">Active Member</p>
              <p className="text-xs font-bold">DREW T ERNST</p>
            </div>
            <div className="w-10 h-10 rounded-full border border-[#00ffcc]/20 bg-white/5 flex items-center justify-center font-black text-[10px]">
              DE
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          
          {/* Hero Section (Netflix Style) */}
          {!selectedCourse && (
            <div className="relative h-[400px] rounded-[40px] overflow-hidden mb-12 border border-white/5 shadow-2xl group">
              <img 
                src="https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1600" 
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                alt="Championship Course"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute bottom-12 left-12 max-w-xl">
                <span className="bg-[#00ffcc] text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">Featured Link</span>
                <h2 className="font-display text-6xl md:text-7xl mb-4 leading-none">PEBBLE BEACH</h2>
                <p className="text-white/60 mb-8 font-medium">Experience the ultimate in high-fidelity coastal golf. Now accepting elite tier bookings.</p>
                <button className="bg-white text-black px-10 py-4 rounded-2xl font-black uppercase text-xs hover:bg-[#00ffcc] transition-all">Quick Book</button>
              </div>
            </div>
          )}

          {/* Dynamic Grid */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-display text-4xl">MAJESTIC LINKS</h3>
              <div className="flex gap-2">
                <button className="p-2 border border-white/5 rounded-lg hover:border-[#00ffcc]/30 transition-all text-white/40 hover:text-[#00ffcc]"><Filter size={16} /></button>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1,2,3].map(i => <div key={i} className="aspect-video bg-white/5 rounded-3xl animate-pulse" />)}
              </div>
            ) : selectedCourse ? (
              <TeeTimeView course={selectedCourse} teeTimes={teeTimes} onBack={() => setSelectedCourse(null)} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map(course => (
                  <CourseCard key={course.id} course={course} onClick={() => handleCourseSelect(course)} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

const NavItem = ({ icon, label, active, expanded, onClick }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex items-center gap-4 w-full p-4 rounded-2xl transition-all duration-300 group",
      active ? "bg-[#00ffcc]/10 text-[#00ffcc] border border-[#00ffcc]/20" : "text-white/40 hover:text-white hover:bg-white/5 border border-transparent"
    )}
  >
    <div className={cn("shrink-0", active ? "text-[#00ffcc]" : "group-hover:text-white")}>{icon}</div>
    {expanded && (
      <span className="text-[11px] font-black uppercase tracking-widest overflow-hidden whitespace-nowrap">{label}</span>
    )}
  </button>
);

const CourseCard = ({ course, onClick }: any) => (
  <div 
    onClick={onClick}
    className="glass-card group cursor-pointer border border-white/5 hover:border-[#00ffcc]/30 hover:bg-[#080808] transition-all"
  >
    <div className="aspect-video overflow-hidden rounded-t-[24px] relative">
      <img src={course.photoUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" alt={course.name} />
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 flex items-center gap-2">
        <Star size={10} className="text-yellow-500 fill-yellow-500" />
        <span className="text-[10px] font-bold">{course.rating}</span>
      </div>
    </div>
    <div className="p-6">
      <h4 className="font-display text-2xl mb-1 group-hover:text-[#00ffcc] transition-colors">{course.name}</h4>
      <p className="text-[10px] font-tech text-white/30 uppercase tracking-widest mb-4">{course.city}, {course.state}</p>
      <div className="flex justify-between items-center text-[10px] font-mono text-white/40">
        <div className="flex items-center gap-2">
          <MapPin size={12} className="text-[#00ffcc]" />
          <span>{course.distance} MI</span>
        </div>
        <span>{course.holes} HOLES • PAR {course.par}</span>
      </div>
    </div>
  </div>
);

const TeeTimeView = ({ course, teeTimes, onBack }: any) => (
  <div className="animate-in fade-in duration-500">
    <button onClick={onBack} className="mb-8 text-[10px] font-tech text-[#00ffcc] uppercase tracking-[0.3em] flex items-center gap-2 hover:translate-x-[-4px] transition-all">
      &larr; Back to Dashboard
    </button>
    <div className="bg-[#080808] rounded-[40px] border border-white/5 p-10 mb-8">
      <h2 className="font-display text-5xl mb-4">{course.name}</h2>
      <div className="flex gap-6 text-white/40 text-[10px] font-tech uppercase tracking-widest">
        <div className="flex items-center gap-2"><MapPin size={14} className="text-[#00ffcc]" /> {course.address}</div>
        <div className="flex items-center gap-2"><Phone size={14} /> {course.phone || 'N/A'}</div>
      </div>
    </div>
    <div className="space-y-4">
      {teeTimes.map((t: any) => (
        <div key={t.id} className="bg-white/5 border border-white/5 p-6 rounded-[24px] flex items-center justify-between hover:border-[#00ffcc]/20 transition-all">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <Clock size={16} className="text-[#00ffcc] mb-1 mx-auto" />
              <div className="font-display text-2xl tracking-tighter">{t.time}</div>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-mono text-white/40 uppercase"><Users size={12} /> {t.availableSlots} SLOTS</div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-[#00ffcc] uppercase"><DollarSign size={12} /> ${t.price} PER PLAYER</div>
            </div>
          </div>
          <button className="bg-[#00ffcc] text-black px-8 py-3 rounded-xl font-black uppercase text-[10px] hover:scale-105 transition-all">Reserve Slot</button>
        </div>
      ))}
    </div>
  </div>
);
