const express = require("express");
const conn = require("./conn");
const multer = require("multer");
const moment = require("moment");
const router = new express.Router();
const jwt = require('jsonwebtoken');
const secretKey = '123';

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

router.post('/pay-others', async (req, res) => {
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
router.post('/SuperAdminLoginForm', (req, res) => { 
    const { username, password } = req.body;

    const query = `SELECT * FROM tbl_superadmins WHERE username = ? AND password = ?`;
    conn.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Error executing query:', err.stack);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length > 0) {
            const user = results[0];
            const token = jwt.sign(
                { userId: user.id, role: 'superadmin' }, // SuperAdmin role
                secretKey, 
                { expiresIn: '1h' }
            );
            
            res.status(200).json({ 
                message: 'SuperAdmin login successful', 
                token, 
                role: 'superadmin' 
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    });
});


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
            const user = results[0];
            const token = jwt.sign(
                { userId: user.id, role: user.role }, // Include role in token
                secretKey, 
                { expiresIn: '1h' }
            );
            
            // Send role with token so frontend can decide the redirection
            res.status(200).json({ 
                message: 'Login successful', 
                token, 
                role: user.role 
            });
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
    const { fname, price, category, ingredients } = req.body;
    const { filename } = req.file;

    console.log('Received ingredients:', ingredients);

    if (!fname || !filename || !price || !category || !ingredients || ingredients.length === 0) {
        res.status(422).json({ status: 422, message: "Fill all the details" });
        return;
    }

    try {
        let parsedIngredients;
        if (typeof ingredients === "string") {
            try {
                parsedIngredients = JSON.parse(ingredients);
            } catch (error) {
                return res.status(422).json({ status: 422, message: "Invalid ingredients format" });
            }
        } else {
            parsedIngredients = ingredients;
        }

        console.log('Parsed ingredients:', parsedIngredients);

        if (!Array.isArray(parsedIngredients)) {
            return res.status(422).json({ status: 422, message: "Ingredients should be an array" });
        }

        // Debugging: Check if stock_id is present
        parsedIngredients.forEach((ingredient, index) => {
            console.log(`Ingredient ${index}:`, ingredient);
            if (ingredient.stock_id === undefined) {
                console.log(`Error: stock_id is undefined for ingredient ${index}`);
            }
        });


        let date = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

        conn.query(
            "INSERT INTO tbl_items SET ?",
            { itemname: fname, img: filename, date: date, price: price, category: category },
            (err, result) => {
                if (err) {
                    console.log("error:", err);
                    res.status(500).json({ status: 500, message: "Database insertion error" });
                    return;
                }

                const itemId = result.insertId;
                console.log('Item ID:', itemId);

                let insertIngredientsQuery = "INSERT INTO tbl_item_ingredients (item_id, stock_id, quantity_required) VALUES ?";
                let ingredientValues = parsedIngredients.map(ingredient => [itemId, ingredient.stock_id, ingredient.quantity]);


                console.log('Ingredients to insert:', ingredientValues);

                conn.query(insertIngredientsQuery, [ingredientValues], (err, result) => {
                    if (err) {
                        console.log("error:", err);
                        res.status(500).json({ status: 500, message: "Error adding ingredients" });
                    } else {
                        console.log("Item and ingredients added");
                        res.status(201).json({ status: 201, data: req.body });
                    }
                });
            }
        );
    } catch (error) {
        res.status(422).json({ status: 422, error });
    }
});





router.post("/category", (req, res) => {
    const { category } = req.body;
    console.log(req.body);

    if (!category) {
        return res.status(422).json({ status: 422, message: "Fill all the details" });
    }

    try {
        conn.query("INSERT INTO tbl_category SET ?", { category_name: category }, (err, result) => {
            if (err) {
                console.log("error:", err);
                return res.status(500).json({ status: 500, error: "Database insertion error" });
            }
            console.log("data added");
            return res.status(201).json({ status: 201, data: req.body });
        });
    } catch (error) {
        console.log("error:", error);
        res.status(500).json({ status: 500, error: "Server error" });
    }
});

// Route to fetch all categories
router.get("/categories", (req, res) => {
    try {
        conn.query("SELECT * FROM tbl_category", (err, results) => {
            if (err) {
                console.log("error:", err);
                return res.status(500).json({ status: 500, error: "Database query error" });
            }
            return res.status(200).json({ status: 200, data: results });
        });
    } catch (error) {
        console.log("error:", error);
        res.status(500).json({ status: 500, error: "Server error" });
    }
});

