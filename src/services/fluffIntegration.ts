/**
 * Fluff Golf Assistant Integration Guide
 * How to connect Golf Booking App to your Fluff app
 */

import { db, auth } from './firebase'; // Your existing Fluff Firebase
import { doc, setDoc, collection, addDoc, updateDoc } from 'firebase/firestore';

// ==========================================
// INTEGRATION POINT 1: Save Booking to Fluff
// ==========================================

interface BookingData {
  courseId: string;
  courseName: string;
  date: string;
  time: string;
  price: number;
  playerCount: number;
  holes: number;
}

export async function saveBookingToFluff(booking: BookingData) {
  const userId = auth.currentUser?.uid;
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  try {
    // Add to user's upcoming rounds in Fluff
    const roundRef = await addDoc(collection(db, 'rounds'), {
      userId,
      courseName: booking.courseName,
      date: booking.date,
      teeTime: booking.time,
      scheduledPlayers: booking.playerCount,
      holes: booking.holes,
      bookedPrice: booking.price,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      source: 'fluff-booking-app'
    });

    // Update user's stats
    await updateDoc(doc(db, 'users', userId), {
      'stats.upcomingRounds': increment(1),
      lastBooking: new Date().toISOString()
    });

    return roundRef.id;
  } catch (error) {
    console.error('Error saving booking to Fluff:', error);
    throw error;
  }
}

// ==========================================
// INTEGRATION POINT 2: Sync Course to Fluff
// ==========================================

interface CourseData {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  rating?: number;
  holes?: number;
  par?: number;
}

export async function saveCourseToFluff(course: CourseData) {
  try {
    // Save course to Fluff's course database
    await setDoc(doc(db, 'courses', course.id), {
      ...course,
      addedAt: new Date().toISOString(),
      source: 'booking-app'
    });
  } catch (error) {
    console.error('Error saving course to Fluff:', error);
  }
}

// ==========================================
// INTEGRATION POINT 3: Update Fluff Dashboard
// ==========================================

export async function syncFluffDashboard(userId: string) {
  try {
    // Fetch upcoming rounds
    const roundsQuery = query(
      collection(db, 'rounds'),
      where('userId', '==', userId),
      where('status', '==', 'scheduled'),
      orderBy('date', 'asc')
    );

    const snapshot = await getDocs(roundsQuery);
    
    // Update dashboard with upcoming rounds count
    await updateDoc(doc(db, 'users', userId), {
      'dashboard.upcomingRounds': snapshot.size,
      'dashboard.lastSync': new Date().toISOString()
    });
  } catch (error) {
    console.error('Error syncing Fluff dashboard:', error);
  }
}

// ==========================================
// INTEGRATION POINT 4: Booking Flow Handler
// ==========================================

export async function handleFluffBooking(
  teeTime: any,
  course: any,
  playerCount: number
) {
  try {
    // 1. Create booking object
    const booking: BookingData = {
      courseId: course.id,
      courseName: course.name,
      date: teeTime.date,
      time: teeTime.time,
      price: teeTime.price,
      playerCount,
      holes: teeTime.holes
    };

    // 2. Save booking to Fluff database
    const roundId = await saveBookingToFluff(booking);

    // 3. Save course data if not already exists
    await saveCourseToFluff(course);

    // 4. Update dashboard
    await syncFluffDashboard(auth.currentUser!.uid);

    // 5. Return success
    return {
      success: true,
      roundId,
      message: 'Booking saved to Fluff Golf Assistant!'
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// ==========================================
// USAGE IN GOLF BOOKING COMPONENT
// ==========================================

/*
In your GolfBookingApp.tsx, replace the handleBooking function:

const handleBooking = async (teeTime: TeeTime) => {
  if (!selectedCourse) return;
  
  setLoading(true);
  
  try {
    // Call Fluff integration
    const result = await handleFluffBooking(
      teeTime,
      selectedCourse,
      playerCount
    );
    
    if (result.success) {
      // Show success message
      alert(`✅ Booked Successfully!\n\nYour round has been added to Fluff Golf Assistant.\n\nRound ID: ${result.roundId}`);
      
      // Optionally redirect to Fluff app
      // window.location.href = '/fluff-dashboard';
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    alert(`❌ Booking Failed: ${error.message}`);
  } finally {
    setLoading(false);
  }
};
*/

// ==========================================
// HELPER: Increment Firestore Field
// ==========================================

import { increment } from 'firebase/firestore';

// Already imported above, but shown here for reference
// Use increment() when updating numeric fields

// ==========================================
// EXAMPLE: Complete Integration
// ==========================================

/*
Full example of integrated booking flow:

1. User searches courses (Golf Booking App)
2. User selects course and tee time
3. User clicks "Book Now"
4. handleFluffBooking() is called
5. Round is saved to Fluff database
6. Course is saved to Fluff courses collection
7. User's dashboard is updated
8. User sees confirmation
9. User can view booking in Fluff app
*/

// ==========================================
// FIRESTORE STRUCTURE FOR FLUFF INTEGRATION
// ==========================================

/*
/rounds/{roundId}
  - userId: string
  - courseName: string
  - date: string (YYYY-MM-DD)
  - teeTime: string (HH:MM AM/PM)
  - scheduledPlayers: number
  - holes: number
  - bookedPrice: number
  - status: 'scheduled' | 'completed' | 'cancelled'
  - createdAt: timestamp
  - source: 'fluff-booking-app'

/courses/{courseId}
  - name: string
  - address: string
  - city: string
  - state: string
  - latitude: number
  - longitude: number
  - rating: number (optional)
  - holes: number (optional)
  - par: number (optional)
  - addedAt: timestamp
  - source: 'booking-app'

/users/{userId}
  - stats:
      - upcomingRounds: number
  - dashboard:
      - upcomingRounds: number
      - lastSync: timestamp
  - lastBooking: timestamp
*/

export default handleFluffBooking;
