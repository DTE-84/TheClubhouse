# ⛳ Fluff Golf Booking App

A production-ready React application for finding and booking golf courses with GPS filtering. Integrates with your Fluff Golf Assistant app.

## 🚀 Features

- ✅ **GPS-Based Course Search** - Find courses near you automatically
- ✅ **Radius Filtering** - Search 5-100 miles around your location
- ✅ **Real-Time Tee Times** - See available booking slots
- ✅ **Price Filtering** - Set max price per player
- ✅ **Player Count** - Book for 1-4 players
- ✅ **Course Details** - Ratings, photos, contact info
- ✅ **Distance Calculation** - Precise Haversine formula
- ✅ **Responsive Design** - Works on mobile and desktop
- ✅ **Fluff Integration Ready** - Connects to your golf assistant app

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- GolfCourseAPI account (FREE) - https://golfcourseapi.com/
- GolfNow API access (Optional, for booking) - https://api.gnsvc.com/
- Firebase project (for Fluff integration)

## 🛠️ Quick Start

### 1. Install Dependencies

```bash
npm install lucide-react
```

### 2. Get FREE API Key

1. Go to https://golfcourseapi.com/
2. Sign up (FREE)
3. Get your API key
4. Add to `.env`:

```env
VITE_GOLF_COURSE_API_KEY=your_key_here
```

### 3. Run the App

```bash
npm run dev
```

## 🔌 API Options

### Option 1: GolfCourseAPI.com (FREE - Recommended for Bootcamp)

**What you get:**
- 30,000+ courses worldwide
- Course details & GPS coordinates
- Ratings and reviews
- **100% FREE**

**Perfect for:**
- Bootcamp demos
- MVP development
- Course search features

### Option 2: GolfNow API (Paid - For Production)

**What you get:**
- Real-time tee time booking
- Payment processing
- 9,000+ courses in USA
- Dynamic pricing

**Apply at:** https://api.gnsvc.com/

## 🎯 Bootcamp Demo Strategy

### Phase 1: Use Mock Data (No API needed)

The component includes built-in mock data. Just use it as-is!

```typescript
// Already built-in - works immediately
const loadMockCourses = () => { ... }
```

### Phase 2: Add FREE API

Once you present the concept, add GolfCourseAPI:

```bash
# Sign up at golfcourseapi.com
# Add key to .env
# Courses now load from real database!
```

### Phase 3: Production (Post-Bootcamp)

Apply for GolfNow API for real bookings.

## 🔗 Fluff Integration

### Connect to Your Golf App

```typescript
const handleBooking = async (teeTime) => {
  // 1. Book the time
  const booking = await bookTeeTime(teeTime);
  
  // 2. Save to Fluff Firebase
  await db.collection('rounds').add({
    userId: auth.currentUser.uid,
    courseId: booking.courseId,
    date: booking.date,
    time: booking.time
  });
  
  // 3. Update Fluff dashboard
  syncFluffDashboard();
};
```

## 🎨 Customization

Built with your Fluff theme colors:

```css
--color-fluff-primary: #30C476
--color-fluff-hover: #6EEEA8
--color-bg-dark: #0A0907
```

## 🎓 Bootcamp Presentation Tips

### Demo Script

1. **Show GPS**: "App detects my location automatically"
2. **Filters**: "Adjust radius - 5 to 100 miles"  
3. **Course Cards**: "See distance, ratings, details"
4. **Tee Times**: "Click course → available times"
5. **Booking**: "One-click booking syncs to Fluff"

### Technical Highlights

- "React + TypeScript + Tailwind CSS"
- "Haversine GPS distance algorithm"  
- "Integrates with FREE golf API"
- "Connects to my Fluff Golf Assistant"
- "Production-ready architecture"

## 🚀 Deployment

### Vercel (1-Click)

```bash
vercel
```

### Add to Your Portfolio

- **Live Demo**: [your-vercel-url]
- **GitHub**: Link to repo
- **Article**: "Building a GPS-Filtered Golf Booking App"

## 📱 Mobile Features

- GPS works on all mobile browsers
- Touch-optimized controls
- Responsive grid layout
- Fast image loading

## 🐛 Common Issues

**GPS not working?**
```typescript
// Browser permissions required
// Click "Allow" when prompted
```

**No API key?**
```typescript
// Uses built-in mock data
// Sign up at golfcourseapi.com for real data
```

## 📄 Files Included

1. `GolfBookingApp.tsx` - Main component
2. `golfAPIService.ts` - API integration
3. `.env.example` - Environment template  
4. `README.md` - This file

## 🤝 Next Steps

1. ✅ Present to bootcamp
2. ✅ Deploy to Vercel
3. ✅ Get GolfCourseAPI key
4. ✅ Connect to Fluff
5. ✅ Add to portfolio

---

**Built by Drew @ DTE Solutions**
**Part of the Fluff Golf Assistant ecosystem** ⛳

Ready to ace your bootcamp presentation! 🎯
