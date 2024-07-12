require("dotenv").config();
const express = require("express");
const app = express();
require("./routes/conn");
const cors = require("cors");
const router = require("./routes/router")
const port = 8004;

app.use(express.json());
app.use(cors());

app.use("/uploads", express.static("./uploads"))
app.use(router)

app.listen(port, () => {
    console.log("server start")
})

require('dotenv').config()
const paypal = require('./routes/paypal')

app.get('/', (req, res) => {
    res.render('index')
})

app.post('/pay', async (req, res) => {

    try {
        const url = await paypal.createOrder()

        res.redirect(url)
    } catch (error) {
        res.send('Error: ' + error)
    }
})

app.get('/complete-order', async (req, res) => {
    try {
        await paypal.capturePayment(req.query.token)

        res.send('Course purchased successfully')
        console.log("paypal payment success")
    } catch (error) {
        console.log("error")
        res.send('Error: ' + error)
    }
})

app.get('/cancel-order', (req, res) => {
    res.redirect('/')
})



