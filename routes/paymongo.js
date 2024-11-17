const axios = require('axios');
require('dotenv').config(); 

async function createPaymongoLink(amount, description, remarks) {
  try {
    const response = await axios({
      url: 'https://api.paymongo.com/v1/links',
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY).toString('base64')}`
      },
      data: {
        data: {
          attributes: {
            amount: amount * 100, 
            redirect: {
              success: 'https://sjisc-canteen.online/success', 
              failed: 'https://sjisc-canteen.online/failed'
            },
            description: "You are making a payment to Saint Jerome Integrated School of Cabuyao .",
            remarks: "Payment"
          }
        }
      }
    });

    console.log('Link Created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating link:', error.response ? error.response.data : error.message);
    throw error;
  }
}

module.exports = {
  createPaymongoLink
};