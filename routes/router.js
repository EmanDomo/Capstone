const express = require("express");
const conn = require("./conn");
const multer = require("multer");
const moment = require("moment");
const router = new express.Router();
const jwt = require('jsonwebtoken');
const secretKey = '123'; // You should use an environment variable to store your secret key securely.

const paypal = require('./paypal');
const { createPaymongoLink } = require('./paymongo'); // Correct import
const { createPaymongoSource } = require('./gcash'); // Correct import

router.post('/payment', async (req, res) => {
    const { totalAmount } = req.body;

    if (!totalAmount) {
        res.status(400).send('Total amount is required');
        return;
    }

    const parsedTotalAmount = parseFloat(totalAmount);
    if (isNaN(parsedTotalAmount)) {
        res.status(400).send('Total amount must be a number');
        return;
    }

    try {
        const paymongoLink = await createPaymongoLink(parsedTotalAmount, 'GCash Payment', 'GCash payment description');
        res.json({ url: paymongoLink.data.attributes.checkout_url });
    } catch (error) {
        console.error('Error creating PayMongo GCash link:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/pay-gcash', async (req, res) => {
    const { totalAmount } = req.body;

    if (!totalAmount) {
        return res.status(400).send('Total amount is required');
    }

    const parsedTotalAmount = parseFloat(totalAmount);
    if (isNaN(parsedTotalAmount)) {
        return res.status(400).send('Total amount must be a number');
    }

    try {
        const paymongoSource = await createPaymongoSource(parsedTotalAmount, 'GCash Payment', 'GCash payment description');
        return res.json({ url: paymongoSource.data.attributes.redirect.checkout_url });
    } catch (error) {
        console.error('Error creating PayMongo GCash link:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

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
    const userId = req.user.userId;
    const { itemId, quantity } = req.body;

    conn.query(
        'SELECT price FROM tbl_items WHERE id = ?',
        [itemId],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).json({ status: 'error', message: 'Internal server error' });
            } else {
                if (results.length > 0) {
                    const price = results[0].price;
                    // Check if the item is already in the cart
                    conn.query(
                        'SELECT * FROM tbl_cart WHERE userId = ? AND id = ?',
                        [userId, itemId],
                        (error, results) => {
                            if (error) {
                                console.error(error);
                                res.status(500).json({ status: 'error', message: 'Internal server error' });
                            } else if (results.length > 0) {
                                res.status(400).json({ status: 'error', message: 'Item already in cart' });
                            } else {
                                // Insert new item to the cart
                                conn.query(
                                    'INSERT INTO tbl_cart (userId, id, quantity, price) VALUES (?, ?, ?, ?)',
                                    [userId, itemId, quantity, price],
                                    (error, results) => {
                                        if (error) {
                                            console.error(error);
                                            res.status(500).json({ status: 'error', message: 'Internal server error' });
                                        } else {
                                            res.status(201).json({ status: 'success', message: 'Item added to cart' });
                                        }
                                    }
                                );
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
  
    console.log(`Attempting to remove item with id: ${itemId} for user: ${userId}`);
  
    conn.query(
      'SELECT * FROM tbl_cart WHERE userId = ? AND id = ?',
      [userId, itemId],
      (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
          return res.status(500).json({ status: 'error', message: 'Internal server error' });
        }
  
        if (results.length === 0) {
          console.warn('Item not found in cart.');
          return res.status(404).json({ status: 'error', message: 'Item not found in cart' });
        }
  
        conn.query(
          'DELETE FROM tbl_cart WHERE userId = ? AND id = ?',
          [userId, itemId],
          (error, results) => {
            if (error) {
              console.error('Error executing query:', error);
              return res.status(500).json({ status: 'error', message: 'Internal server error' });
            }
  
            console.log('Item successfully deleted from cart.');
            res.status(200).json({ status: 'success', message: 'Item removed from cart' });
          }
        );
      }
    );
  });

  // Update cart item quantity
router.post('/update-cart', authenticateToken, authorizeRoles('customer'), (req, res) => {
    const userId = req.user.userId;
    const { itemId, change } = req.body;

    console.log(`Attempting to update item with id: ${itemId} by ${change} for user: ${userId}`);

    conn.query(
      'UPDATE tbl_cart SET quantity = quantity + ? WHERE userId = ? AND id = ?',
      [change, userId, itemId],
      (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
          return res.status(500).json({ status: 'error', message: 'Internal server error' });
        }

        // Optional: Ensure the updated quantity is valid (e.g., no negative quantities)
        if (change < 0) {
          conn.query(
            'DELETE FROM tbl_cart WHERE userId = ? AND id = ? AND quantity <= 0',
            [userId, itemId],
            (error, results) => {
              if (error) {
                console.error('Error executing query:', error);
                return res.status(500).json({ status: 'error', message: 'Internal server error' });
              }
              res.status(200).json({ status: 'success', message: 'Item quantity updated successfully' });
            }
          );
        } else {
          res.status(200).json({ status: 'success', message: 'Item quantity updated successfully' });
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

router.post('/pay', async (req, res) => {
    const { totalAmount } = req.body;
    console.log('Request Body:', req.body);
    console.log('Total Amount:', totalAmount, typeof totalAmount);

    if (!totalAmount) {
        res.status(400).send('Total amount is required');
        return;
    }

    const parsedTotalAmount = parseFloat(totalAmount);
    if (isNaN(parsedTotalAmount)) {
        res.status(400).send('Total amount must be a number');
        return;
    }

    try {
        const url = await paypal.createOrder(parsedTotalAmount);

        res.redirect(url);
    } catch (error) {
        res.send('Error: ' + error);
    }
});

router.get('/complete-order', async (req, res) => {
    try {
        const token = req.query.token;
        const payerID = req.query.PayerID;

        if (!token || !payerID) {
            console.error('Missing token or PayerID');
            return res.status(400).send('Missing token or PayerID');
        }

        console.log('Token:', token);
        console.log('PayerID:', payerID);

        const result = await paypal.capturePayment(token);
        console.log('Capture Result:', result);

        res.send('Course purchased successfully');
        console.log('PayPal payment success');
    } catch (error) {
        console.error('PayPal payment error:', error.message);
        res.status(500).send('Error: ' + error.message);
    }
});

  

router.get('/cancel-order', (req, res) => {
    res.redirect('/');
});


router.post('/place-order', authenticateToken, (req, res) => {
    const userId = req.user.userId;

    // Fetch cart items
    conn.query('SELECT * FROM tbl_cart WHERE userId = ?', [userId], (error, cartItems) => {
        if (error) {
            console.error('Error fetching cart items:', error);
            return res.status(500).json({ success: false, error: 'Failed to fetch cart items' });
        }

        if (cartItems.length === 0) {
            return res.status(400).json({ success: false, error: 'Cart is empty' });
        }

        // Retrieve the highest current order number
        conn.query('SELECT MAX(orderNumber) AS maxOrderNumber FROM tbl_orders', (err, results) => {
            if (err) {
                console.error('Error fetching max order number:', err);
                return res.status(500).json({ success: false, error: 'Failed to fetch max order number' });
            }

            const maxOrderNumber = results[0].maxOrderNumber || 0;
            const newOrderNumber = maxOrderNumber + 1;

            // Insert cart items into tbl_orders
            const itemCount = cartItems.length;
            let processedItems = 0;

            cartItems.forEach(item => {
                conn.query('INSERT INTO tbl_orders (orderNumber, userId, id, quantity, price) VALUES (?, ?, ?, ?, ?)', [
                    newOrderNumber,
                    userId,
                    item.id,
                    item.quantity,
                    item.price,
                ], (err) => {
                    if (err) {
                        console.error('Error inserting order item:', err);
                        return res.status(500).json({ success: false, error: 'Failed to place order' });
                    }
                    processedItems++;
                    if (processedItems === itemCount) {
                        // All items processed, now empty the cart
                        conn.query('DELETE FROM tbl_cart WHERE userId = ?', [userId], (err) => {
                            if (err) {
                                console.error('Error emptying cart:', err);
                                return res.status(500).json({ success: false, error: 'Failed to empty cart' });
                            }
                            res.json({ success: true, orderNumber: newOrderNumber });
                        });
                    }
                });
            });
        });
    });
});

router.get('/orders', (req, res) => {
    console.log('Fetching orders...');
    const query = `
        SELECT 
            tbl_orders.orderNumber, 
            tbl_orders.orderId, 
            tbl_orders.userId, 
            tbl_orders.id, 
            tbl_orders.quantity, 
            tbl_orders.price, 
            tbl_users.username, 
            tbl_items.itemname
        FROM 
            tbl_orders
        JOIN 
            tbl_users ON tbl_orders.userId = tbl_users.userId
        JOIN 
            tbl_items ON tbl_orders.id = tbl_items.id
        ORDER BY 
            tbl_orders.orderNumber, tbl_orders.orderId
    `;
    conn.query(query, (error, rows) => {
        if (error) {
            console.error('Error fetching orders:', error);
            return res.status(500).json({ message: 'Error fetching orders', error });
        }
        console.log('Orders fetched:', rows);
        res.json(rows);
    });
});

module.exports = router;