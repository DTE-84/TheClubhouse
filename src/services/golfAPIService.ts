/**
 * Golf API Service
 * Integrates with GolfCourseAPI.com (FREE) and GolfNow API (Paid)
 */

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

interface SearchParams {
  latitude: number;
  longitude: number;
  radius: number; // in miles
  maxPrice?: number;
  date?: string;
}

class GolfAPIService {
  private golfCourseAPIKey: string;
  private golfNowAPIKey: string;
  private golfNowBaseURL: string;
  
  constructor() {
    // Get API keys from environment variables
    this.golfCourseAPIKey = import.meta.env.VITE_GOLF_COURSE_API_KEY || '';
    this.golfNowAPIKey = import.meta.env.VITE_GOLF_NOW_API_KEY || '';
    this.golfNowBaseURL = import.meta.env.VITE_GOLF_NOW_BASE_URL || 'https://api.gnsvc.com/rest';
  }

  /**
   * Search for golf courses using GolfCourseAPI.com (FREE)
   * Sign up at: https://golfcourseapi.com/
   */
  async searchCourses(params: SearchParams): Promise<GolfCourse[]> {
    try {
      const response = await fetch(
        `https://api.golfcourseapi.com/courses?lat=${params.latitude}&lng=${params.longitude}&radius=${params.radius}`,
        {
          headers: {
            'Authorization': `Bearer ${this.golfCourseAPIKey}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`GolfCourseAPI error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform API response to our format
      return data.courses.map((course: any) => ({
        id: course.id,
        name: course.name,
        address: course.address,
        city: course.city,
        state: course.state,
        zipCode: course.zip,
        latitude: course.lat,
        longitude: course.lng,
        phone: course.phone,
        website: course.website,
        rating: course.rating,
        holes: course.holes,
        par: course.par,
        photoUrl: course.photo_url
      }));
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  }

  /**
   * Get available tee times using GolfNow API
   * Requires GolfNow API access (apply at: https://api.gnsvc.com/)
   */
  async getTeeTimes(courseId: string, date: string): Promise<TeeTime[]> {
    try {
      // GolfNow API endpoint for tee times
      const response = await fetch(
        `${this.golfNowBaseURL}/channel/11329/facilities/${courseId}/tee-times?date=${date}`,
        {
          headers: {
            'Authorization': `Bearer ${this.golfNowAPIKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`GolfNow API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform API response to our format
      return data.teeTimes.map((teeTime: any) => ({
        id: teeTime.id,
        courseId: courseId,
        time: teeTime.time,
        date: date,
        availableSlots: teeTime.available_slots,
        price: teeTime.price,
        holes: teeTime.holes
      }));
    } catch (error) {
      console.error('Error fetching tee times:', error);
      throw error;
    }
  }

  /**
   * Book a tee time using GolfNow API
   */
  async bookTeeTime(teeTimeId: string, playerCount: number, userInfo: any): Promise<any> {
    try {
      const response = await fetch(
        `${this.golfNowBaseURL}/bookings`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.golfNowAPIKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            teeTimeId,
            playerCount,
            customerInfo: userInfo
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Booking failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error booking tee time:', error);
      throw error;
    }
  }

  /**
   * Calculate distance between two GPS coordinates using Haversine formula
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  }

  private toRad(value: number): number {
    return value * Math.PI / 180;
  }
}

// Export singleton instance
export const golfAPI = new GolfAPIService();

// Export types
export type { GolfCourse, TeeTime, SearchParams };
