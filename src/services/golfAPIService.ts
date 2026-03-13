/**
 * Golf API Service
 * Points to the local DTE-Clubhouse Backend Proxy
 */

interface Hole {
  par: number;
  yardage: number;
  handicap: number;
}

interface TeeBox {
  tee_name: string;
  course_rating: number;
  slope_rating: number;
  total_yards: number;
  par_total: number;
  holes: Hole[];
}

interface GolfCourse {
  id: string;
  name: string;
  club_name?: string;
  course_name?: string;
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
  tees?: {
    female: TeeBox[];
    male: TeeBox[];
  };
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
interface SearchParams {
  latitude?: number;
  longitude?: number;
  radius?: number; // in miles
  query?: string;
  maxPrice?: number;
  date?: string;
}

class GolfAPIService {
  private baseURL: string;

  constructor() {
    // In development, this points to our local express server
    // In production, this would be your deployed API URL
    this.baseURL = import.meta.env.VITE_API_URL || '/api';
    console.log('⛳ GolfAPI Service Connected to Backend');
  }

  /**
   * Search for golf courses via our Local Proxy
   */
  async searchCourses(params: SearchParams): Promise<GolfCourse[]> {
    const { latitude, longitude, radius, query } = params;

    if (query) {
      console.log(`📡 Uplink: Searching for "${query}"`);
    } else {
      console.log(`📡 Uplink: Scanning radius ${radius}mi at [${latitude}, ${longitude}]`);
    }

    try {
      let url = `${this.baseURL}/courses/search?`;
      if (query) {
        url += `q=${encodeURIComponent(query)}`;
      } else {
        url += `lat=${latitude}&lng=${longitude}&radius=${radius}`;
      }

      const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // The local proxy returns the normalized data
      const rawCourses = data.courses || data.data || (Array.isArray(data) ? data : []);
      
      return rawCourses.map((course: any) => ({
        id: (course._id || course.id)?.toString() || Math.random().toString(),
        name: course.name || course.course_name || course.club_name || 'Unknown Championship Course',
        club_name: course.club_name || course.name,
        course_name: course.course_name || course.name,
        address: course.address || course.location?.address || '',
        city: course.city || course.location?.city || '',
        state: course.state || course.location?.state || '',
        zipCode: course.zip || course.zipCode || course.location?.zipCode || '',
        latitude: parseFloat(course.lat || course.latitude || course.location?.latitude || params.latitude || 0),
        longitude: parseFloat(course.lng || course.longitude || course.location?.longitude || params.longitude || 0),
        phone: course.phone,
        website: course.website,
        rating: course.rating || course.courseRating || 4.5,
        photoUrl: course.photoUrl || course.photo_url || `https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&sig=${Math.random()}`,
        tees: course.tees
      }));
    } catch (error) {
      console.error('❌ Search Failed:', error);
      throw error;
    }
  }

  async getTeeTimes(courseId: string, date: string): Promise<TeeTime[]> {
    console.log(`📡 Uplink: Fetching tee times for ${courseId} on ${date}`);
    // Mocking tee times for the bootcamp - in production, this would call GolfNow
    return [
      { id: `t1-${courseId}`, courseId, time: '7:30 AM', date, availableSlots: 4, price: 85, holes: 18 },
      { id: `t2-${courseId}`, courseId, time: '8:45 AM', date, availableSlots: 2, price: 125, holes: 18 },
      { id: `t3-${courseId}`, courseId, time: '10:15 AM', date, availableSlots: 4, price: 110, holes: 18 },
      { id: `t4-${courseId}`, courseId, time: '1:30 PM', date, availableSlots: 1, price: 75, holes: 18 }
    ];
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Miles
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  }

  private toRad(value: number): number {
    return value * Math.PI / 180;
  }
}

export const golfAPI = new GolfAPIService();
export type { GolfCourse, TeeTime, SearchParams };
