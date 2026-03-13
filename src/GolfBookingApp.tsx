import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, DollarSign, Users, Navigation, Filter, Star, Clock, Phone, Globe, ChevronRight } from 'lucide-react';
import { golfAPI, GolfCourse, TeeTime, SearchParams } from './services/golfAPIService';
import fluffLogo from './assets/flufflogo.png';

export default function GolfBookingApp() {
  // State Management
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [courses, setCourses] = useState<GolfCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<GolfCourse | null>(null);
  const [teeTimes, setTeeTimes] = useState<TeeTime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter State
  const [searchRadius, setSearchRadius] = useState(25); // miles
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState(150);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [playerCount, setPlayerCount] = useState(4);
  const [showFilters, setShowFilters] = useState(false);

  // Get user's GPS location on mount
  useEffect(() => {
    getUserLocation();
  }, []);

  // Search courses when location, radius, or search query changes
  useEffect(() => {
    if (userLocation || searchQuery) {
      searchCourses();
    }
  }, [userLocation, searchRadius, searchQuery]);

  const getUserLocation = () => {
    setLoading(true);
    setError(null);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Fallback to a default location (e.g., Chicago)
          setUserLocation({
            latitude: 41.8781,
            longitude: -87.6298
          });
          setError('Could not get your location. Using default location.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation not supported by your browser');
      setLoading(false);
    }
  };

  const searchCourses = async () => {
    if (!userLocation && !searchQuery) return;

    setLoading(true);
    setError(null);

    try {
      const results = await golfAPI.searchCourses({
        latitude: userLocation?.latitude,
        longitude: userLocation?.longitude,
        radius: searchRadius,
        query: searchQuery
      });

      // Calculate distance for each course if location is available
      const coursesWithDistance = results.map((course) => ({
        ...course,
        distance: userLocation ? golfAPI.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          course.latitude,
          course.longitude
        ) : 0
      }));

      // Sort by distance if location available, otherwise by name
      if (userLocation) {
        coursesWithDistance.sort((a, b) => 
          (a.distance || 0) - (b.distance || 0)
        );
      }

      setCourses(coursesWithDistance);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching courses:', err);
      // Use mock data for demo purposes if backend fails
      loadMockCourses();
    }
  };

  const loadMockCourses = () => {
    // Mock data for demo/development
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
        phone: '(831) 622-8723',
        website: 'pebblebeach.com',
        rating: 4.9,
        distance: userLocation ? golfAPI.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          36.5674,
          -121.9500
        ) : 0,
        photoUrl: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800',
        tees: {
          female: [],
          male: [
            {
              tee_name: "Blue",
              course_rating: 75.5,
              slope_rating: 145,
              total_yards: 6828,
              par_total: 72,
              holes: [
                { par: 4, yardage: 377, handicap: 8 },
                { par: 5, yardage: 511, handicap: 10 },
                { par: 4, yardage: 390, handicap: 12 },
                { par: 4, yardage: 326, handicap: 16 },
                { par: 3, yardage: 192, handicap: 14 },
                { par: 5, yardage: 506, handicap: 2 },
                { par: 3, yardage: 106, handicap: 18 },
                { par: 4, yardage: 427, handicap: 6 },
                { par: 4, yardage: 481, handicap: 4 },
                { par: 4, yardage: 446, handicap: 5 },
                { par: 4, yardage: 373, handicap: 13 },
                { par: 3, yardage: 201, handicap: 15 },
                { par: 4, yardage: 403, handicap: 9 },
                { par: 5, yardage: 572, handicap: 1 },
                { par: 4, yardage: 396, handicap: 11 },
                { par: 4, yardage: 401, handicap: 7 },
                { par: 3, yardage: 178, handicap: 17 },
                { par: 5, yardage: 543, handicap: 3 }
              ]
            }
          ]
        }
      },
      {
        id: '2',
        name: 'Augusta National Golf Club',
        address: '2604 Washington Rd',
        city: 'Augusta',
        state: 'GA',
        zipCode: '30904',
        latitude: 33.5028,
        longitude: -82.0200,
        phone: '(706) 667-6000',
        rating: 5.0,
        holes: 18,
        par: 72,
        distance: userLocation ? golfAPI.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          33.5028,
          -82.0200
        ) : 0,
        photoUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800'
      }
    ];

    setCourses(mockCourses.sort((a, b) => (a.distance || 0) - (b.distance || 0)));
    setLoading(false);
  };

  const loadTeeTimes = async (courseId: string) => {
    setLoading(true);
    try {
      const times = await golfAPI.getTeeTimes(courseId, selectedDate);
      setTeeTimes(times.filter(t => t.price <= maxPrice));
    } catch (err) {
      console.error('Error loading tee times:', err);
    }
    setLoading(false);
  };

  const handleCourseSelect = (course: GolfCourse) => {
    setSelectedCourse(course);
    loadTeeTimes(course.id);
  };

  const handleBooking = (teeTime: TeeTime) => {
    // Integration point with Fluff Golf Assistant
    alert(`Booking ${playerCount} players for ${teeTime.time} on ${teeTime.date}\n\nThis will integrate with your Fluff Golf Assistant app!`);
    
    // In production, this would:
    // 1. Call GolfNow booking API
    // 2. Process payment
    // 3. Send confirmation to Fluff app
    // 4. Add round to user's schedule
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#0f1419] text-[#f5f5f0]" style={{ fontFamily: 'Mancho, Manrope, sans-serif' }}>
      {/* Header */}
      <header className="bg-gradient-to-r from-[#1a1f2e]/95 to-[#0f1419]/95 backdrop-blur-xl border-b border-amber-900/20 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-fit">
              <img src={fluffLogo} alt="Fluff Golf" className="h-12 w-auto" />
              <div className="hidden sm:block border-l border-amber-700/30 pl-4">
                <h1 className="text-2xl font-bold text-amber-50" style={{ fontFamily: 'Mancho, Manrope, sans-serif', letterSpacing: '0.02em' }}>The Clubhouse</h1>
                <p className="text-[9px] text-amber-200/60 uppercase tracking-[0.2em] font-medium">Premier Course Finder</p>
              </div>
            </div>

            {/* Search Input */}
            <div className="flex-1 max-w-md relative">
              <input
                type="text"
                placeholder="Search premier courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0f1419]/60 border border-amber-800/30 rounded-lg px-5 py-3 text-sm text-amber-50 placeholder:text-amber-200/30 focus:outline-none focus:border-amber-600/60 focus:ring-2 focus:ring-amber-600/20 transition-all backdrop-blur-sm"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-700/20 to-amber-900/20 border border-amber-700/40 rounded-lg text-amber-200 text-sm font-semibold hover:from-amber-700/30 hover:to-amber-900/30 hover:border-amber-600/60 transition-all shadow-lg hover:shadow-amber-900/20"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Refine</span>
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-6 bg-gradient-to-br from-[#1a1f2e]/80 to-[#0f1419]/80 backdrop-blur-xl rounded-xl border border-amber-800/30 space-y-4 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] text-amber-200/70 mb-3 font-semibold">
                    Search Radius: {searchRadius} mi
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="250"
                    value={searchRadius}
                    onChange={(e) => setSearchRadius(Number(e.target.value))}
                    className="w-full accent-amber-600 h-2 bg-amber-900/20 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] text-amber-200/70 mb-3 font-semibold">
                    Max Price: ${maxPrice}
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="500"
                    step="10"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-amber-600 h-2 bg-amber-900/20 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] text-amber-200/70 mb-3 font-semibold">
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-[#0f1419]/60 border border-amber-800/30 rounded-lg px-4 py-2.5 text-sm text-amber-50 focus:outline-none focus:border-amber-600/60 focus:ring-2 focus:ring-amber-600/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] text-amber-200/70 mb-3 font-semibold">
                    Players
                  </label>
                  <select
                    value={playerCount}
                    onChange={(e) => setPlayerCount(Number(e.target.value))}
                    className="w-full bg-[#0f1419]/60 border border-amber-800/30 rounded-lg px-4 py-2.5 text-sm text-amber-50 focus:outline-none focus:border-amber-600/60 focus:ring-2 focus:ring-amber-600/20 transition-all"
                  >
                    <option value={1}>1 Player</option>
                    <option value={2}>2 Players</option>
                    <option value={3}>3 Players</option>
                    <option value={4}>4 Players</option>
                  </select>
                </div>
              </div>

              {userLocation && (
                <div className="flex items-center gap-2 text-xs text-amber-300/80 pt-2">
                  <Navigation className="w-4 h-4" />
                  <span>
                    Your Location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading && !courses.length ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-[#30C476] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#FCF6EB]/40">Finding courses near you...</p>
          </div>
        ) : selectedCourse ? (
          // Tee Times View
          <div>
            <button
              onClick={() => {
                setSelectedCourse(null);
                setTeeTimes([]);
              }}
              className="mb-6 text-sm text-[#30C476] hover:text-[#6EEEA8] transition-colors flex items-center gap-2"
            >
              ← Back to courses
            </button>

            <div className="bg-[#0D0E11] rounded-2xl border border-white/5 overflow-hidden mb-6">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">{selectedCourse.name}</h2>
                <p className="text-sm text-[#FCF6EB]/60 mb-4">
                  {selectedCourse.address}, {selectedCourse.city}, {selectedCourse.state}
                </p>
                
                <div className="flex flex-wrap gap-4 text-sm mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#30C476]" />
                    <span>{selectedCourse.distance} miles away</span>
                  </div>
                  {selectedCourse.rating && (
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{selectedCourse.rating} / 5.0</span>
                    </div>
                  )}
                </div>

                {/* Scorecard Preview */}
                {selectedCourse.tees && (selectedCourse.tees.male.length > 0 || selectedCourse.tees.female.length > 0) && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <h4 className="text-sm font-bold text-[#30C476] uppercase tracking-wider mb-4">Course Scorecard (Blue Tees)</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="text-[#FCF6EB]/40 border-b border-white/5">
                            <th className="py-2 pr-4">Hole</th>
                            {selectedCourse.tees.male[0].holes.map((_, i) => (
                              <th key={i} className="py-2 px-2 text-center">{i + 1}</th>
                            ))}
                            <th className="py-2 pl-4 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-white/5">
                            <td className="py-3 pr-4 font-bold">Par</td>
                            {selectedCourse.tees.male[0].holes.map((hole, i) => (
                              <td key={i} className="py-3 px-2 text-center">{hole.par}</td>
                            ))}
                            <td className="py-3 pl-4 text-right font-bold">{selectedCourse.tees.male[0].par_total}</td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="py-3 pr-4 font-bold">Yards</td>
                            {selectedCourse.tees.male[0].holes.map((hole, i) => (
                              <td key={i} className="py-3 px-2 text-center text-[#30C476]">{hole.yardage}</td>
                            ))}
                            <td className="py-3 pl-4 text-right font-bold text-[#30C476]">{selectedCourse.tees.male[0].total_yards}</td>
                          </tr>
                          <tr>
                            <td className="py-3 pr-4 font-bold">Handicap</td>
                            {selectedCourse.tees.male[0].holes.map((hole, i) => (
                              <td key={i} className="py-3 px-2 text-center text-[#FCF6EB]/40">{hole.handicap}</td>
                            ))}
                            <td className="py-3 pl-4 text-right">-</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <h3 className="text-xl font-bold mb-4">Available Tee Times - {selectedDate}</h3>
            
            {teeTimes.length === 0 ? (
              <div className="text-center py-12 text-[#FCF6EB]/40">
                No tee times available for this date
              </div>
            ) : (
              <div className="grid gap-4">
                {teeTimes.map((teeTime) => (
                  <div
                    key={teeTime.id}
                    className="bg-[#0D0E11] rounded-xl border border-white/5 p-6 hover:border-[#30C476]/30 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <Clock className="w-5 h-5 text-[#30C476] mx-auto mb-1" />
                          <div className="text-lg font-bold">{teeTime.time}</div>
                        </div>

                        <div className="h-12 w-px bg-white/10" />

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-[#FCF6EB]/40" />
                            <span className="text-sm">
                              {teeTime.availableSlots} slots available
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-[#FCF6EB]/40" />
                            <span className="text-sm font-bold text-[#30C476]">
                              ${teeTime.price} per player
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleBooking(teeTime)}
                        disabled={teeTime.availableSlots < playerCount}
                        className="px-6 py-3 bg-[#30C476] hover:bg-[#6EEEA8] text-[#0A0907] rounded-xl font-bold text-sm flex items-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed group-hover:scale-105"
                      >
                        Book Now
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Courses List View
          <div>
            <h2 className="text-3xl font-bold mb-8 text-amber-50" style={{ fontFamily: 'Mancho, Manrope, sans-serif' }}>
              Premier Courses ({courses.length} available)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => handleCourseSelect(course)}
                  className="bg-gradient-to-br from-[#1a1f2e]/60 to-[#0f1419]/60 backdrop-blur-sm rounded-2xl border border-amber-800/20 overflow-hidden hover:border-amber-600/50 hover:shadow-2xl hover:shadow-amber-900/20 transition-all duration-300 cursor-pointer group"
                >
                  {course.photoUrl && (
                    <div className="aspect-video overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f1419] via-transparent to-transparent z-10" />
                      <img
                        src={course.photoUrl}
                        alt={course.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold group-hover:text-amber-400 transition-colors" style={{ fontFamily: 'Mancho, Manrope, sans-serif' }}>
                        {course.name}
                      </h3>
                      {course.rating && (
                        <div className="flex items-center gap-1.5 text-sm bg-amber-900/30 px-2.5 py-1 rounded-full border border-amber-700/30">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span className="text-amber-200 font-semibold">{course.rating}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-amber-100/60 mb-5 font-light">
                      {course.city}, {course.state}
                    </p>

                    <div className="flex items-center justify-between text-sm mb-5">
                      <div className="flex items-center gap-2 text-amber-400">
                        <MapPin className="w-4 h-4" />
                        <span className="font-semibold">{course.distance} mi</span>
                      </div>

                      {course.holes && (
                        <div className="text-amber-100/50 text-xs">
                          {course.holes} holes • Par {course.par}
                        </div>
                      )}
                    </div>

                    <div className="pt-5 border-t border-amber-800/20">
                      <div className="flex items-center justify-between text-xs text-amber-100/40">
                        {course.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{course.phone}</span>
                          </div>
                        )}
                        {course.website && (
                          <div className="flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5" />
                            <span className="uppercase tracking-wider text-[10px]">Website</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
