require('dotenv').config();
const express = require('express');
const app = express();
require('./routes/conn');
const cors = require('cors');
const router = require('./routes/router');

const port = 8004;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('./uploads'));
app.use(router);

app.listen(port, () => {
    console.log('server start');
});

app.get('/', (req, res) => {
    res.render('index');
});

