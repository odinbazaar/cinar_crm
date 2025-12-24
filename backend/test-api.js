const axios = require('axios');

async function testCreateProposal() {
    try {
        console.log('Sending request to http://localhost:3000/api/proposals...');
        const response = await axios.post('http://localhost:3000/api/proposals', {
            title: "API Test Proposal " + Date.now(),
            client_id: "c2e69f5f-dd56-49fd-85b0-ee40270ce2e7",
            created_by_id: "a9256112-796f-4764-9495-ccfd60b8379e",
            items: [
                {
                    description: "GB01 - Giantboard",
                    quantity: 1,
                    unit_price: 40000,
                    total: 40000,
                    metadata: {
                        type: "GB",
                        district: "Karşıyaka",
                        duration: 1,
                        period: "10 GÜN",
                        measurements: "1540 x 245 cm"
                    }
                }
            ],
            terms: "Standard Terms",
            valid_until: new Date(Date.now() + 86400000).toISOString()
        });

        console.log('Response Status:', response.status);
        console.log('Created Proposal:', response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testCreateProposal();
