import { useState, useEffect } from 'react';
import HomeLayout from '@/components/HomeLayout';
import CourseCard from '@/components/CourseCard';
import { MapPin, DollarSign, Calendar, Users, Sliders } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  location: string;
  distance: number;
  rating: number;
  holes: number;
  par: number;
  price: number;
  image: string;
  availableTimes: number;
}

// Mock course data
const mockCourses: Course[] = [
  {
    id: '1',
    name: 'Pebble Beach Golf Links',
    location: 'Monterey, CA',
    distance: 12.3,
    rating: 9.2,
    holes: 18,
    par: 72,
    price: 350,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=400&fit=crop',
    availableTimes: 5,
  },
  {
    id: '2',
    name: 'Torrey Pines Golf Course',
    location: 'San Diego, CA',
    distance: 8.7,
    rating: 8.8,
    holes: 18,
    par: 72,
    price: 245,
    image: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=600&h=400&fit=crop',
    availableTimes: 8,
  },
  {
    id: '3',
    name: 'Cypress Point Club',
    location: 'Carmel, CA',
    distance: 15.2,
    rating: 9.0,
    holes: 18,
    par: 72,
    price: 300,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=400&fit=crop',
    availableTimes: 3,
  },
  {
    id: '4',
    name: 'Spanish Bay Golf Club',
    location: 'San Francisco, CA',
    distance: 5.4,
    rating: 8.5,
    holes: 18,
    par: 72,
    price: 210,
    image: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=600&h=400&fit=crop',
    availableTimes: 12,
  },
  {
    id: '5',
    name: 'The Old Course',
    location: 'St. Andrews, Scotland',
    distance: 2840,
    rating: 9.5,
    holes: 18,
    par: 72,
    price: 400,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=400&fit=crop',
    availableTimes: 2,
  },
  {
    id: '6',
    name: 'Augusta National Golf Club',
    location: 'Augusta, GA',
    distance: 2100,
    rating: 9.8,
    holes: 18,
    par: 72,
    price: 500,
    image: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=600&h=400&fit=crop',
    availableTimes: 1,
  },
];

