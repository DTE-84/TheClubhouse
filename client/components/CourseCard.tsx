import { MapPin, Zap, Trophy, ArrowUpRight } from 'lucide-react';

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

interface CourseCardProps {
  course: Course;
  onBook: (courseId: string) => void;
}

export default function CourseCard({ course, onBook }: CourseCardProps) {
  return (
    <div className="premium-card premium-card:hover group overflow-hidden">
      {/* Image Container */}
      <div className="relative h-56 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden">
        <img
          src={course.image}
          alt={course.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Price Badge */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md text-foreground px-4 py-2 rounded-full text-sm font-bold tracking-tight shadow-lg">
          ${course.price}
        </div>

        {/* Rating Badge */}
        <div className="absolute top-4 left-4 bg-accent/95 backdrop-blur-md text-accent-foreground px-3 py-2 rounded-full text-xs font-bold tracking-wide flex items-center gap-1">
          ★ {course.rating}
        </div>
      </div>

      {/* Content */}
      <div className="p-7">
        {/* Header */}
        <h3 className="text-2xl font-bold text-foreground mb-2 tracking-tight">{course.name}</h3>
        <div className="flex items-center gap-1.5 text-muted-foreground mb-6">
          <MapPin size={16} className="flex-shrink-0" />
          <span className="text-sm font-medium">{course.location}</span>
          <span className="text-xs text-muted-foreground/60">• {course.distance} mi</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6 pb-6 border-b border-border/30">
          <div className="text-center px-2 py-1">
            <div className="text-3xl font-bold text-primary">{course.holes}</div>
            <div className="text-xs text-muted-foreground/70 font-medium mt-1 tracking-wide uppercase">Holes</div>
          </div>
          <div className="text-center px-2 py-1 border-l border-r border-border/20">
            <div className="text-3xl font-bold text-primary">Par {course.par}</div>
            <div className="text-xs text-muted-foreground/70 font-medium mt-1 tracking-wide uppercase">Par</div>
          </div>
          <div className="text-center px-2 py-1">
            <div className="text-3xl font-bold text-primary">{course.rating}</div>
            <div className="text-xs text-muted-foreground/70 font-medium mt-1 tracking-wide uppercase">Rating</div>
          </div>
        </div>

        {/* Availability */}
        <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-xl border border-secondary/20">
          <Zap size={18} className="text-secondary flex-shrink-0" />
          <div>
            <span className="text-sm font-bold text-foreground">
              {course.availableTimes} Tee Times
            </span>
            <div className="text-xs text-muted-foreground/70">Available today</div>
          </div>
        </div>

        {/* Book Button */}
        <button
          onClick={() => onBook(course.id)}
          className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground font-bold py-3.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn premium-button tracking-wide uppercase text-sm shadow-md hover:shadow-lg"
        >
          <Trophy size={20} />
          Book Now
          <ArrowUpRight size={18} className="opacity-0 group-hover/btn:opacity-100 transition-opacity" />
        </button>
      </div>
    </div>
  );
}
