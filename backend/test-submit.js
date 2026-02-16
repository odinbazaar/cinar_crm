const axios = require('axios');

async function testSubmit() {
    try {
        const response = await axios.post('http://localhost:3000/api/reports/employee-reports/submit', {
            userId: 'aefcd363-7fee-4199-a355-0d8a6d70d22e',
            weekStarting: '2024-02-12',
            content: 'Test report content'
        });
        console.log('SUCCESS:', response.data);
    } catch (error) {
        console.error('ERROR:', error.response ? error.response.data : error.message);
    }
}

testSubmit();
