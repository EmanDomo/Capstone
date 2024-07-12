const express = require("express");
const conn = require("./conn");
const multer = require("multer");
const moment = require("moment");
const router = new express.Router();
const jwt = require('jsonwebtoken');
const secretKey = '123'; // You should use an environment variable to store your secret key securely.

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401); // If no token, return unauthorized

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.sendStatus(403); // If token is invalid, return forbidden
        req.user = user; // Store user information in request
        next();
    });
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        next();
    };
};


// Admin login
router.post('/LoginForm', (req, res) => {
    const { username, password } = req.body;

    const query = `SELECT * FROM tbl_admins WHERE username = ? AND password = ?`;
    conn.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Error executing query:', err.stack);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length > 0) {
            const admin = results[0];
            const token = jwt.sign({ userId: admin.id, role: 'admin' }, secretKey, { expiresIn: '1h' }); // Add role to token
            res.status(200).json({ message: 'Login successful', token });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    });
});

// Customer login
router.post('/UserLogin', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT name, userId FROM tbl_users WHERE username = ? AND password = ?';
    conn.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Error executing query:', err.stack);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length > 0) {
            const name = results[0].name;
            const userId = results[0].userId;
            const token = jwt.sign({ userId, name, role: 'customer' }, secretKey, { expiresIn: '1h' }); // Add role to token
            res.status(200).json({ message: 'Login successful', token });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    });
});

router.post('/Register', async (req, res) => {
    const { name, gender, username, password } = req.body;

    try {
        // Check if the username already exists
        const userExists = await conn.query('SELECT * FROM tbl_users WHERE username = ?', [username]);
        if (userExists.length > 0) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        // Insert the new user into the database
        await pool.query(
            'INSERT INTO tbl_users (name, gender, username, password) VALUES (?, ?, ?, ?)',
            [name, gender, username, password]
        );

        res.status(200).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


// img storage confing
var imgconfig = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "./uploads");
    },
    filename: (req, file, callback) => {
        callback(null, `image-${Date.now()}.${file.originalname}`)
    }
});


// img filter
const isImage = (req, file, callback) => {
    if (file.mimetype.startsWith("image")) {
        callback(null, true)
    } else {
        callback(null, Error("only image is allowed"))
    }
}

var upload = multer({
    storage: imgconfig,
    fileFilter: isImage
})


// addItem
router.post("/addItem", upload.single("photo"), (req, res) => {
    const { fname, quantity, price } = req.body;
    const { filename } = req.file;

    if (!fname || !filename || !quantity || !price) {
        res.status(422).json({ status: 422, message: "Fill all the details" });
    }

    try {
        let date = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

        conn.query("INSERT INTO tbl_items SET ?", { itemname: fname, img: filename, date: date, quantity: quantity, price: price }, (err, result) => {
            if (err) {
                console.log("error");
            } else {
                console.log("data added");
                res.status(201).json({ status: 201, data: req.body });
            }
        })
    } catch (error) {
        res.status(422).json({ status: 422, error });
    }
});

// router.post("/category", (req, res) => {
//     const { category } = req.body;
//     console.log(req.body)

//     if (!category) {
//         return res.status(422).json({ status: 422, message: "Fill all the details" });
//     }

//     try {
//         conn.query("INSERT INTO tbl_category SET ?", {category_name: category}, (err, result) => {
//             if (err) {
//                 console.log("error:", err);
//             }
//             console.log("data added");
//             return res.status(201).json({ status: 201, data: req.body });
//         });
//     } catch (error) {
//         res.status(422).json({ status: 422, error });
//     }
// });

router.delete("/:id", authenticateToken, authorizeRoles('admin'), (req, res) => {
    const { id } = req.params;
    try {
        conn.query(`DELETE FROM tbl_items WHERE id ='${id}'`, (err, result) => {
            if (err) {
                console.log("error");
            } else {
                console.log("data delete");
                res.status(201).json({ status: 201, data: result });
            }
        });
    } catch (error) {
        res.status(422).json({ status: 422, error });
    }
});

