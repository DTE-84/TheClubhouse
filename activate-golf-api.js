import "dotenv/config";

const testKey = async () => {
  const apiKey = process.env.GOLF_COURSE_API_KEY; 
  
  if (!apiKey) {
    console.error('❌ GOLF_COURSE_API_KEY is missing from environment variables.');
    return;
  }

  console.log('Testing API key from environment...');
  
  try {
    // Test 1: X-API-Key header
    console.log('\nTest 1: X-API-Key header');
    const response1 = await fetch('https://api.golfcourseapi.com/v1/search?search_query=pebble', {
      headers: {
        'X-API-Key': apiKey
      }
    });
    console.log('Status:', response1.status);
    const data1 = await response1.text();
    console.log('Response:', data1.substring(0, 200));
    
  } catch (error) {
    console.error('Error:', error);
  }
};

testKey();
