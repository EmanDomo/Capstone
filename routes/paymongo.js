const axios = require('axios');
require('dotenv').config(); // To load the .env file

// Function to create a link using PayMongo API
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
            amount: amount * 100, // PayMongo expects the amount in cents
            redirect: {
              success: 'http://localhost:3000/success', // Ensure this URL matches your front-end success page
              failed: 'http://localhost:3000/failed'
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

// Export the function for use in other files
module.exports = {
  createPaymongoLink
};