router.get("/getdata", authenticateToken, authorizeRoles('admin', 'customer'), (req, res) => {
    try {
        conn.query("SELECT * FROM tbl_items", (err, result) => {
            if (err) {
                console.log("error");
            } else {
                console.log("data get");
                res.status(201).json({ status: 201, data: result });
            }
        });
    } catch (error) {
        res.status(422).json({ status: 422, error });
    }
});

//add to cart, customer role
router.post('/add-to-cart', authenticateToken, authorizeRoles('customer'), (req, res) => {
    const userId = req.user.userId; // Extract userId from the token
    const { itemId, quantity } = req.body;

    // Fetch price from tbl_items based on itemId
    conn.query(
        'SELECT price FROM tbl_items WHERE id = ?',
        [itemId],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).json({ status: 'error', message: 'Internal server error' });
            } else {
                if (results.length > 0) {
                    const price = results[0].price; // Get price from results
                    // Insert or update cart item
                    conn.query(
                        'INSERT INTO tbl_cart (userId, id, quantity, price) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?, price = ?',
                        [userId, itemId, quantity, price, quantity, price],
                        (error, results, fields) => {
                            if (error) {
                                console.error(error);
                                res.status(500).json({ status: 'error', message: 'Internal server error' });
                            } else {
                                res.status(201).json({ status: 'success', message: 'Item added to cart' });
                                console.log("Added to tbl_cart");
                            }
                        }
                    );
                } else {
                    res.status(404).json({ status: 'error', message: 'Item not found' });
                }
            }
        }
    );
});



//cart, customer role
router.get('/cart', authenticateToken, authorizeRoles('customer'), (req, res) => {
    const userId = req.user.userId;

    conn.query(
        'SELECT tbl_items.itemname, tbl_cart.quantity, tbl_cart.price FROM tbl_cart JOIN tbl_items ON tbl_cart.id = tbl_items.id WHERE tbl_cart.userId = ?',
        [userId],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).json({ status: 'error', message: 'Internal server error' });
            } else {
                res.status(200).json({ status: 'success', data: results });
            }
        }
    );
});

router.post('/update-cart', authenticateToken, authorizeRoles('customer'), (req, res) => {
    const userId = req.user.userId;
    const { itemId, change } = req.body;
  
    conn.query(
      'UPDATE tbl_cart SET quantity = quantity + ? WHERE userId = ? AND id = ?',
      [change, userId, itemId],
      (error, results) => {
        if (error) {
          console.error(error);
          res.status(500).json({ status: 'error', message: 'Internal server error' });
        } else {
          res.status(200).json({ status: 'success', message: 'Cart updated' });
        }
      }
    );
  });

  router.post('/remove-cart-item', authenticateToken, authorizeRoles('customer'), (req, res) => {
    const userId = req.user.userId;
    const { itemId } = req.body;
  
    conn.query(
      'DELETE FROM tbl_cart WHERE userId = ? AND id = ?',
      [userId, itemId],
      (error, results) => {
        if (error) {
          console.error(error);
          res.status(500).json({ status: 'error', message: 'Internal server error' });
        } else {
          res.status(200).json({ status: 'success', message: 'Item removed from cart' });
        }
      }
    );
  });
  
  



// router.get("/getsearch", (req, res) => {
//     const { search } = req.query;
//     try {
//         conn.query("SELECT * FROM tbl_items WHERE description LIKE ?", [`%${search}%`], (err, result) => {
//             if (err) {
//                 console.log("error");
//                 res.status(500).json({ status: 500, message: "Internal Server Error" });
//             } else {
//                 console.log("data get");
//                 res.status(201).json({ status: 201, data: result });
//             }
//         });
//     } catch (error) {
//         res.status(422).json({ status: 422, error });
//     }
// });





module.exports = router;