const axios = require('axios');

async function testAgentResponseFormat() {
  console.log('🔍 Testing Agent Response Format...');
  console.log('📅 Testing at:', new Date().toISOString());
  
  const apiKey = 'sk-default-umuEtNZJCnYbBCmy448B42Neb90nTx5W';
  const baseURL = 'https://agent-prod.studio.lyzr.ai';
  const endpoint = '/v3/inference/chat/';
  
  const testAgent = {
    name: 'IEP Intake Agent',
    id: '68b3330a25170ae5463dc24d',
    testMessage: 'Please extract key information from this IEP document. Document ID: test_doc_123. Return the data in JSON format with fields: studentName, gradeLevel, schoolName, iepDate, nextReviewDate.'
  };
  
  console.log(`\n🤖 Testing ${testAgent.name}`);
  console.log(`   ID: ${testAgent.id}`);
  console.log(`   Message: ${testAgent.testMessage}`);
  
  try {
    const response = await axios.post(
      `${baseURL}${endpoint}`,
      {
        user_id: 'test@university-startups.com',
        agent_id: testAgent.id,
        session_id: `test-session-${Date.now()}`,
        message: testAgent.testMessage
      },
      {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      }
    );
    
    console.log(`\n✅ SUCCESS! Agent responded`);
    console.log(`   HTTP Status: ${response.status}`);
    console.log(`   Response Type: ${typeof response.data}`);
    console.log(`   Response Keys: ${Object.keys(response.data || {}).join(', ')}`);
    
    console.log(`\n📄 Full Response:`);
    console.log(JSON.stringify(response.data, null, 2));
    
    // Check if response has expected structure
    if (response.data && typeof response.data === 'object') {
      console.log(`\n🔍 Response Analysis:`);
      
      // Check for common response patterns
      if (response.data.message) {
        console.log(`   - Has 'message' field: ${response.data.message.substring(0, 100)}...`);
      }
      if (response.data.content) {
        console.log(`   - Has 'content' field: ${response.data.content.substring(0, 100)}...`);
      }
      if (response.data.response) {
        console.log(`   - Has 'response' field: ${response.data.response.substring(0, 100)}...`);
      }
      if (response.data.data) {
        console.log(`   - Has 'data' field: ${JSON.stringify(response.data.data).substring(0, 100)}...`);
      }
      if (response.data.result) {
        console.log(`   - Has 'result' field: ${JSON.stringify(response.data.result).substring(0, 100)}...`);
      }
      
      // Check for JSON in text fields
      const textFields = [response.data.message, response.data.content, response.data.response].filter(Boolean);
      for (const field of textFields) {
        try {
          const parsed = JSON.parse(field);
          console.log(`   - Found JSON in text field: ${Object.keys(parsed).join(', ')}`);
        } catch (e) {
          // Not JSON, that's fine
        }
      }
    }
    
  } catch (error) {
    console.log(`\n❌ ERROR`);
    
    if (error.code === 'ECONNABORTED') {
      console.log(`   Request timed out after 30 seconds`);
    } else if (error.response) {
      console.log(`   HTTP Status: ${error.response.status}`);
      console.log(`   Error: ${JSON.stringify(error.response.data).substring(0, 200)}...`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
  }
}

// Run the test
testAgentResponseFormat()
  .then(() => {
    console.log('\n✅ Response format test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Response format test failed:', error);
    process.exit(1);
  });
