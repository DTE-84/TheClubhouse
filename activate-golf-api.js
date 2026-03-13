const testKey = async () => {
  console.log('Testing API key: DQ6Y6JWWBAEJJRGBPNL2RMZSFA');
  
  try {
    // Test 1: X-API-Key header
    console.log('\nTest 1: X-API-Key header');
    const response1 = await fetch('https://api.golfcourseapi.com/v1/search?search_query=pebble', {
      headers: {
        'X-API-Key': 'DQ6Y6JWWBAEJJRGBPNL2RMZSFA'
      }
    });
    console.log('Status:', response1.status);
    const data1 = await response1.text();
    console.log('Response:', data1.substring(0, 200));
    
    // Test 2: api-key header
    console.log('\nTest 2: api-key header');
    const response2 = await fetch('https://api.golfcourseapi.com/v1/search?search_query=pebble', {
      headers: {
        'api-key': 'DQ6Y6JWWBAEJJRGBPNL2RMZSFA'
      }
    });
    console.log('Status:', response2.status);
    const data2 = await response2.text();
    console.log('Response:', data2.substring(0, 200));
    
    // Test 3: Authorization: Api-Key
    console.log('\nTest 3: Authorization: Api-Key');
    const response3 = await fetch('https://api.golfcourseapi.com/v1/search?search_query=pebble', {
      headers: {
        'Authorization': 'Api-Key DQ6Y6JWWBAEJJRGBPNL2RMZSFA'
      }
    });
    console.log('Status:', response3.status);
    const data3 = await response3.text();
    console.log('Response:', data3.substring(0, 200));
    
  } catch (error) {
    console.error('Error:', error);
  }
};

testKey();
