import axios from 'axios';

async function testLocal() {
    console.log('Testing local backend...');
    try {
        const payload = {
            company_name: 'LOCAL TEST ' + Date.now(),
            name: 'LOCAL TEST ' + Date.now(),
            type: 'corporate',
            request_detail: 'should be sanitized',
            account_manager_id: ''
        };
        const response = await axios.post('http://localhost:3000/api/clients', payload);
        console.log('✅ Success:', response.data);
    } catch (error: any) {
        if (error.response) {
            console.error('❌ Failed:', error.response.status, error.response.data);
        } else {
            console.error('❌ Error:', error.message);
        }
    }
}

testLocal();
