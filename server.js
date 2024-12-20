require('dotenv').config();
const express = require('express');
const app = express();
require('./routes/conn');
const cors = require('cors');
const router = require('./routes/router');
const port = 8004;

// const corsOptions = {
//     origin: procress.env.CORS_ORIGIN, // your local frontend URL
//     credentials: false,               // enable cookies or authorization headers
//     optionsSuccessStatus: 200
// };

// app.use(cors(corsOptions));  // Apply CORS globally
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('./uploads'));
app.use(router);

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

app.get('/', (req, res) => {
    res.render('index');
});