router.post('/complete-order', authenticateToken, authorizeRoles('admin'), (req, res) => {
    const { orderId, userId, totalAmount } = req.body;

    console.log(`Received orderId: ${orderId}, userId: ${userId}, totalAmount: ${totalAmount}`);

    conn.query(
        'INSERT INTO tbl_sales (orderId, userId, totalAmount, saleDate) VALUES (?, ?, ?, NOW())',
        [orderId, userId, totalAmount],
        (err, result) => {
            if (err) {
                console.error('Error inserting sales record:', err);
                return res.status(500).json({ success: false, error: 'Failed to insert sales record' });
            }

            console.log('Inserted into tbl_sales:', result);

            conn.query(
                'UPDATE tbl_orders SET status = ? WHERE orderId = ?',
                ['completed', orderId],
                (err, result) => {
                    if (err) {
                        console.error('Error updating order status:', err);
                        return res.status(500).json({ success: false, error: 'Failed to update order status' });
                    }

                    console.log('Updated order status to completed:', result);

                    return res.status(200).json({ success: true, message: 'Order completed and stored in sales' });
                }
            );
        }
    );
});



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

router.get("/getdata", authenticateToken, authorizeRoles('admin', 'customer', 'cashier'), (req, res) => {
    try {
        conn.query("SELECT * FROM tbl_items", (err, result) => {
            if (err) {
                console.log("error");
            } else {
                console.log("data get -- bakit ba nag iinfinite loop too???");
                res.status(201).json({ status: 201, data: result });
            }
        });
    } catch (error) {
        res.status(422).json({ status: 422, error });
    }
});

