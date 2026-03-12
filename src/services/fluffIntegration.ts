/**
 * Fluff Golf Assistant Integration Guide
 * How to connect Golf Booking App to your Fluff app
 */

import { db, auth } from '../firebase'; // Updated import from src/firebase.ts
import { 
  doc, 
  setDoc, 
  collection, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  increment 
} from 'firebase/firestore';

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

export async function saveBookingToClubhouse(booking: BookingData) {
  const userId = auth.currentUser?.uid;
  
  if (!userId) {
    // For development, we'll allow mock bookings or throw an error
    console.warn('User not authenticated - using guest account for booking');
    // return 'guest-booking-id'; 
    throw new Error('User not authenticated. Please log in to the Clubhouse.');
  }

  try {
    // Add to user's upcoming rounds in the Clubhouse Project Firestore
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
      source: 'clubhouse-web-app'
    });

    // Update user's stats in Firestore
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'stats.upcomingRounds': increment(1),
      lastBooking: new Date().toISOString()
    }).catch(async (err) => {
      // If user document doesn't exist, create it
      if (err.code === 'not-found') {
        await setDoc(userRef, {
          uid: userId,
          email: auth.currentUser?.email,
          stats: { upcomingRounds: 1 },
          lastBooking: new Date().toISOString()
        });
      } else {
        throw err;
      }
    });

    return roundRef.id;
  } catch (error: any) {
    console.error('Error saving booking:', error);
    throw error;
  }
}

// ==========================================
// INTEGRATION POINT 2: Sync Course to Clubhouse
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

export async function saveCourseToClubhouse(course: CourseData) {
  try {
    // Save course to Clubhouse's course database
    await setDoc(doc(db, 'courses', course.id), {
      ...course,
      addedAt: new Date().toISOString(),
      source: 'clubhouse-web-app'
    }, { merge: true });
  } catch (error) {
    console.error('Error saving course:', error);
  }
}

// ==========================================
// INTEGRATION POINT 3: Update Clubhouse Dashboard
// ==========================================

export async function syncClubhouseDashboard(userId: string) {
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
    console.error('Error syncing dashboard:', error);
  }
}

// ==========================================
// INTEGRATION POINT 4: Booking Flow Handler
// ==========================================

export async function handleClubhouseBooking(
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

    // 2. Save booking to Clubhouse database
    const roundId = await saveBookingToClubhouse(booking);

    // 3. Save course data if not already exists
    await saveCourseToClubhouse(course);

    // 4. Update dashboard
    if (auth.currentUser) {
      await syncClubhouseDashboard(auth.currentUser.uid);
    }

    // 5. Return success
    return {
      success: true,
      roundId,
      message: 'Booking saved to The Clubhouse!'
    };

  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

export default handleClubhouseBooking;
