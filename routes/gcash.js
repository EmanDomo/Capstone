const axios = require('axios');
require('dotenv').config();
// const { host } = require('../client/src/apiRoutes');



async function createPaymongoSource(amount, description, remarks) {
  try {
    const authKey = Buffer.from(process.env.PAYMONGO_SECRET_KEY).toString('base64');

    const response = await axios({
      url: 'https://api.paymongo.com/v1/sources',
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authKey}`
      },
      data: {
        data: {
          attributes: {
            amount: amount * 100, 
            redirect: {
              // success: `https://sjisc-canteen.online/success`, 
              // failed: `https://sjisc-canteen.online/failed`
              success: 'http://localhost:3000/menu', // Ensure this URL matches your front-end success page
              failed: 'http://localhost:3000/failed'
            },
            type: 'gcash',
            currency: 'PHP',
            description: description,
            remarks: remarks
          }
        }
      }
    });
    

    console.log('Source Created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating source:', error.response ? error.response.data : error.message);
    throw error;
  }
}

module.exports = {
  createPaymongoSource
};