router.get("/top-selling", authenticateToken, authorizeRoles('customer'), (req, res) => {
    try {
        // Assume req.user contains the user's information, including gender
        const userGender = req.user.gender; // Retrieve the user's gender from the token

        // SQL query with user gender parameterized to avoid SQL injection
        const query = `
        SELECT i.id, i.itemname, i.img, i.price, SUM(o.quantity) AS total_quantity_sold
FROM tbl_orders o
JOIN tbl_items i ON o.id = i.id
JOIN tbl_sales s ON o.orderId = s.orderId
WHERE o.status = 'completed'
  AND s.saleDate >= CURDATE()
  AND s.saleDate < CURDATE() + INTERVAL 1 DAY
GROUP BY i.id, i.itemname, i.img, i.price
ORDER BY total_quantity_sold DESC
LIMIT 3;

        `;

        conn.query(query, [userGender], (err, result) => {
            if (err) {
                console.error("Database query error:", err);
                res.status(500).json({ status: 500, error: "Database query failed" });
            } else {
                res.status(200).json({ status: 200, data: result });
            }
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(422).json({ status: 422, error: "Server error" });
    }
});


router.get("/getinventorydata", authenticateToken, authorizeRoles( 'superadmin'), (req, res) => {
    try {
        const sqlQuery = `
           SELECT 
    i.itemname AS Item_Name, 
    i.category AS Category,
    i.price AS Price,
    GROUP_CONCAT(s.stock_item_name ORDER BY s.stock_item_name SEPARATOR ', ') AS Stock_Names, 
    GROUP_CONCAT(ii.quantity_required ORDER BY s.stock_item_name SEPARATOR ', ') AS Quantities_Required, 
    GROUP_CONCAT(s.unit ORDER BY s.stock_item_name SEPARATOR ', ') AS Units
FROM 
    tbl_item_ingredients ii
JOIN 
    tbl_items i ON ii.item_id = i.id
JOIN 
    tbl_stocks s ON ii.stock_id = s.stockId
GROUP BY 
    i.itemname, 
    i.category,
    i.price;


        `;

        conn.query(sqlQuery, (err, result) => {
            if (err) {
                console.error("Error fetching data: ", err);
                res.status(500).json({ status: 500, message: "Internal Server Error" });
            } else {
                console.log("Data fetched successfully");
                res.status(200).json({ status: 200, data: result });
            }
        });
    } catch (error) {
        console.error("Unexpected error: ", error);
        res.status(422).json({ status: 422, error });
    }
});

router.post('/addStock', authenticateToken, authorizeRoles('superadmin'), (req, res) => {
    const { stockName, stockQuantity, stockUnit } = req.body;

    if (!stockName || !stockQuantity || !stockUnit) {
        return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    const query = 'INSERT INTO tbl_stocks (stock_item_name, stock_quantity, unit) VALUES (?, ?, ?)';
    conn.query(query, [stockName, stockQuantity, stockUnit], (err, results) => {
        if (err) {
            console.error('Error adding stock item:', err);
            return res.status(500).json({ error: 'Internal server error.' });
        }
        res.status(201).json({ status: 'success', message: 'Stock item added successfully.' });
    });
});

// Route to get stock items
router.get('/getstock', authenticateToken, authorizeRoles('superadmin', 'superadmin'), (req, res) => {
    const query = 'SELECT * FROM tbl_stocks';
    conn.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching stock data:', err);
            return res.status(500).json({ error: 'Internal server error.' });
        }
        res.status(200).json({ status: 'success', data: results });
    });
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

router.post('/add-to-pos', authenticateToken, authorizeRoles('admin'), (req, res) => {
    const userId = req.user.userId; // This refers to adminId, based on tbl_pos
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
                    // Check if the item is already in the cart (POS)
                    conn.query(
                        'SELECT * FROM tbl_pos WHERE adminId = ? AND id = ?',
                        [userId, itemId],
                        (error, results) => {
                            if (error) {
                                console.error(error);
                                res.status(500).json({ status: 'error', message: 'Internal server error' });
                            } else if (results.length > 0) {
                                res.status(400).json({ status: 'error', message: 'Item already in POS' });
                            } else {
                                // Insert new item to the POS
                                conn.query(
                                    'INSERT INTO tbl_pos (adminId, id, quantity, price) VALUES (?, ?, ?, ?)',
                                    [userId, itemId, quantity, price],
                                    (error, results) => {
                                        if (error) {
                                            console.error(error);
                                            res.status(500).json({ status: 'error', message: 'Internal server error' });
                                        } else {
                                            res.status(201).json({ status: 'success', message: 'Item added to POS' });
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
        'SELECT tbl_items.itemname, tbl_cart.id AS itemId, tbl_cart.quantity, tbl_cart.price FROM tbl_cart JOIN tbl_items ON tbl_cart.id = tbl_items.id WHERE tbl_cart.userId = ?;',
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

router.get('/getpos', authenticateToken, authorizeRoles('admin'), (req, res) => {
    const userId = req.user.userId;

    conn.query(
        'SELECT tbl_items.itemname, tbl_pos.id AS itemId, tbl_pos.quantity, tbl_pos.price ' +
        'FROM tbl_pos ' +
        'JOIN tbl_items ON tbl_pos.id = tbl_items.id ' +
        'WHERE tbl_pos.adminId = ?;',
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

router.post('/remove-pos-item', authenticateToken, authorizeRoles('admin'), (req, res) => {
    const userId = req.user.userId; // This refers to adminId, based on tbl_pos
    const { itemId } = req.body;

    console.log(`Attempting to remove item with id: ${itemId} for admin: ${userId}`);

    conn.query(
        'SELECT * FROM tbl_pos WHERE adminId = ? AND id = ?',
        [userId, itemId],
        (error, results) => {
            if (error) {
                console.error('Error executing query:', error);
                return res.status(500).json({ status: 'error', message: 'Internal server error' });
            }

            if (results.length === 0) {
                console.warn('Item not found in POS.');
                return res.status(404).json({ status: 'error', message: 'Item not found in POS' });
            }

            conn.query(
                'DELETE FROM tbl_pos WHERE adminId = ? AND id = ?',
                [userId, itemId],
                (error, results) => {
                    if (error) {
                        console.error('Error executing query:', error);
                        return res.status(500).json({ status: 'error', message: 'Internal server error' });
                    }

                    console.log('Item successfully deleted from POS.');
                    res.status(200).json({ status: 'success', message: 'Item removed from POS' });
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

    if (!itemId) {
        return res.status(400).json({ status: 'error', message: 'Item ID is required' });
    }

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

router.post('/update-pos', authenticateToken, authorizeRoles('admin'), (req, res) => {
    const userId = req.user.userId;  // This refers to adminId in tbl_pos
    const { itemId, change } = req.body;

    console.log(`Attempting to update item with id: ${itemId} by ${change} for admin: ${userId}`);

    if (!itemId) {
        return res.status(400).json({ status: 'error', message: 'Item ID is required' });
    }

    conn.query(
        'UPDATE tbl_pos SET quantity = quantity + ? WHERE adminId = ? AND id = ?',
        [change, userId, itemId],
        (error, results) => {
            if (error) {
                console.error('Error executing query:', error);
                return res.status(500).json({ status: 'error', message: 'Internal server error' });
            }

            // Optional: Ensure the updated quantity is valid (e.g., no negative quantities)
            if (change < 0) {
                conn.query(
                    'DELETE FROM tbl_pos WHERE adminId = ? AND id = ? AND quantity <= 0',
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


 

//                 const updateStockForIngredients = (ingredientIndex) => {
//                     if (ingredientIndex >= ingredients.length) {
//                         updateStock(index + 1);
//                         return;
//                     }

//                     const ingredient = ingredients[ingredientIndex];
//                     // Fetch the current stock quantity
//                     conn.query('SELECT stock_quantity FROM tbl_stocks WHERE stockId = ?', [ingredient.stock_id], (err, stockResults) => {
//                         if (err) {
//                             return res.json({ success: false, error: err.message });
//                         }

//                         if (stockResults.length === 0 || stockResults[0].stock_quantity === null) {
//                             console.error(`Stock not found or quantity is null for stockId: ${ingredient.stock_id}`);
//                             return res.json({ success: false, error: `Stock not found or quantity is null for stockId: ${ingredient.stock_id}` });
//                         }

//                         const currentStockQuantity = stockResults[0].stock_quantity;
//                         const newStockQuantity = roundToTwoDecimalPlaces(currentStockQuantity + item.quantity);

//                         conn.query('UPDATE tbl_stocks SET stock_quantity = ? WHERE stockId = ?', 
//                             [newStockQuantity, ingredient.stock_id], (err) => {
//                                 if (err) {
//                                     return res.json({ success: false, error: err.message });
//                                 }

//                                 updateStockForIngredients(ingredientIndex + 1);
//                             });
//                     });
//                 };

//                 updateStockForIngredients(0);
//             });
//         };

//         updateStock(0);
//     });
// });

router.post('/cancel-order', authenticateToken, (req, res) => {
    const { orderId, reason } = req.body;

    // Query to get order items
    const getOrderQuery = `
        SELECT o.id, o.quantity, i.id AS item_id, ii.stock_id, ii.quantity_required
        FROM tbl_orders o
        JOIN tbl_items i ON o.id = i.id
        JOIN tbl_item_ingredients ii ON i.id = ii.item_id
        WHERE o.orderId = ? AND o.status = 'pending';
    `;

    conn.query(getOrderQuery, [orderId], (err, orderItems) => {
        if (err) {
            console.error('Error fetching order items:', err);
            return res.status(500).json({ success: false, error: 'Failed to fetch order items' });
        }

        if (orderItems.length === 0) {
            return res.status(400).json({ success: false, error: 'No such pending order found' });
        }

        // Function to update stock quantities
        const updateStocks = (index) => {
            if (index >= orderItems.length) {
                // Update the order status to 'cancelled'
                const cancelOrderQuery = `
                    UPDATE tbl_orders 
                    SET status = 'cancelled', cancelReason = ?
                    WHERE orderId = ?
                `;
                conn.query(cancelOrderQuery, [reason, orderId], (err) => {
                    if (err) {
                        console.error('Error canceling order:', err);
                        return res.status(500).json({ success: false, error: 'Failed to cancel order' });
                    }
                    return res.json({ success: true, message: 'Order canceled successfully' });
                });
                return;
            }

            const item = orderItems[index];
            const restoreStockQuantity = item.quantity * item.quantity_required;

            // Update stock quantities
            conn.query(
                'UPDATE tbl_stocks SET stock_quantity = stock_quantity + ? WHERE stockId = ?',
                [restoreStockQuantity, item.stock_id],
                (err) => {
                    if (err) {
                        console.error('Error restoring stock:', err);
                        return res.status(500).json({ success: false, error: 'Failed to restore stock' });
                    }
                    // Recursively call updateStocks to handle the next item
                    updateStocks(index + 1);
                }
            );
        };

        updateStocks(0);
    });
});

    



router.post('/place-order', authenticateToken, upload.single('qrCodeImage'), (req, res) => {
    const userId = req.user.userId;
    const qrCodeImage = req.file ? req.file.filename : null; // Get the uploaded QR code image filename
    let stockUpdates = []; // Array to track stock updates

    conn.query('SELECT * FROM tbl_cart WHERE userId = ?', [userId], (error, cartItems) => {
        if (error) {
            console.error('Error fetching cart items:', error);
            return res.status(500).json({ success: false, error: 'Failed to fetch cart items' });
        }

        if (cartItems.length === 0) {
            return res.status(400).json({ success: false, error: 'Cart is empty' });
        }

        conn.query('SELECT MAX(orderNumber) AS maxOrderNumber FROM tbl_orders', (err, results) => {
            if (err) {
                console.error('Error fetching max order number:', err);
                return res.status(500).json({ success: false, error: 'Failed to fetch max order number' });
            }

            const maxOrderNumber = results[0].maxOrderNumber || 0;
            const newOrderNumber = maxOrderNumber + 1;

            const processCartItem = (itemIndex) => {
                if (itemIndex >= cartItems.length) {
                    conn.query('DELETE FROM tbl_cart WHERE userId = ?', [userId], (err) => {
                        if (err) {
                            console.error('Error emptying cart:', err);
                            return res.status(500).json({ success: false, error: 'Failed to empty cart' });
                        }

                        // Insert stock updates into a temporary table
                        const insertStockUpdates = (index) => {
                            if (index >= stockUpdates.length) {
                                return res.json({ success: true, orderNumber: newOrderNumber });
                            }

                            const { stockId, newStockQuantity } = stockUpdates[index];
                            conn.query('UPDATE tbl_stocks SET stock_quantity = ? WHERE stockId = ?', 
                                [newStockQuantity, stockId], (err) => {
                                    if (err) {
                                        console.error('Error updating stock:', err);
                                        return res.status(500).json({ success: false, error: 'Failed to update stock' });
                                    }

                                    insertStockUpdates(index + 1);
                                });
                        };

                        insertStockUpdates(0);
                    });
                    return;
                }

                const item = cartItems[itemIndex];
                const getIngredientsQuery = `
                    SELECT i.stock_id, i.quantity_required, s.stock_quantity
                    FROM tbl_item_ingredients i
                    JOIN tbl_stocks s ON i.stock_id = s.stockId
                    WHERE i.item_id = ?
                `;

                conn.query(getIngredientsQuery, [item.id], (err, ingredients) => {
                    if (err) {
                        console.error('Error fetching ingredients:', err);
                        return res.status(500).json({ success: false, error: 'Failed to fetch ingredients' });
                    }

                    const insufficientStock = ingredients.some(ingredient =>
                        ingredient.stock_quantity < ingredient.quantity_required * item.quantity
                    );

                    if (insufficientStock) {
                        return res.status(400).json({ success: false, error: 'Insufficient stock for order' });
                    }

                    const updateStock = (ingredientIndex) => {
                        if (ingredientIndex >= ingredients.length) {
                            const insertOrderQuery = `
                                INSERT INTO tbl_orders 
                                (userId, id, quantity, price, orderNumber, status, qrCodeImage) 
                                VALUES (?, ?, ?, ?, ?, 'pending', ?)
                            `;
                            const insertOrderValues = [
                                userId,
                                item.id,
                                item.quantity,
                                item.price,
                                newOrderNumber,
                                qrCodeImage
                            ];

                            conn.query(insertOrderQuery, insertOrderValues, (err) => {
                                if (err) {
                                    console.error('Error inserting order item:', err);
                                    return res.status(500).json({ success: false, error: 'Failed to place order' });
                                }

                                processCartItem(itemIndex + 1);
                            });
                            return;
                        }

                        const ingredient = ingredients[ingredientIndex];
                        const newStockQuantity = ingredient.stock_quantity - (ingredient.quantity_required * item.quantity);
                        stockUpdates.push({ stockId: ingredient.stock_id, newStockQuantity });

                        conn.query('UPDATE tbl_stocks SET stock_quantity = ? WHERE stockId = ?', 
                            [newStockQuantity, ingredient.stock_id], (err) => {
                                if (err) {
                                    console.error('Error deducting stock:', err);
                                    return res.status(500).json({ success: false, error: 'Failed to deduct stock' });
                                }

                                updateStock(ingredientIndex + 1);
                            });
                    };

                    updateStock(0);
                });
            };

            processCartItem(0);
        });
    });
});

router.post('/pos-place-order', authenticateToken, (req, res) => {
    const userId = req.user.userId || req.user.adminId; // Use adminId if userId is not available
    const qrCodeImage = req.file ? req.file.filename : null;
    const posItems = req.body.posItems;
    let stockUpdates = [];

    if (!Array.isArray(posItems) || posItems.length === 0) {
        return res.status(400).json({ success: false, error: 'No items in POS' });
    }

    // Begin transaction
    conn.beginTransaction((err) => {
        if (err) {
            console.error('Transaction error:', err);
            return res.status(500).json({ success: false, error: 'Transaction failed' });
        }

        conn.query('SELECT MAX(orderNumber) AS maxOrderNumber FROM tbl_orders', (err, results) => {
            if (err) {
                return conn.rollback(() => {
                    console.error('Error fetching max order number:', err);
                    return res.status(500).json({ success: false, error: 'Failed to fetch max order number' });
                });
            }

            const maxOrderNumber = results[0].maxOrderNumber || 0;
            const newOrderNumber = maxOrderNumber + 1;

            const processPosItem = (itemIndex) => {
                if (itemIndex >= posItems.length) {
                    // All items processed, now update the stock and commit
                    updateStocks(0);
                    return;
                }

                const item = posItems[itemIndex];
                const getIngredientsQuery = 
                    `SELECT i.stock_id, i.quantity_required, s.stock_quantity
                    FROM tbl_item_ingredients i
                    JOIN tbl_stocks s ON i.stock_id = s.stockId
                    WHERE i.item_id = ?`;

                conn.query(getIngredientsQuery, [item.itemId], (err, ingredients) => {
                    if (err) {
                        return conn.rollback(() => {
                            console.error('Error fetching ingredients:', err);
                            return res.status(500).json({ success: false, error: 'Failed to fetch ingredients' });
                        });
                    }

                    const insufficientStock = ingredients.some(ingredient =>
                        ingredient.stock_quantity < ingredient.quantity_required * item.quantity
                    );

                    if (insufficientStock) {
                        return conn.rollback(() => {
                            res.status(400).json({ success: false, error: 'Insufficient stock for order' });
                        });
                    }

                    const updateStock = (ingredientIndex) => {
                        if (ingredientIndex >= ingredients.length) {
                            const insertOrderQuery = 
                            `INSERT INTO tbl_orders 
                            (userId, id, quantity, price, orderNumber, status, qrCodeImage) 
                            VALUES (?, ?, ?, ?, ?, 'pending', ?)`;
                        
                            const insertOrderValues = [
                                userId, item.itemId, item.quantity, item.price, newOrderNumber, qrCodeImage
                            ];
                        
                            conn.query(insertOrderQuery, insertOrderValues, (err) => {
                                if (err) {
                                    return conn.rollback(() => {
                                        console.error('Error inserting order item:', err);
                                        return res.status(500).json({ success: false, error: 'Failed to place order' });
                                    });
                                }
                        
                                processPosItem(itemIndex + 1);
                            });
                        
                            return;
                        }

                        const ingredient = ingredients[ingredientIndex];
                        const newStockQuantity = ingredient.stock_quantity - (ingredient.quantity_required * item.quantity);
                        stockUpdates.push({ stockId: ingredient.stock_id, newStockQuantity });

                        conn.query('UPDATE tbl_stocks SET stock_quantity = ? WHERE stockId = ?', 
                            [newStockQuantity, ingredient.stock_id], (err) => {
                                if (err) {
                                    return conn.rollback(() => {
                                        console.error('Error deducting stock:', err);
                                        return res.status(500).json({ success: false, error: 'Failed to deduct stock' });
                                    });
                                }

                                updateStock(ingredientIndex + 1);
                            });
                    };

                    updateStock(0);
                });
            };

            processPosItem(0);
        });
    });
});




// Route to upload QR code image and insert order
router.post('/upload-qr-code', upload.single('qrCodeImage'), async (req, res) => {
    const { userId, id, quantity, price, orderNumber } = req.body;
    const qrCodeImage = req.file ? req.file.filename : null;

    // Check for undefined values
    if (!userId || !id || !quantity || !price || !orderNumber || !qrCodeImage) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    try {
        // Insert new order with 'pending' status
        const query = `INSERT INTO tbl_orders (userId, id, quantity, price, orderNumber, status, qrCodeImage)
                       VALUES (?, ?, ?, ?, ?, 'pending', ?)`;
        const values = [userId, id, quantity, price, orderNumber, qrCodeImage];

        // Execute the query
        await conn.execute(query, values);

        res.json({ success: true });
    } catch (error) {
        console.error('Error inserting order:', error);
        res.status(500).json({ success: false, error: 'Failed to complete order' });
    }
});

router.get('/orders', (req, res) => {
    console.log('Fetching pending orders...');
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
        WHERE 
            tbl_orders.status = 'pending'
        ORDER BY 
            tbl_orders.orderNumber, tbl_orders.orderId
    `;
    conn.query(query, (error, rows) => {
        if (error) {
            console.error('Error fetching orders:', error);
            return res.status(500).json({ message: 'Error fetching orders', error });
        }
        // console.log('Pending orders fetched:', rows);
        res.json(rows);
    });
});


router.get('/api/sales/today', authenticateToken, authorizeRoles('superadmin'), (req, res) => {
    const query = `
        SELECT s.saleId, s.orderId, s.userId, s.totalAmount, s.saleDate, u.username, i.itemname
        FROM tbl_sales s
        JOIN tbl_orders o ON s.orderId = o.orderId
        JOIN tbl_users u ON s.userId = u.userId
        JOIN tbl_items i ON o.id = i.id
        WHERE DATE(s.saleDate) = CURDATE()
        ORDER BY s.saleId
    `;
    conn.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching today\'s sales:', err);
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }
        res.status(200).json(results);
    });
});


// Route to get sales for this week
router.get('/api/sales/week', authenticateToken, authorizeRoles('superadmin'), (req, res) => {
    const query = `
        SELECT s.saleId, s.orderId, s.userId, s.totalAmount, s.saleDate, u.username, i.itemname
        FROM tbl_sales s
        JOIN tbl_orders o ON s.orderId = o.orderId
        JOIN tbl_users u ON s.userId = u.userId
        JOIN tbl_items i ON o.id = i.id
        WHERE YEARWEEK(s.saleDate, 1) = YEARWEEK(CURDATE(), 1)
        ORDER BY s.saleId
    `;
    conn.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching this week\'s sales:', err);
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }
        res.status(200).json(results);
    });
});


// Route to get sales for this month
router.get('/api/sales/month', authenticateToken, authorizeRoles('superadmin'), (req, res) => {
    const query = `
        SELECT s.saleId, s.orderId, s.userId, s.totalAmount, s.saleDate, u.username, i.itemname
        FROM tbl_sales s
        JOIN tbl_orders o ON s.orderId = o.orderId
        JOIN tbl_users u ON s.userId = u.userId
        JOIN tbl_items i ON o.id = i.id
        WHERE YEAR(s.saleDate) = YEAR(CURDATE()) AND MONTH(s.saleDate) = MONTH(CURDATE())
        ORDER BY s.saleId
    `;
    conn.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching this month\'s sales:', err);
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }
        res.status(200).json(results);
    });
});



// Fetch orders for the authenticated user
router.get('/my-orders', authenticateToken, authorizeRoles('customer'), (req, res) => {
    const userId = req.user.userId;
    const query = `
        SELECT o.orderId, i.itemname, o.quantity, o.price, o.orderNumber, o.status, o.cancelReason
        FROM tbl_orders o
        JOIN tbl_items i ON o.id = i.id
        WHERE o.userId = ?
        ORDER BY o.orderId DESC
    `;

    conn.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching orders:', err);
            return res.status(500).json({ success: false, error: 'Failed to fetch orders' });
        }

        res.status(200).json({ success: true, orders: results });
    });
});

router.delete('/delete-order/:orderId', authenticateToken, authorizeRoles('customer'), (req, res) => {
    const orderId = req.params.orderId;
    const query = `DELETE FROM tbl_orders WHERE orderId = ? AND (status = 'completed' OR status = 'cancelled')`;

    conn.query(query, [orderId], (err, results) => {
        if (err) {
            console.error('Error deleting order:', err);
            return res.status(500).json({ success: false, error: 'Failed to delete order' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Order not found or cannot be deleted' });
        }

        res.status(200).json({ success: true, message: 'Order deleted successfully' });
    });
});


router.get('/warning-stocks', authenticateToken, authorizeRoles('superadmin'), (req, res) => {
    const query = `
        SELECT * FROM tbl_stocks where stock_quantity <= 20;
    `;
    conn.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching the warning stocks:', err);

            return res.status(500).json({ success: false, error: 'Internal server error' });
        }
        res.status(200).json(results);
    });
});




module.exports = router;