export default function Index() {
  const [radius, setRadius] = useState(25);
  const [maxPrice, setMaxPrice] = useState(500);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [players, setPlayers] = useState(4);
  const [showFilters, setShowFilters] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Trigger animations on mount
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const filteredCourses = mockCourses.filter(
    (course) => course.distance <= radius && course.price <= maxPrice
  );

  const handleBook = (courseId: string) => {
    const course = mockCourses.find((c) => c.id === courseId);
    alert(`Booking tee time at ${course?.name} for ${date} with ${players} players!`);
  };

  return (
    <HomeLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
        {/* Hero Section */}
        <div className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-20">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative container mx-auto px-4 md:px-6">
            <div className="max-w-3xl">
              <h1
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 tracking-tight leading-tight transition-all duration-700"
                style={{
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
                }}
              >
                Find Your Perfect Golf Experience
              </h1>
              <p
                className="text-xl md:text-2xl text-muted-foreground font-light mb-8 leading-relaxed transition-all duration-700 delay-100"
                style={{
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
                  transitionDelay: '100ms',
                }}
              >
                Discover premium courses, book instantly, and play like a champion. Your next great round awaits.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 md:px-6 py-12">
          {/* Filters Section */}
          <div className="mb-12">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-primary font-semibold hover:text-primary/80 transition-colors mb-4 md:hidden tracking-wide"
            >
              <Sliders size={20} />
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>

            {showFilters && (
              <div
                className="premium-card p-8 transition-all duration-700"
                style={{
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
                  transitionDelay: '200ms',
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {/* Radius Filter */}
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 font-bold text-foreground text-sm uppercase tracking-wider">
                      <div className="p-2.5 bg-primary/10 rounded-lg">
                        <MapPin size={18} className="text-primary" />
                      </div>
                      Radius
                    </label>
                    <div className="space-y-3">
                      <input
                        type="range"
                        min="5"
                        max="100"
                        value={radius}
                        onChange={(e) => setRadius(Number(e.target.value))}
                        className="w-full h-2 bg-border/30 rounded-full appearance-none cursor-pointer accent-primary"
                      />
                      <div className="text-2xl font-bold text-primary">
                        {radius} <span className="text-sm text-muted-foreground font-normal">miles</span>
                      </div>
                    </div>
                  </div>

                  {/* Price Filter */}
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 font-bold text-foreground text-sm uppercase tracking-wider">
                      <div className="p-2.5 bg-primary/10 rounded-lg">
                        <DollarSign size={18} className="text-primary" />
                      </div>
                      Price
                    </label>
                    <div className="space-y-3">
                      <input
                        type="range"
                        min="50"
                        max="500"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="w-full h-2 bg-border/30 rounded-full appearance-none cursor-pointer accent-primary"
                      />
                      <div className="text-2xl font-bold text-primary">
                        ${maxPrice}
                      </div>
                    </div>
                  </div>

                  {/* Date Filter */}
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 font-bold text-foreground text-sm uppercase tracking-wider">
                      <div className="p-2.5 bg-primary/10 rounded-lg">
                        <Calendar size={18} className="text-primary" />
                      </div>
                      Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-3 border border-border/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-white font-medium"
                    />
                  </div>

                  {/* Players Filter */}
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 font-bold text-foreground text-sm uppercase tracking-wider">
                      <div className="p-2.5 bg-primary/10 rounded-lg">
                        <Users size={18} className="text-primary" />
                      </div>
                      Players
                    </label>
                    <select
                      value={players}
                      onChange={(e) => setPlayers(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-border/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-white font-medium"
                    >
                      <option value={1}>1 Player</option>
                      <option value={2}>2 Players</option>
                      <option value={3}>3 Players</option>
                      <option value={4}>4 Players</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Header */}
          <div
            className="flex items-baseline justify-between mb-12 transition-all duration-700"
            style={{
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
              transitionDelay: '300ms',
            }}
          >
            <div>
              <h2 className="text-4xl font-bold text-foreground tracking-tight">
                Featured Courses
              </h2>
              <p className="text-muted-foreground mt-2 text-lg">
                {filteredCourses.length} premium courses match your criteria
              </p>
            </div>
          </div>

          {/* Courses Grid */}
          {filteredCourses.length > 0 ? (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 transition-all duration-700"
              style={{
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: '400ms',
              }}
            >
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onBook={handleBook}
                />
              ))}
            </div>
          ) : (
            <div className="premium-card p-12 text-center">
              <div className="text-5xl mb-4">🎯</div>
              <p className="text-xl font-semibold text-foreground mb-2">
                No courses found
              </p>
              <p className="text-muted-foreground">
                Try adjusting your filters or expanding your search radius to find your perfect course.
              </p>
            </div>
          )}

          {/* Footer Info Section */}
          <div
            className="mt-20 relative transition-all duration-700"
            style={{
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
              transitionDelay: '500ms',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-3xl blur" />
            <div className="relative premium-card p-10 md:p-12">
              <h3 className="text-3xl font-bold text-foreground mb-8 tracking-tight">Why TheClubHouse?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="group">
                  <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">⚡</div>
                  <h4 className="font-bold text-foreground mb-2 text-lg">Real-Time Availability</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Instantly see available tee times and book your next round in seconds.
                  </p>
                </div>
                <div className="group">
                  <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">🎯</div>
                  <h4 className="font-bold text-foreground mb-2 text-lg">Smart Filtering</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Find courses that match your preferences, budget, and playing style perfectly.
                  </p>
                </div>
                <div className="group">
                  <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">📍</div>
                  <h4 className="font-bold text-foreground mb-2 text-lg">GPS Discovery</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Explore premium courses nearby using intelligent location-based recommendations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
