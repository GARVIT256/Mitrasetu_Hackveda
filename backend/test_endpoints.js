const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let token;
let userId;
let circleId;

const testEndpoints = async () => {
  try {
    // 1. Register User
    console.log('Testing: POST /api/auth/register');
    const userCredentials = {
      name: 'Test User',
      email: `testuser_${Date.now()}@example.com`,
      password: 'password123'
    };
    const registerRes = await axios.post(`${API_URL}/auth/register`, userCredentials);
    token = registerRes.data.token;
    console.log('Register User Success. Token:', token);

    // Decode token to get user ID
    const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    userId = decodedToken.user.id;
    console.log('User ID:', userId);

    const authHeader = { headers: { 'x-auth-token': token } };

    // 2. Login User
    console.log('\nTesting: POST /api/auth/login');
    const loginRes = await axios.post(`${API_URL}/auth/login`, { email: userCredentials.email, password: userCredentials.password });
    token = loginRes.data.token;
    console.log('Login User Success. Token:', token);


    // 3. Get User Profile
    console.log('\nTesting: GET /api/user/:id');
    const userRes = await axios.get(`${API_URL}/user/${userId}`, authHeader);
    console.log('Get User Profile Success:', userRes.data);

    // 4. Update User Profile
    console.log('\nTesting: PUT /api/user/update');
    const updatedUserRes = await axios.put(`${API_URL}/user/update`, { name: 'Test User Updated' }, authHeader);
    console.log('Update User Profile Success:', updatedUserRes.data);

    // 5. Submit PHQ-9
    console.log('\nTesting: POST /api/screening/phq9');
    const phq9Res = await axios.post(`${API_URL}/screening/phq9`, { answers: [1, 2, 3, 1, 2, 3, 1, 2, 3] }, authHeader);
    console.log('Submit PHQ-9 Success:', phq9Res.data);

    // 6. Submit GAD-7
    console.log('\nTesting: POST /api/screening/gad7');
    const gad7Res = await axios.post(`${API_URL}/screening/gad7`, { answers: [1, 2, 3, 1, 2, 3, 1] }, authHeader);
    console.log('Submit GAD-7 Success:', gad7Res.data);

    // 7. Create Circle
    console.log('\nTesting: POST /api/circle/create');
    const circleRes = await axios.post(`${API_URL}/circle/create`, { name: `Test Circle ${Date.now()}` }, authHeader);
    circleId = circleRes.data._id;
    console.log('Create Circle Success:', circleRes.data);

    // 8. Post Message in Circle
    console.log('\nTesting: POST /api/circle/:id/message');
    const messageRes = await axios.post(`${API_URL}/circle/${circleId}/message`, { message: 'Hello Circle!' }, authHeader);
    console.log('Post Message Success:', messageRes.data);

    // 9. Get Circle
    console.log('\nTesting: GET /api/circle/:id');
    const getCircleRes = await axios.get(`${API_URL}/circle/${circleId}`, authHeader);
    console.log('Get Circle Success:', getCircleRes.data);

    // 10. Chat
    console.log('\nTesting: POST /api/chat');
    const chatRes = await axios.post(`${API_URL}/chat`, { message: 'What is the meaning of life?' }, authHeader);
    console.log('Chat Success:', chatRes.data);

    // 11. Escalate
    console.log('\nTesting: GET /api/escalate');
    const escalateRes = await axios.get(`${API_URL}/escalate`);
    console.log('Escalate Success:', escalateRes.data);

  } catch (error) {
    console.error('Error testing endpoints:', error.response ? error.response.data : error.message);
  }
};

testEndpoints();
