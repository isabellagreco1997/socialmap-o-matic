// Simple test script to verify the check-subscription function
import fetch from 'node-fetch';

async function testCheckSubscription() {
  try {
    console.log('Testing check-subscription function...');
    
    const response = await fetch('http://localhost:8888/.netlify/functions/check-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: 'test@example.com',
      }),
    });

    const responseText = await response.text();
    console.log('Response status:', response.status);
    
    try {
      const data = JSON.parse(responseText);
      console.log('Response data:', JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Failed to parse response as JSON:', responseText);
    }
  } catch (error) {
    console.error('Error testing function:', error);
  }
}

testCheckSubscription(); 