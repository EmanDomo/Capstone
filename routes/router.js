
const express = require("express");
const conn = require("./conn");
const multer = require("multer");
const moment = require("moment");
const router = new express.Router();
const jwt = require('jsonwebtoken');
const secretKey = '123';
const paypal = require('./paypal');
const { createPaymongoLink } = require('./paymongo'); 
const { createPaymongoSource } = require('./gcash'); 

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

router.post('/pay', async (req, res) => {
    const { totalAmount } = req.body;
    if (!totalAmount) {
        return res.status(400).send('Total amount is required');
    }

    const parsedTotalAmount = parseFloat(totalAmount);
    if (isNaN(parsedTotalAmount)) {
        return res.status(400).send('Total amount must be a number');
    }

    try {
        const url = await paypal.createOrder(parsedTotalAmount);
        res.json({ url });
    } catch (error) {
        res.status(500).send('Error: ' + error);
    }
});

router.post('/capture-payment', async (req, res) => {
    const { orderId } = req.body;
    console.log("Received Order ID:", orderId); 

    try {
        const captureData = await paypal.capturePayment(orderId);
        console.log("Payment captured data:", captureData);  
        res.json(captureData);
    } catch (error) {
        console.error("Error capturing payment:", error);  
        res.status(500).send('Error capturing payment: ' + error.message);
    }
});

// router.post('/pay-gcash', async (req, res) => {
//     const { totalAmount } = req.body;

//     if (!totalAmount) {
//         return res.status(400).send('Total amount is required');
//     }
//     const parsedTotalAmount = parseFloat(totalAmount);
//     if (isNaN(parsedTotalAmount)) {
//         return res.status(400).send('Total amount must be a number');
//     }

//     try {
//         const paymongoSource = await createPaymongoSource(parsedTotalAmount, 'GCash Payment', 'GCash payment description');
//         return res.json({ url: paymongoSource.data.attributes.redirect.checkout_url });
//     } catch (error) {
//         console.error('Error creating PayMongo GCash link:', error);
//         return res.status(500).json({ error: 'Internal server error' });
//     }
// });

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
        const checkoutUrl = paymongoSource.data.attributes.redirect.checkout_url;

        // After the payment is completed and confirmed via webhook, place the order
        // Call the place-order API to place the order and then return success.
        
        res.json({ url: checkoutUrl });  // Provide URL for GCash payment
    } catch (error) {
        console.error('Error creating PayMongo GCash link:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// You may want to set up a webhook that handles PayMongo payment success
router.post('/payment-webhook', (req, res) => {
    const paymentStatus = req.body.data.attributes.status; // Payment status from PayMongo

    if (paymentStatus === 'paid') {
        // Payment was successful
        // Call the place-order API here
        placeOrderFunction();  // This function will place the order automatically
    }

    res.status(200).send('Webhook received');
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

    if (token == null) return res.sendStatus(401); 

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.sendStatus(403); 
        req.user = user; 
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

router.post('/Register', (req, res) => {
    const { fullName, gender, username, password, mobile_number } = req.body; // Don't forget to extract mobile_number
  
    if (!fullName || !gender || !username || !password || !mobile_number) {
      return res.status(400).json({ message: 'Invalid input data' });
    }
  
    const checkQuery = 'SELECT * FROM tbl_users WHERE username = ? AND is_archived = 0';
    conn.query(checkQuery, [username], (checkError, checkResults) => {
      if (checkError) {
        console.error('Error checking username:', checkError);
        return res.status(500).json({ message: 'Server error' });
      }
  
      if (checkResults.length > 0) {
        return res.status(400).json({ message: 'Username already exists' });
      }
  
      const query = 'INSERT INTO tbl_users (name, gender, username, password, mobile_number) VALUES (?, ?, ?, ?, ?)';
      
      conn.query(query, [fullName, gender, username, password, mobile_number], (error) => {
        if (error) {
          console.error('Error adding user:', error);
          return res.status(500).json({ message: 'Failed to add user' });
        }
        res.status(201).json({ message: 'Customer added successfully' });
      });
    });
  });


  const superAdminLoginAttempts = {}; 

router.post('/SuperAdminLoginForm', (req, res) => { 
    const { username, password } = req.body;

    if (superAdminLoginAttempts[username] && superAdminLoginAttempts[username].count >= 3) {
        const remainingTime = (Date.now() - superAdminLoginAttempts[username].timestamp) / 1000;
        if (remainingTime < 300) {
            return res.status(403).json({ message: 'Account locked. Try again in 5 minutes.' });
        } else {
            superAdminLoginAttempts[username] = { count: 0, timestamp: Date.now() };
        }
    }

    const query = `SELECT * FROM tbl_superadmins WHERE username = ? AND BINARY password = ?`; 
    conn.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Error executing query:', err.stack);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length > 0) {
            const user = results[0];
            const token = jwt.sign(
                { userId: user.id, role: 'superadmin' },
                secretKey, 
                { expiresIn: '1h' }
            );

            if (superAdminLoginAttempts[username]) {
                delete superAdminLoginAttempts[username];
            }

            res.status(200).json({ 
                message: 'SuperAdmin login successful', 
                token, 
                role: 'superadmin' 
            });
        } else {
            if (!superAdminLoginAttempts[username]) {
                superAdminLoginAttempts[username] = { count: 1, timestamp: Date.now() };
            } else {
                superAdminLoginAttempts[username].count += 1;
            }
            const remainingAttempts = 3 - superAdminLoginAttempts[username].count;

            if (remainingAttempts <= 0) {
                superAdminLoginAttempts[username].timestamp = Date.now();
                return res.status(403).json({ message: 'Account locked. Try again in 5 minutes.' });
            } else {
                res.status(401).json({ message: 'Invalid username or password', remainingAttempts });
            }
        }
    });
});

const adminLoginAttempts = {}; 

router.post('/LoginForm', (req, res) => { 
    const { username, password } = req.body;

    if (adminLoginAttempts[username] && adminLoginAttempts[username].count >= 3) {
        const remainingTime = (Date.now() - adminLoginAttempts[username].timestamp) / 1000;
        if (remainingTime < 300) {
            return res.status(403).json({ message: 'Account locked. Try again in 5 minutes.' });
        } else {
            adminLoginAttempts[username] = { count: 0, timestamp: Date.now() };
        }
    }

    const query = `SELECT * FROM tbl_admins WHERE username = ? AND BINARY password = ? AND is_archived = 0`; 
    conn.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Error executing query:', err.stack);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length > 0) {
            const user = results[0];
            const token = jwt.sign(
                { userId: user.id, role: user.role },
                secretKey, 
                { expiresIn: '1h' }
            );

            if (adminLoginAttempts[username]) {
                delete adminLoginAttempts[username];
            }

            res.status(200).json({ 
                message: 'Login successful', 
                token, 
                role: user.role 
            });
        } else {
            if (!adminLoginAttempts[username]) {
                adminLoginAttempts[username] = { count: 1, timestamp: Date.now() };
            } else {
                adminLoginAttempts[username].count += 1;
            }

            const remainingAttempts = 3 - adminLoginAttempts[username].count;

            if (remainingAttempts <= 0) {
                adminLoginAttempts[username].timestamp = Date.now();
                return res.status(403).json({ message: 'Account locked. Try again in 5 minutes.' });
            } else {
                res.status(401).json({ message: 'Invalid username or password', remainingAttempts });
            }
        }
    });
});


const loginAttempts = {}; 

router.post('/UserLogin', (req, res) => {
    const { username, password } = req.body;

    if (loginAttempts[username] && loginAttempts[username].count >= 3) {
        const remainingTime = (Date.now() - loginAttempts[username].timestamp) / 1000;
        if (remainingTime < 300) {
            return res.status(403).json({ message: 'Account locked. Try again in 5 minutes.' });
        } else {
            loginAttempts[username] = { count: 0, timestamp: Date.now() };
        }
    }

    const query = 'SELECT name, userId, gender FROM tbl_users WHERE username = ? AND BINARY password = ? AND is_archived = 0';
    
    conn.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Error executing query:', err.stack);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length > 0) {
            const { name, userId, gender } = results[0];
            const token = jwt.sign({ userId, name, gender, role: 'customer' }, secretKey, { expiresIn: '1h' });

            if (loginAttempts[username]) {
                delete loginAttempts[username];
            }

            res.status(200).json({ message: 'Login successful', token });
        } else {
            if (!loginAttempts[username]) {
                loginAttempts[username] = { count: 1, timestamp: Date.now() };
            } else {
                loginAttempts[username].count += 1;
            }

            const remainingAttempts = 3 - loginAttempts[username].count;

            if (remainingAttempts <= 0) {
                loginAttempts[username].timestamp = Date.now();
                return res.status(403).json({ message: 'Account locked. Try again in 5 minutes.' });
            } else {
                res.status(401).json({ message: 'Invalid username or password', remainingAttempts });
            }
        }
    });
});

var imgconfig = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "./uploads");
    },
    filename: (req, file, callback) => {
        callback(null, `image-${Date.now()}.${file.originalname}`)
    }
});


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

router.put('/update-food/:id', authenticateToken, authorizeRoles('superadmin', 'admin'), (req, res) => {
    const foodId = req.params.id;

    if (!foodId || isNaN(foodId)) {
        console.error(`Invalid foodId: ${foodId}`);
        return res.status(400).json({ message: 'Invalid food ID' });
    }

    const { Item_Name, Price, ingredients } = req.body;

    if (!Item_Name || isNaN(Price) || (ingredients && !Array.isArray(ingredients))) {
        return res.status(400).json({ message: 'Invalid input data' });
    }

    const updateFoodQuery = `
        UPDATE tbl_items 
        SET itemname = ?, price = ? 
        WHERE id = ?
    `;

    conn.query(updateFoodQuery, [Item_Name, Price, foodId], (error, results) => {
        if (error) {
            console.error('Error updating food item:', error);
            return res.status(500).json({ message: 'Failed to update food item', error });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Food item not found' });
        }
        if (ingredients && ingredients.length > 0) {
            const deleteIngredientsQuery = `
                DELETE FROM tbl_item_ingredients 
                WHERE item_id = ?
            `;

            conn.query(deleteIngredientsQuery, [foodId], (deleteError) => {
                if (deleteError) {
                    console.error('Error deleting old ingredients:', deleteError);
                    return res.status(500).json({ message: 'Failed to update ingredients', deleteError });
                }
                const insertIngredientQuery = `
                    INSERT INTO tbl_item_ingredients (item_id, stock_id, quantity_required) 
                    VALUES ?
                `;

                const ingredientValues = ingredients.map(ingredient => [
                    foodId,                
                    ingredient.stock_id,   
                    ingredient.quantity    
                ]);

                conn.query(insertIngredientQuery, [ingredientValues], (insertError) => {
                    if (insertError) {
                        console.error('Error inserting ingredients:', insertError);
                        return res.status(500).json({ message: 'Failed to update ingredients', insertError });
                    }

                    res.status(200).json({ message: 'Food item updated successfully', status: 200 });
                });
            });
        } else {
         
            res.status(200).json({ message: 'Food item updated successfully', status: 200 });
        }
    });
});

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

// router.post('/complete-order', authenticateToken, authorizeRoles('admin'), (req, res) => {
//     const { orderIds, userId, totalAmount } = req.body;

//     console.log(`Received orderIds: ${orderIds}, userId: ${userId}, totalAmount: ${totalAmount}`);

//     conn.query(
//         'SELECT orderId, orderNumber, userName, quantity, gender FROM tbl_orders WHERE orderId IN (?)',
//         [orderIds],
//         (err, result) => {
//             if (err) {
//                 console.error('Error fetching order details:', err);
//                 return res.status(500).json({ success: false, error: 'Failed to fetch order details' });
//             }

//             if (result.length === 0) {
//                 return res.status(404).json({ success: false, error: 'Orders not found' });
//             }

//             const salePromises = result.map(order => {
//                 const { orderId, orderNumber, userName, quantity, gender } = order;
//                 return new Promise((resolve, reject) => {
//                     conn.query(
//                         'INSERT INTO tbl_sale (orderId, orderNumber, userId, totalAmount, saleDate, userName, quantity, gender) VALUES (?, ?, ?, ?, NOW(), ?, ?, ?)',
//                         [orderId, orderNumber, userId, totalAmount, userName, quantity, gender],
//                         (err, result) => {
//                             if (err) {
//                                 return reject(err);
//                             }
//                             resolve(result);
//                         }
//                     );
//                 });
//             });

//             Promise.all(salePromises)
//                 .then(() => {
//                     conn.query(
//                         'UPDATE tbl_orders SET status = ? WHERE orderId IN (?)',
//                         ['completed', orderIds],
//                         (err, result) => {
//                             if (err) {
//                                 console.error('Error updating order status:', err);
//                                 return res.status(500).json({ success: false, error: 'Failed to update order status' });
//                             }

//                             console.log('Updated order status to completed:', result);
//                             return res.status(200).json({ success: true, message: 'Orders completed and stored in sales' });
//                         }
//                     );
//                 })
//                 .catch(err => {
//                     console.error('Error inserting sales record:', err);
//                     return res.status(500).json({ success: false, error: 'Failed to insert sales record' });
//                 });
//         }
//     );
// });

router.post('/complete-order', authenticateToken, authorizeRoles('admin'), (req, res) => {
    const { orderIds, userId, totalAmount } = req.body;
    const cashierName = req.body.cashierName;

    console.log(`Received orderIds: ${orderIds}, userId: ${userId}, totalAmount: ${totalAmount}`);

    conn.query(
        'SELECT name FROM tbl_admins WHERE username = ?',
        [cashierName],
        (err, result) => {
            if (err) {
                console.error('Error fetching cashier name:', err);
                return res.status(500).json({ success: false, error: 'Failed to fetch cashier name' });
            }

            if (result.length === 0) {
                return res.status(404).json({ success: false, error: 'Cashier not found' });
            }
            const adminName = result[0].name;

            conn.query(
                'SELECT orderId, orderNumber, userName, quantity, gender FROM tbl_orders WHERE orderId IN (?)',
                [orderIds],
                (err, result) => {
                    if (err) {
                        console.error('Error fetching order details:', err);
                        return res.status(500).json({ success: false, error: 'Failed to fetch order details' });
                    }

                    if (result.length === 0) {
                        return res.status(404).json({ success: false, error: 'Orders not found' });
                    }

                    const salePromises = result.map(order => {
                        const { orderId, orderNumber, userName, quantity, gender } = order;
                        return new Promise((resolve, reject) => {
                            conn.query(
                                'INSERT INTO tbl_sale (orderId, orderNumber, userId, totalAmount, saleDate, userName, quantity, gender, adminName) VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?)',
                                [orderId, orderNumber, userId, totalAmount, userName, quantity, gender, adminName],
                                (err, result) => {
                                    if (err) {
                                        return reject(err);
                                    }
                                    resolve(result);
                                }
                            );
                        });
                    });

                    Promise.all(salePromises)
                        .then(() => {
                            conn.query(
                                'UPDATE tbl_orders SET status = ? WHERE orderId IN (?)',
                                ['completed', orderIds],
                                (err, result) => {
                                    if (err) {
                                        console.error('Error updating order status:', err);
                                        return res.status(500).json({ success: false, error: 'Failed to update order status' });
                                    }

                                    console.log('Updated order status to completed:', result);
                                    return res.status(200).json({ success: true, message: 'Orders completed and stored in sales' });
                                }
                            );
                        })
                        .catch(err => {
                            console.error('Error inserting sales record:', err);
                            return res.status(500).json({ success: false, error: 'Failed to insert sales record' });
                        });
                }
            );
        }
    );
});

router.put("/archive/:type/:id", authenticateToken, authorizeRoles('superadmin'), (req, res) => { 
    const { type, id } = req.params;
    let tableName, columnId, setArchivedField;

    if (type === "raw_material") {
        tableName = "tbl_raw_materials";
        columnId = "raw_material_id";
        setArchivedField = "is_archived = 1";

        checkPendingOrdersForRelatedItems(id, type, res, () => {
            archiveItem(id, tableName, columnId, setArchivedField, res);
        });
    } else if (type === "stock") {
        tableName = "tbl_stocks";
        columnId = "stockId";
        setArchivedField = "is_archive = 1";

        checkPendingOrdersForRelatedItems(id, type, res, () => {
            archiveItem(id, tableName, columnId, setArchivedField, res);
        });
    } else if (type === "item") {
        tableName = "tbl_items";
        columnId = "id";
        setArchivedField = "is_archived = 1";

        const checkPendingOrdersQuery = `
            SELECT COUNT(*) AS pendingCount
            FROM tbl_orders
            WHERE id = ? AND status = 'pending';
        `;

        conn.query(checkPendingOrdersQuery, [id], (err, results) => {
            if (err) {
                console.error("Error checking pending orders:", err);
                return res.status(500).json({ status: 500, message: "Internal server error" });
            }

            if (results[0].pendingCount > 0) {
                return res.status(400).json({ message: "Item cannot be removed because it has pending orders." });
            }

            archiveItem(id, tableName, columnId, setArchivedField, res);
        });
    } else {
        return res.status(400).json({ status: 400, message: "Invalid type parameter" });
    }
});

function checkPendingOrdersForRelatedItems(id, type, res, callback) {
    let relatedItemsQuery;

    if (type === "raw_material") {
        relatedItemsQuery = `
            SELECT COUNT(*) AS pendingCount
            FROM tbl_orders o
            JOIN tbl_item_ingredients ii ON o.id = ii.item_id
            JOIN tbl_stocks s ON ii.stock_id = s.stockId
            WHERE s.raw_material_id = ? AND o.status = 'pending';
        `;
    } else if (type === "stock") {
        relatedItemsQuery = `
            SELECT COUNT(*) AS pendingCount
            FROM tbl_orders o
            JOIN tbl_item_ingredients ii ON o.id = ii.item_id
            WHERE ii.stock_id = ? AND o.status = 'pending';
        `;
    }

    conn.query(relatedItemsQuery, [id], (err, results) => {
        if (err) {
            console.error("Error checking related items for pending orders:", err);
            return res.status(500).json({ status: 500, message: "Internal server error" });
        }

        if (results[0].pendingCount > 0) {
            return res.status(400).json({ message: `${type.charAt(0).toUpperCase() + type.slice(1)} cannot be remove because related items have pending orders.` });
        }

        callback();
    });
}

function archiveItem(id, tableName, columnId, setArchivedField, res) {
    const query = `UPDATE ${tableName} SET ${setArchivedField} WHERE ${columnId} = ?`;
    conn.query(query, [id], (err, result) => {
        if (err) {
            console.error("Error archiving record:", err);
            return res.status(500).json({ status: 500, message: "Error archiving record" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 404, message: "Record not found" });
        }

        res.status(200).json({ status: 200, message: `${type.charAt(0).toUpperCase() + type.slice(1)} removed successfully` });
    });
}

function archiveItem(id, tableName, columnId, setArchivedField, res) {
    const query = `UPDATE ${tableName} SET ${setArchivedField} WHERE ${columnId} = ?`;
    conn.query(query, [id], (err, result) => {
        if (err) {
            console.error("Error archiving record:", err);
            return res.status(500).json({ status: 500, message: "Error deleting record" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 404, message: "Record not found" });
        }

        if (tableName === "tbl_items") {
            const updateIngredientsQuery = `
                UPDATE tbl_item_ingredients
                SET is_archived = 1
                WHERE item_id = ?
            `;
            conn.query(updateIngredientsQuery, [id], (ingredientsErr, ingredientsResult) => {
                if (ingredientsErr) {
                    console.error("Error archiving related ingredients:", ingredientsErr);
                    return res.status(500).json({ status: 500, message: "Error deleting related ingredients" });
                }

                res.status(200).json({
                    status: 200,
                    message: "Item and related ingredients deleted successfully",
                    archivedIngredients: ingredientsResult.affectedRows
                });
            });
        } else if (tableName === "tbl_raw_materials") {
            archiveRelatedRawMaterial(id, res);
        } else {
            res.status(200).json({ status: 200, message: "Record removed successfully" });
        }
    });
}

function archiveRelatedRawMaterial(id, res) {
    const updateStocksQuery = `
        UPDATE tbl_stocks SET is_archive = 1 WHERE raw_material_id = ?
    `;
    conn.query(updateStocksQuery, [id], (stockErr, stockResult) => {
        if (stockErr) {
            console.error("Error deleting related stocks:", stockErr);
            return res.status(500).json({ status: 500, message: "Error archiving related stocks" });
        }

        const getItemIdsQuery = `
            SELECT DISTINCT item_id
            FROM tbl_item_ingredients
            WHERE stock_id IN (SELECT stockId FROM tbl_stocks WHERE raw_material_id = ?)
        `;
        conn.query(getItemIdsQuery, [id], (itemErr, itemResults) => {
            if (itemErr) {
                console.error("Error fetching related items:", itemErr);
                return res.status(500).json({ status: 500, message: "Error fetching related items" });
            }

            const itemIds = itemResults.map(row => row.item_id);

            if (itemIds.length > 0) {
                const updateIngredientsQuery = `
                    UPDATE tbl_item_ingredients
                    SET is_archived = 1
                    WHERE item_id IN (?)
                `;
                conn.query(updateIngredientsQuery, [itemIds], (ingredientsErr, ingredientsResult) => {
                    if (ingredientsErr) {
                        console.error("Error deleting related ingredients:", ingredientsErr);
                        return res.status(500).json({ status: 500, message: "Error deleting related ingredients" });
                    }

                    const updateItemsQuery = `
                        UPDATE tbl_items
                        SET is_archived = 1
                        WHERE id IN (?)
                    `;
                    conn.query(updateItemsQuery, [itemIds], (itemsErr, itemsResult) => {
                        if (itemsErr) {
                            console.error("Error deleting related items:", itemsErr);
                            return res.status(500).json({ status: 500, message: "Error deleting related items" });
                        }

                        res.status(200).json({
                            status: 200,
                            message: "Raw material, related stocks, ingredients, and items archived successfully",
                            archivedStocks: stockResult.affectedRows,
                            archivedIngredients: ingredientsResult.affectedRows,
                            archivedItems: itemsResult.affectedRows
                        });
                    });
                });
            } else {
                res.status(200).json({
                    status: 200,
                    message: "Raw material and related stocks archived successfully, no items or ingredients to archive"
                });
            }
        });
    });
}

router.get('/check-username/:type', authenticateToken, authorizeRoles('superadmin'), (req, res) => {
    const { type } = req.params;
    const { username, id } = req.query; 
    let query;
    let params = [username, id];

    if (type === 'admin') {
        query = `SELECT COUNT(*) as count FROM tbl_admins WHERE username = ? AND id != ?`;
    } else if (type === 'superadmin') {
        query = `SELECT COUNT(*) as count FROM tbl_superadmins WHERE username = ? AND superadminid != ?`;
    } else if (type === 'user') {
        query = `SELECT COUNT(*) as count FROM tbl_users WHERE username = ? AND userId != ?`;
    } else {
        return res.status(400).json({ message: 'Invalid account type' });
    }

    conn.query(query, params, (err, result) => {
        if (err) {
            console.error('Error checking username:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (result[0].count > 0) {
            return res.json({ exists: true });
        }

        res.json({ exists: false });
    });
});

router.get("/get-pos-data", authenticateToken, authorizeRoles('admin', 'customer'), (req, res) => {
    try {
        conn.query(`
            SELECT 
                tbl_items.id, 
                tbl_items.itemname, 
                tbl_items.img, 
                tbl_items.price, 
                MIN(IFNULL(FLOOR(tbl_stocks.stock_quantity / tbl_item_ingredients.quantity_required), 0)) AS max_meals
            FROM tbl_items
            LEFT JOIN tbl_item_ingredients ON tbl_items.id = tbl_item_ingredients.item_id
            LEFT JOIN tbl_stocks ON tbl_item_ingredients.stock_id = tbl_stocks.stockId
            GROUP BY tbl_items.id;
        `, (err, result) => {
            if (err) {
                console.error("Error fetching data:", err);
                res.status(500).json({ status: 500, message: "Internal server error" });
            } else {
                console.log("Data fetched successfully.");
                res.status(200).json({ status: 201, data: result });
            }
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        res.status(500).json({ status: 500, message: "Unexpected server error" });
    }
});


router.get("/get-menu-data", authenticateToken, authorizeRoles('admin', 'customer'), (req, res) => {
    try {
        conn.query(`
            SELECT 
    tbl_items.id, 
    tbl_items.itemname, 
    tbl_items.img, 
    tbl_items.price, 
    tbl_items.category, 
    MIN(IFNULL(FLOOR(tbl_stocks.stock_quantity / tbl_item_ingredients.quantity_required), 0)) AS max_meals,
    IFNULL(sales.totalQuantity, 0) AS totalQuantity
FROM tbl_items
LEFT JOIN tbl_item_ingredients ON tbl_items.id = tbl_item_ingredients.item_id
LEFT JOIN tbl_stocks ON tbl_item_ingredients.stock_id = tbl_stocks.stockId
LEFT JOIN (
    SELECT i.id AS itemId, SUM(o.quantity) AS totalQuantity
    FROM tbl_sale s
    JOIN tbl_orders o ON s.orderId = o.orderId
    JOIN tbl_items i ON o.id = i.id
    WHERE DATE(s.saleDate) = CURDATE() - INTERVAL 1 DAY
    GROUP BY i.id
) AS sales ON tbl_items.id = sales.itemId
WHERE tbl_items.is_archived = 0
GROUP BY tbl_items.id, tbl_items.itemname, tbl_items.img, tbl_items.price, tbl_items.category;

`, (err, result) => {
            if (err) {
                console.error("Error fetching data:", err);
                res.status(500).json({ status: 500, message: "Internal server error" });
            } else {
                console.log("Data fetched successfully.");
                res.status(200).json({ status: 201, data: result });
            }
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        res.status(500).json({ status: 500, message: "Unexpected server error" });
    }
});


router.get("/top-selling", authenticateToken, authorizeRoles('customer'), (req, res) => {
    try {
        const userGender = req.user.gender;
        const query = `
        SELECT i.id, i.itemname, i.img, i.price, SUM(o.quantity) AS total_quantity_sold
        FROM tbl_orders o
        JOIN tbl_items i ON o.id = i.id
        JOIN tbl_sale s ON o.orderId = s.orderId
        WHERE o.status = 'completed'
        AND s.saleDate >= CURDATE()
        AND s.saleDate < CURDATE() + INTERVAL 1 DAY
        AND s.gender = ?
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
    i.id AS id,  -- Include the item ID
    i.itemname AS Item_Name, 
    i.category AS Category,
    i.price AS Price,
    GROUP_CONCAT(CONCAT(s.stock_item_name, ' (', ii.quantity_required, ' ', s.unit, ')') ORDER BY s.stock_item_name SEPARATOR ', ') AS Stock_Details
FROM 
    tbl_item_ingredients ii
JOIN 
    tbl_items i ON ii.item_id = i.id
JOIN 
    tbl_stocks s ON ii.stock_id = s.stockId
WHERE 
    i.is_archived = 0  -- Filter to show only archived items
GROUP BY 
    i.id,  -- Group by the item ID
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

router.post('/addStock', authenticateToken, authorizeRoles('superadmin'), async (req, res) => {
    const { stockName, stockUnit, requiresRawMaterial, raw_material_id, quantity_required, conversion_ratio, raw_material_usage_quantity, stockQuantity } = req.body;

    if (!stockName || !stockUnit) {
        return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    try {
        const [results] = await conn.promise().query('SELECT COUNT(*) AS count FROM tbl_stocks WHERE stock_item_name = ? AND is_archive = 0', [stockName]);
        if (results[0].count > 0) {
            return res.status(409).json({ message: 'Stock with the same name already exists' });
        }

        let calculatedStockQuantity = stockQuantity;

        if (requiresRawMaterial) {
            const [rawMaterial] = await conn.promise().query('SELECT raw_material_quantity FROM tbl_raw_materials WHERE raw_material_id = ?', [raw_material_id]);
            if (!rawMaterial.length) {
                return res.status(400).json({ error: 'Invalid raw material ID' });
            }

            if (rawMaterial[0].raw_material_quantity < raw_material_usage_quantity) {
                return res.status(400).json({ error: 'Insufficient raw material quantity.' });
            }

            calculatedStockQuantity = raw_material_usage_quantity * conversion_ratio;

            const newRawMaterialQuantity = rawMaterial[0].raw_material_quantity - raw_material_usage_quantity;
            await conn.promise().query('UPDATE tbl_raw_materials SET raw_material_quantity = ? WHERE raw_material_id = ?', [newRawMaterialQuantity, raw_material_id]);
        }

        const query = 'INSERT INTO tbl_stocks (stock_item_name, stock_quantity, unit, requires_raw_material, raw_material_id, quantity_required, conversion_ratio, is_archive) VALUES (?, ?, ?, ?, ?, ?, ?, 0)';
        const values = [stockName, calculatedStockQuantity, stockUnit, requiresRawMaterial, raw_material_id, quantity_required, conversion_ratio];

        await conn.promise().query(query, values);
        res.status(201).json({ message: 'Stock added successfully', status: 201 });

    } catch (err) {
        console.error('Error adding stock item:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/getstock', authenticateToken, authorizeRoles('superadmin', 'superadmin'), (req, res) => {
    const query = 'SELECT * FROM tbl_stocks WHERE is_archive = 0';
    conn.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching stock data:', err);
            return res.status(500).json({ error: 'Internal server error.' });
        }
        res.status(200).json({ status: 'success', data: results });
    });
});

router.put('/update-stock/:id', authenticateToken, authorizeRoles('superadmin', 'admin'), async (req, res) => {
    const stockId = req.params.id;
    const { stock_item_name, stock_quantity, unit, raw_material_id, quantity_required, conversion_ratio, raw_material_usage_quantity } = req.body;

    console.log('Received payload:', req.body);

    if (!stock_item_name || isNaN(stock_quantity) || !unit) {
        return res.status(400).json({ message: 'Invalid input data' });
    }

    try {
        let calculatedStockQuantity = stock_quantity;
        if (raw_material_id && raw_material_usage_quantity && conversion_ratio) {
            calculatedStockQuantity = stock_quantity + raw_material_usage_quantity * conversion_ratio;
        }
        
        console.log('Calculated stock quantity:', calculatedStockQuantity);

        let stockQuery = `
            UPDATE tbl_stocks 
            SET stock_item_name = ?, stock_quantity = ?, unit = ?
        `;
        const stockParams = [stock_item_name, calculatedStockQuantity, unit];

        if (raw_material_id && quantity_required && conversion_ratio) {
            stockQuery += `, raw_material_id = ?, quantity_required = ?, conversion_ratio = ?`;
            stockParams.push(raw_material_id, quantity_required, conversion_ratio);
        }

        stockQuery += ` WHERE stockId = ?`;
        stockParams.push(stockId);

        await conn.promise().query(stockQuery, stockParams);
        console.log('Stock updated successfully');

        if (raw_material_id && raw_material_usage_quantity) {
            const [rawMaterial] = await conn.promise().query(
                'SELECT raw_material_quantity FROM tbl_raw_materials WHERE raw_material_id = ?',
                [raw_material_id]
            );

            if (rawMaterial.length === 0) {
                return res.status(404).json({ message: 'Raw material not found' });
            }
            const currentQuantity = rawMaterial[0].raw_material_quantity;
            const newRawMaterialQuantity = currentQuantity - raw_material_usage_quantity;
            console.log(`Current raw material quantity for ID ${raw_material_id}: ${currentQuantity}`);
            console.log(`Raw material usage quantity to deduct: ${raw_material_usage_quantity}`);
            console.log(`New raw material quantity after deduction: ${newRawMaterialQuantity}`);

            if (newRawMaterialQuantity >= 0) {
                const [updateResult] = await conn.promise().query(
                    'UPDATE tbl_raw_materials SET raw_material_quantity = ? WHERE raw_material_id = ?',
                    [newRawMaterialQuantity, raw_material_id]
                );
                console.log('Raw material update result:', updateResult);

                if (updateResult.affectedRows === 0) {
                    return res.status(404).json({ message: 'Raw material not found or not updated' });
                }
                res.status(200).json({ message: 'Stock and raw material updated successfully' });
            } else {
                console.warn(`Insufficient quantity in raw materials. Current quantity: ${currentQuantity}, attempted deduction: ${raw_material_usage_quantity}`);
                res.status(400).json({ message: 'Insufficient raw material quantity' });
            }
        } else {
            console.log('No raw material deduction required or invalid data provided.');
            res.status(200).json({ message: 'Stock updated successfully without raw material deduction' });
        }
    } catch (error) {
        console.error('Error updating stock or raw material:', error);
        res.status(500).json({ message: 'Failed to update stock or raw material', error });
    }
});

router.post('/add-to-cart', authenticateToken, authorizeRoles('customer'), (req, res) => {
    const userId = req.user.userId;
    const { itemId, quantity } = req.body;

    if (!itemId || !quantity || isNaN(itemId) || isNaN(quantity)) {
        return res.status(400).json({ status: 'error', message: 'Invalid item ID or quantity' });
    }

    console.log('Adding item to cart:', { itemId, quantity });

    conn.query(
        'SELECT price FROM tbl_items WHERE id = ?',
        [itemId],
        (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ status: 'error', message: 'Internal server error' });
            }
            if (results.length === 0) {
                return res.status(404).json({ status: 'error', message: 'Item not found' });
            }

            const price = results[0].price;

            conn.query(
                'SELECT * FROM tbl_cart WHERE userId = ? AND id = ?',
                [userId, itemId],
                (error, results) => {
                    if (error) {
                        console.error(error);
                        return res.status(500).json({ status: 'error', message: 'Internal server error' });
                    }
                    if (results.length > 0) {
 
                        const newQuantity = results[0].quantity + quantity;
                        conn.query(
                            'UPDATE tbl_cart SET quantity = ? WHERE userId = ? AND id = ?',
                            [newQuantity, userId, itemId],
                            (error, results) => {
                                if (error) {
                                    console.error(error);
                                    return res.status(500).json({ status: 'error', message: 'Internal server error' });
                                }
                                return res.status(200).json({ status: 'success', message: 'Item quantity updated in cart' });
                            }
                        );
                    } else {
                        conn.query(
                            'INSERT INTO tbl_cart (userId, id, quantity, price) VALUES (?, ?, ?, ?)',
                            [userId, itemId, quantity, price],
                            (error, results) => {
                                if (error) {
                                    console.error(error);
                                    return res.status(500).json({ status: 'error', message: 'Internal server error' });
                                }
                                return res.status(201).json({ status: 'success', message: 'Item added to cart' });
                            }
                        );
                    }
                }
            );
        }
    );
});



router.post('/add-to-pos', authenticateToken, authorizeRoles('admin'), (req, res) => {
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

router.get('/cart', authenticateToken, authorizeRoles('customer'), (req, res) => {
    const userId = req.user.userId;

    conn.query(
        `SELECT 
    tbl_items.itemname, 
    tbl_cart.id AS itemId, 
    tbl_cart.quantity, 
    tbl_cart.price 
FROM 
    tbl_cart 
JOIN 
    tbl_items ON tbl_cart.id = tbl_items.id 
WHERE 
    tbl_cart.userId = ? 
    AND tbl_items.is_archived = 0; `,
        [userId],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).json({ status: 'error', message: 'Internal server error' });
            } else {
                res.status(200).json({ status: 'success', data: results });
                console.log("nag iinfinite loop ba itong getcartdata?");
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
    const userId = req.user.userId; 
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
    const userId = req.user.userId;  
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

router.get('/comp-lete-order', async (req, res) => {
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

router.post('/cancel-order', authenticateToken, (req, res) => {
    const { orderIds, reason } = req.body;  
    const getOrderQuery = `
        SELECT o.id, o.quantity, i.id AS item_id, ii.stock_id, ii.quantity_required, o.orderId
        FROM tbl_orders o
        JOIN tbl_items i ON o.id = i.id
        JOIN tbl_item_ingredients ii ON i.id = ii.item_id
        WHERE o.orderId IN (?) AND o.status = 'pending';
    `;

    conn.query(getOrderQuery, [orderIds], (err, orderItems) => {
        if (err) {
            console.error('Error fetching order items:', err);
            return res.status(500).json({ success: false, error: 'Failed to fetch order items' });
        }

        if (orderItems.length === 0) {
            return res.status(400).json({ success: false, error: 'No such pending orders found' });
        }

        const updateStocks = (index) => {
            if (index >= orderItems.length) {
                const cancelOrderQuery = `
                    UPDATE tbl_orders 
                    SET status = 'cancelled', cancelReason = ?
                    WHERE orderId IN (?)
                `;
                conn.query(cancelOrderQuery, [reason, orderIds], (err) => {
                    if (err) {
                        console.error('Error canceling orders:', err);
                        return res.status(500).json({ success: false, error: 'Failed to cancel orders' });
                    }
                    return res.json({ success: true, message: 'Orders canceled successfully' });
                });
                return;
            }

            const item = orderItems[index];
            const restoreStockQuantity = item.quantity * item.quantity_required;

            conn.query(
                'UPDATE tbl_stocks SET stock_quantity = stock_quantity + ? WHERE stockId = ?',
                [restoreStockQuantity, item.stock_id],
                (err) => {
                    if (err) {
                        console.error('Error restoring stock:', err);
                        return res.status(500).json({ success: false, error: 'Failed to restore stock' });
                    }
                    updateStocks(index + 1); 
                }
            );
        };

        updateStocks(0); 
    });
});

router.post('/place-order', authenticateToken, upload.single('qrCodeImage'), (req, res) => {
    const userId = req.user.userId;
    const qrCodeImage = req.file ? req.file.filename : null; 
    let stockUpdates = [];

    conn.query('SELECT userName, gender FROM tbl_users WHERE userId = ?', [userId], (error, userResult) => {
        if (error) {
            console.error('Error fetching user name and gender:', error);
            return res.status(500).json({ success: false, error: 'Failed to fetch user data' });
        }

        if (userResult.length === 0) {
            return res.status(400).json({ success: false, error: 'User not found' });
        }

        const userName = userResult[0].userName; 
        const gender = userResult[0].gender; 

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
                                    (userId, id, quantity, price, orderNumber, status, qrCodeImage, userName, gender) 
                                    VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?)
                                `;
                                const insertOrderValues = [
                                    userId,
                                    item.id,
                                    item.quantity,
                                    item.price,
                                    newOrderNumber,
                                    qrCodeImage,
                                    userName, 
                                    gender
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
});

router.post('/pos-place-order', authenticateToken, authorizeRoles('admin'), (req, res) => {
    const adminId = req.user.userId; 
    const qrCodeImage = req.file ? req.file.filename : null; 
    const posItems = req.body.posItems;
    let stockUpdates = [];

    if (!Array.isArray(posItems) || posItems.length === 0) {
        return res.status(400).json({ success: false, error: 'No items in POS' });
    }

    conn.beginTransaction((err) => {
        if (err) {
            console.error('Transaction error:', err); 
            return res.status(500).json({ success: false, error: 'Transaction failed' });
        }

        conn.query('SELECT username FROM tbl_admins WHERE id = ?', [adminId], (err, results) => {
            if (err) {
                return conn.rollback(() => { 
                    console.error('Error fetching admin username:', err);
                    return res.status(500).json({ success: false, error: 'Failed to fetch admin username' });
                });
            }

            const adminUsername = results[0]?.username; 

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
                        const updateStocks = (index) => {
                            if (index >= stockUpdates.length) {
                                conn.query('DELETE FROM tbl_pos WHERE adminId = ?', [adminId], (err) => {
                                    if (err) {
                                        return conn.rollback(() => { 
                                            console.error('Error emptying POS:', err);
                                            return res.status(500).json({ success: false, error: 'Failed to empty POS' });
                                        });
                                    }
                                    conn.commit((err) => {
                                        if (err) {
                                            return conn.rollback(() => { 
                                                console.error('Transaction commit failed:', err);
                                                return res.status(500).json({ success: false, error: 'Transaction commit failed' });
                                            });
                                        }
                                        res.json({ success: true, orderNumber: newOrderNumber });
                                    });
                                });
                                return;
                            }
                            const { stockId, newStockQuantity } = stockUpdates[index];
                            conn.query('UPDATE tbl_stocks SET stock_quantity = ? WHERE stockId = ?', 
                                [newStockQuantity, stockId], (err) => {
                                    if (err) {
                                        return conn.rollback(() => { 
                                            console.error('Error updating stock:', err);
                                            return res.status(500).json({ success: false, error: 'Failed to update stock' });
                                        });
                                    }
                                    updateStocks(index + 1); 
                                });
                        };
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
                                (userId, id, quantity, price, orderNumber, status, qrCodeImage, adminName, userName) 
                                VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?)`;

                                const insertOrderValues = [
                                    adminId, 
                                    item.itemId, 
                                    item.quantity, 
                                    item.price, 
                                    newOrderNumber, 
                                    qrCodeImage,
                                    null, 
                                    adminUsername 
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
});

router.post('/upload-qr-code', upload.single('qrCodeImage'), async (req, res) => {
    const { userId, id, quantity, price, orderNumber } = req.body;
    const qrCodeImage = req.file ? req.file.filename : null;

    if (!userId || !id || !quantity || !price || !orderNumber || !qrCodeImage) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    try {
        const query = `INSERT INTO tbl_orders (userId, id, quantity, price, orderNumber, status, qrCodeImage)
                       VALUES (?, ?, ?, ?, ?, 'pending', ?)`;
        const values = [userId, id, quantity, price, orderNumber, qrCodeImage];
        await conn.execute(query, values);
        res.json({ success: true });
    } catch (error) {
        console.error('Error inserting order:', error);
        res.status(500).json({ success: false, error: 'Failed to complete order' });
    }
});

router.get('/orders', authenticateToken, authorizeRoles('admin'),(req, res) => {
    console.log('Fetching pending orders...');
    const query = `
        SELECT 
    tbl_orders.orderId,
    tbl_orders.orderNumber,
    tbl_orders.userName,
    tbl_items.itemname,
    tbl_orders.quantity,
    tbl_orders.price
FROM 
    tbl_orders
JOIN 
    tbl_items ON tbl_orders.id = tbl_items.id
WHERE 
    tbl_orders.status = 'pending'   -- Only pending orders
    AND tbl_items.is_archived = 0   -- Only show items that are not archived
ORDER BY 
    tbl_orders.orderNumber;
    `;
    
    conn.query(query, (error, rows) => {
        if (error) {
            console.error('Error fetching orders:', error);
            return res.status(500).json({ message: 'Error fetching orders', error });
        }
        console.log('Pending orders fetched:', rows); 
        res.json(rows);
    });
});

router.post('/api/cashier1Sales', authenticateToken, authorizeRoles('superadmin'), (req, res) => {
    // const query = `
    // SELECT 
    //     s.saleId, 
    //     o.orderId, 
    //     o.orderNumber,  -- Include orderNumber
    //     s.userName, 
    //     s.totalAmount, 
    //     s.saleDate, 
    //     i.itemname,
    //     s.quantity 
    // FROM 
    //     tbl_sale s
    // JOIN 
    //     tbl_orders o ON s.orderId = o.orderId
    // JOIN 
    //     tbl_items i ON o.id = i.id
    // WHERE 
    //     DATE(s.saleDate) = CURDATE()
    //     AND s.userName = 'cashier1';
    // `;
    const query = `
        SELECT 
        s.saleId, 
        o.orderId, 
        o.orderNumber,  -- Include orderNumber
        s.adminName as cashier_name,
        u.name as customer_name,
        -- Add the status column next to the customer_name
        CASE 
            WHEN u.userName IS NULL THEN 'walk-in'  -- If there's no customer username, it's a "walk-in" order
            ELSE 'online'  -- If there's a customer username, it's an "online" order
        END AS status,
        s.totalAmount, 
        s.saleDate, 
        s.quantity, 
        i.itemname
    FROM 
        tbl_sale s
    JOIN 
        tbl_orders o ON s.orderId = o.orderId
    JOIN 
        tbl_items i ON o.id = i.id 
    LEFT JOIN
        tbl_admins a ON s.adminName = a.name
    LEFT JOIN
        tbl_users u ON s.userName = u.username
    WHERE 
            DATE(s.saleDate) = CURDATE()
        AND s.userName = 'cashier1';
    `
    conn.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching cashier1\'s sales:', err);
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }
        res.status(200).json(results);
    });
});

router.post('/api/cashier1SalesMonth', authenticateToken, authorizeRoles('superadmin'), (req, res) => {
    // const query = `
    //     SELECT 
    //         s.saleId, 
    //         o.orderId, 
    //         o.orderNumber,  -- Include orderNumber
    //         s.userName, 
    //         s.totalAmount, 
    //         s.saleDate, 
    //         i.itemname,
    //         s.quantity 
    //     FROM 
    //         tbl_sale s
    //     JOIN 
    //         tbl_orders o ON s.orderId = o.orderId
    //     JOIN 
    //         tbl_items i ON o.id = i.id
    //     WHERE 
    //         MONTH(s.saleDate) = MONTH(CURDATE()) 
    //         AND YEAR(s.saleDate) = YEAR(CURDATE())
    //         AND s.userName = 'cashier1';
    // `;
    const query = `
            SELECT 
        s.saleId, 
        o.orderId, 
        o.orderNumber,  -- Include orderNumber
        s.adminName as cashier_name,
        u.name as customer_name,
        -- Add the status column next to the customer_name
        CASE 
            WHEN u.userName IS NULL THEN 'walk-in'  -- If there's no customer username, it's a "walk-in" order
            ELSE 'online'  -- If there's a customer username, it's an "online" order
        END AS status,
        s.totalAmount, 
        s.saleDate, 
        s.quantity, 
        i.itemname
    FROM 
        tbl_sale s
    JOIN 
        tbl_orders o ON s.orderId = o.orderId
    JOIN 
        tbl_items i ON o.id = i.id 
    LEFT JOIN
        tbl_admins a ON s.adminName = a.name
    LEFT JOIN
        tbl_users u ON s.userName = u.username
    WHERE 
            MONTH(s.saleDate) = MONTH(CURDATE()) 
            AND YEAR(s.saleDate) = YEAR(CURDATE())
            AND s.userName = 'cashier1';
    `
    conn.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching cashier1\'s monthly sales:', err);
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }
        res.status(200).json(results);
    });
});

router.post('/api/cashier1SalesWeek', authenticateToken, authorizeRoles('superadmin'), (req, res) => {
    // const query = `
    //     SELECT 
    //         s.saleId, 
    //         o.orderId, 
    //         o.orderNumber,  -- Include orderNumber
    //         s.userName, 
    //         s.totalAmount, 
    //         s.saleDate, 
    //         i.itemname,
    //         s.quantity 
    //     FROM 
    //         tbl_sale s
    //     JOIN 
    //         tbl_orders o ON s.orderId = o.orderId
    //     JOIN 
    //         tbl_items i ON o.id = i.id
    //     WHERE 
    //         YEAR(s.saleDate) = YEAR(CURDATE()) 
    //         AND WEEK(s.saleDate, 1) = WEEK(CURDATE(), 1)
    //         AND s.userName = 'cashier1';
    // `;
    const query = `
            SELECT 
        s.saleId, 
        o.orderId, 
        o.orderNumber,  -- Include orderNumber
        s.adminName as cashier_name,
        u.name as customer_name,
        -- Add the status column next to the customer_name
        CASE 
            WHEN u.userName IS NULL THEN 'walk-in'  -- If there's no customer username, it's a "walk-in" order
            ELSE 'online'  -- If there's a customer username, it's an "online" order
        END AS status,
        s.totalAmount, 
        s.saleDate, 
        s.quantity, 
        i.itemname
    FROM 
        tbl_sale s
    JOIN 
        tbl_orders o ON s.orderId = o.orderId
    JOIN 
        tbl_items i ON o.id = i.id 
    LEFT JOIN
        tbl_admins a ON s.adminName = a.name
    LEFT JOIN
        tbl_users u ON s.userName = u.username
    WHERE 
             YEAR(s.saleDate) = YEAR(CURDATE()) 
            AND WEEK(s.saleDate, 1) = WEEK(CURDATE(), 1)
            AND s.userName = 'cashier1';
    `
    conn.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching cashier1\'s weekly sales:', err);
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }
        res.status(200).json(results);
    });
});

router.post('/api/cashier2Sales', authenticateToken, authorizeRoles('superadmin'), (req, res) => {
    // const query = `
    // SELECT 
    //     s.saleId, 
    //     o.orderId, 
    //     o.orderNumber,   -- Include orderNumber
    //     s.userName, 
    //     s.totalAmount, 
    //     s.saleDate, 
    //     i.itemname,
    //     s.quantity 
    // FROM 
    //     tbl_sale s
    // JOIN 
    //     tbl_orders o ON s.orderId = o.orderId
    // JOIN 
    //     tbl_items i ON o.id = i.id
    // WHERE 
    //     DATE(s.saleDate) = CURDATE()
    //     AND s.userName = 'cashier2';
    // `;
    const query = `
            SELECT 
        s.saleId, 
        o.orderId, 
        o.orderNumber,  -- Include orderNumber
        s.adminName as cashier_name,
        u.name as customer_name,
        -- Add the status column next to the customer_name
        CASE 
            WHEN u.userName IS NULL THEN 'walk-in'  -- If there's no customer username, it's a "walk-in" order
            ELSE 'online'  -- If there's a customer username, it's an "online" order
        END AS status,
        s.totalAmount, 
        s.saleDate, 
        s.quantity, 
        i.itemname
    FROM 
        tbl_sale s
    JOIN 
        tbl_orders o ON s.orderId = o.orderId
    JOIN 
        tbl_items i ON o.id = i.id 
    LEFT JOIN
        tbl_admins a ON s.adminName = a.name
    LEFT JOIN
        tbl_users u ON s.userName = u.username
    WHERE 
            DATE(s.saleDate) = CURDATE()
        AND s.userName = 'cashier2';
    `
    conn.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching cashier2\'s sales:', err);
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }
        res.status(200).json(results);
    });
});

router.post('/api/cashier2SalesMonth', authenticateToken, authorizeRoles('superadmin'), (req, res) => {
    // const query = `
    //     SELECT 
    //         s.saleId, 
    //         o.orderId, 
    //         o.orderNumber,   -- Include orderNumber
    //         s.userName, 
    //         s.totalAmount, 
    //         s.saleDate, 
    //         i.itemname,
    //         s.quantity 
    //     FROM 
    //         tbl_sale s
    //     JOIN 
    //         tbl_orders o ON s.orderId = o.orderId
    //     JOIN 
    //         tbl_items i ON o.id = i.id
    //     WHERE 
    //         MONTH(s.saleDate) = MONTH(CURDATE()) 
    //         AND YEAR(s.saleDate) = YEAR(CURDATE())
    //         AND s.userName = 'cashier2';
    // `;
    const query = `
        SELECT 
        s.saleId, 
        o.orderId, 
        o.orderNumber,  -- Include orderNumber
        s.adminName as cashier_name,
        u.name as customer_name,
        -- Add the status column next to the customer_name
        CASE 
            WHEN u.userName IS NULL THEN 'walk-in'  -- If there's no customer username, it's a "walk-in" order
            ELSE 'online'  -- If there's a customer username, it's an "online" order
        END AS status,
        s.totalAmount, 
        s.saleDate, 
        s.quantity, 
        i.itemname
    FROM 
        tbl_sale s
    JOIN 
        tbl_orders o ON s.orderId = o.orderId
    JOIN 
        tbl_items i ON o.id = i.id 
    LEFT JOIN
        tbl_admins a ON s.adminName = a.name
    LEFT JOIN
        tbl_users u ON s.userName = u.username
    WHERE 
            MONTH(s.saleDate) = MONTH(CURDATE()) 
            AND YEAR(s.saleDate) = YEAR(CURDATE())
            AND s.userName = 'cashier2';
    `
    conn.query(query, (err, results) => {
        if (err) {
            console.error(`Error fetching cashier2's monthly sales:`, err);
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }
        res.status(200).json(results);
    });
});

router.post('/api/cashier2SalesWeek', authenticateToken, authorizeRoles('superadmin'), (req, res) => {
    // const query = `
    //     SELECT 
    //         s.saleId, 
    //         o.orderId, 
    //         o.orderNumber,   -- Include orderNumber
    //         s.userName, 
    //         s.totalAmount, 
    //         s.saleDate, 
    //         i.itemname,
    //         s.quantity 
    //     FROM 
    //         tbl_sale s
    //     JOIN 
    //         tbl_orders o ON s.orderId = o.orderId
    //     JOIN 
    //         tbl_items i ON o.id = i.id
    //     WHERE 
    //         YEAR(s.saleDate) = YEAR(CURDATE()) 
    //         AND WEEK(s.saleDate, 1) = WEEK(CURDATE(), 1)
    //         AND s.userName = 'cashier2'
    //     ;
    // `;
    const query = `
        SELECT 
        s.saleId, 
        o.orderId, 
        o.orderNumber,  -- Include orderNumber
        s.adminName as cashier_name,
        u.name as customer_name,
        -- Add the status column next to the customer_name
        CASE 
            WHEN u.userName IS NULL THEN 'walk-in'  -- If there's no customer username, it's a "walk-in" order
            ELSE 'online'  -- If there's a customer username, it's an "online" order
        END AS status,
        s.totalAmount, 
        s.saleDate, 
        s.quantity, 
        i.itemname
    FROM 
        tbl_sale s
    JOIN 
        tbl_orders o ON s.orderId = o.orderId
    JOIN 
        tbl_items i ON o.id = i.id 
    LEFT JOIN
        tbl_admins a ON s.adminName = a.name
    LEFT JOIN
        tbl_users u ON s.userName = u.username
    WHERE 
       YEAR(s.saleDate) = YEAR(CURDATE()) 
        AND WEEK(s.saleDate, 1) = WEEK(CURDATE(), 1)
        AND s.userName = 'cashier2'
    `
    conn.query(query, (err, results) => {
        if (err) {
            console.error(`Error fetching cashier2's weekly sales:`, err);
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }
        res.status(200).json(results);
    });
});


router.get('/api/sales/today', authenticateToken, authorizeRoles('superadmin'), (req, res) => {
    // const query = `
    //       SELECT 
    //         s.saleId, 
    //         o.orderId, 
    //         o.orderNumber,  -- Include orderNumber
    //         s.userName, 
    //         s.totalAmount, 
    //         s.saleDate, 
    //         s.quantity, 
    //         i.itemname
    //     FROM 
    //         tbl_sale s
    //     JOIN 
    //         tbl_orders o ON s.orderId = o.orderId
    //     JOIN 
    //         tbl_items i ON o.id = i.id 
    //     WHERE 
    //         DATE(s.saleDate) = CURDATE()
    //     ORDER BY orderNumber;
    // `;
    const query = `
        SELECT 
        s.saleId, 
        o.orderId, 
        o.orderNumber,  -- Include orderNumber
        s.adminName as cashier_name,
        u.name as customer_name,
        -- Add the status column next to the customer_name
        CASE 
            WHEN u.userName IS NULL THEN 'walk-in'  -- If there's no customer username, it's a "walk-in" order
            ELSE 'online'  -- If there's a customer username, it's an "online" order
        END AS status,
        s.totalAmount, 
        s.saleDate, 
        s.quantity, 
        i.itemname
    FROM 
        tbl_sale s
    JOIN 
        tbl_orders o ON s.orderId = o.orderId
    JOIN 
        tbl_items i ON o.id = i.id 
    LEFT JOIN
        tbl_admins a ON s.adminName = a.name
    LEFT JOIN
        tbl_users u ON s.userName = u.username
    WHERE 
        DATE(s.saleDate) = CURDATE()
    ORDER BY 
        o.orderNumber;
    `
    conn.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching today\'s sales:', err);
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }
        res.status(200).json(results);
    });
});


router.get('/api/sales/week', authenticateToken, authorizeRoles('superadmin'), (req, res) => {
    // const query = `
    //     SELECT 
    //         s.saleId, 
    //         o.orderId, 
    //         o.orderNumber,  -- Include orderNumber
    //         s.userName, 
    //         s.totalAmount, 
    //         s.saleDate, 
    //         s.quantity, 
    //         i.itemname
    //     FROM 
    //         tbl_sale s
    //     JOIN 
    //         tbl_orders o ON s.orderId = o.orderId
    //     JOIN 
    //         tbl_items i ON o.id = i.id 
    //     WHERE 
    //         YEARWEEK(s.saleDate, 1) = YEARWEEK(CURDATE(), 1)
    //     ORDER BY orderNumber;
    // `;
    const query = `
        SELECT 
        s.saleId, 
        o.orderId, 
        o.orderNumber,  -- Include orderNumber
        s.adminName as cashier_name,
        u.name as customer_name,
        -- Add the status column next to the customer_name
        CASE 
            WHEN u.userName IS NULL THEN 'walk-in'  -- If there's no customer username, it's a "walk-in" order
            ELSE 'online'  -- If there's a customer username, it's an "online" order
        END AS status,
        s.totalAmount, 
        s.saleDate, 
        s.quantity, 
        i.itemname
    FROM 
        tbl_sale s
    JOIN 
        tbl_orders o ON s.orderId = o.orderId
    JOIN 
        tbl_items i ON o.id = i.id 
    LEFT JOIN
        tbl_admins a ON s.adminName = a.name
    LEFT JOIN
        tbl_users u ON s.userName = u.username
    WHERE 
      YEARWEEK(s.saleDate, 1) = YEARWEEK(CURDATE(), 1)
        ORDER BY orderNumber;
    `
    conn.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching this week\'s sales:', err);
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }
        res.status(200).json(results);
    });
});

router.get('/api/sales/month', authenticateToken, authorizeRoles('superadmin'), (req, res) => {
    // const query = `
    //     SELECT 
    //         s.saleId, 
    //         o.orderId, 
    //         o.orderNumber,  -- Include orderNumber
    //         s.userName, 
    //         s.totalAmount, 
    //         s.saleDate, 
    //         s.quantity, 
    //         i.itemname
    //     FROM 
    //         tbl_sale s
    //     JOIN 
    //         tbl_orders o ON s.orderId = o.orderId
    //     JOIN 
    //         tbl_items i ON o.id = i.id 
    //     WHERE 
    //         MONTH(s.saleDate) = MONTH(CURDATE()) 
    //         AND YEAR(s.saleDate) = YEAR(CURDATE())
    //     ORDER BY orderNumber;
    // `;
    const query = `
        SELECT 
        s.saleId, 
        o.orderId, 
        o.orderNumber,  -- Include orderNumber
        s.adminName as cashier_name,
        u.name as customer_name,
        -- Add the status column next to the customer_name
        CASE 
            WHEN u.userName IS NULL THEN 'walk-in'  -- If there's no customer username, it's a "walk-in" order
            ELSE 'online'  -- If there's a customer username, it's an "online" order
        END AS status,
        s.totalAmount, 
        s.saleDate, 
        s.quantity, 
        i.itemname
    FROM 
        tbl_sale s
    JOIN 
        tbl_orders o ON s.orderId = o.orderId
    JOIN 
        tbl_items i ON o.id = i.id 
    LEFT JOIN
        tbl_admins a ON s.adminName = a.name
    LEFT JOIN
        tbl_users u ON s.userName = u.username
    WHERE 
      MONTH(s.saleDate) = MONTH(CURDATE()) 
        AND YEAR(s.saleDate) = YEAR(CURDATE())
        ORDER BY orderNumber;
    `
    conn.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching this month\'s sales:', err);
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }
        res.status(200).json(results);
    });
});

router.get('/my-orders', authenticateToken, authorizeRoles('customer'), (req, res) => {
    const userId = req.user.userId;
    const query = `
        SELECT o.orderId, i.itemname, o.quantity, o.price, o.orderNumber, o.status, o.cancelReason
        FROM tbl_orders o
        JOIN tbl_items i ON o.id = i.id
        WHERE o.userId = ? AND o.status IN ('completed', 'cancelled', 'pending')
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
    const query = `UPDATE tbl_orders SET status = 'removed' WHERE orderId = ?`;

    conn.query(query, [orderId], (err, results) => {
        if (err) {
            console.error('Error updating order status:', err);
            return res.status(500).json({ success: false, error: 'Failed to update order status' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Order not found or cannot be updated' });
        }

        res.status(200).json({ success: true, message: 'Order status updated to removed successfully' });
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
router.get('/api/admins', authenticateToken, authorizeRoles('superadmin'), (req, res) => {
    const query = `SELECT * FROM tbl_admins WHERE is_archived = 0`; 

    conn.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err.stack);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length > 0) {
            res.status(200).json({
                message: 'Admins fetched successfully',
                admins: results,
            });
        } else {
            res.status(404).json({ message: 'No admins found' });
        }
    });
});

router.get('/api/superadmins', authenticateToken, authorizeRoles('superadmin'), (req, res) => {
    const query = `SELECT * FROM tbl_superadmins`;

    conn.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err.stack);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length > 0) {
            res.status(200).json({
                message: 'Super Admins fetched successfully',
                admins: results,
            });
        } else {
            res.status(404).json({ message: 'No superadmins found' });
        }
    });
});

router.get('/api/users', authenticateToken, authorizeRoles('superadmin'), (req, res) => {
    const query = `SELECT * FROM tbl_users WHERE is_archived = 0`;

    conn.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err.stack);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length > 0) {
            res.status(200).json({
                message: 'Users fetched successfully',
                admins: results,
            });
        } else {
            res.status(404).json({ message: 'No users found' });
        }
    });
});

router.put('/updateStock/:id', authenticateToken, authorizeRoles('superadmin'), (req, res) => {
    const { stock_item_name, stock_quantity, unit } = req.body; 
    const stockId = req.params.id;

    if (!stock_item_name || !stock_quantity || !unit) {
        return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    const query = 'UPDATE tbl_stocks SET stock_item_name = ?, stock_quantity = ?, unit = ? WHERE stockId = ?'; 
    conn.query(query, [stock_item_name, stock_quantity, unit, stockId], (err, results) => {
        if (err) {
            console.error('Error updating stock item:', err);
            return res.status(500).json({ error: 'Internal server error.' });
        }
        res.status(200).json({ status: 'success', message: 'Stock item updated successfully.' });
    });
});

router.get('/get-raw-materials', authenticateToken, authorizeRoles('superadmin', 'superadmin'), (req, res) => {
    const query = 'SELECT * FROM tbl_raw_materials WHERE is_archived = 0';
    conn.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching raw material data:', err);
            return res.status(500).json({ error: 'Internal server error.' });
        }
        res.status(200).json({ status: 'success', data: results });
    });
});


router.post('/add-raw-material', authenticateToken, authorizeRoles('superadmin', 'admin'), (req, res) => {
    const { rawMaterialName, rawMaterialQuantity, rawMaterialUnit } = req.body;

    if (!rawMaterialName || !rawMaterialQuantity || isNaN(rawMaterialQuantity) || !rawMaterialUnit) {
        return res.status(400).json({ message: 'Please provide all required fields. Invalid data.' });
    }

    const checkQuery = 'SELECT COUNT(*) AS count FROM tbl_raw_materials WHERE raw_material_name = ? AND is_archived = 0';
    conn.query(checkQuery, [rawMaterialName], (error, results) => {
        if (error) {
            console.error('Error checking for duplicate:', error);
            return res.status(500).json({ message: 'Internal server error', error });
        }

        if (results[0].count > 0) {
            return res.status(409).json({ message: 'Item with the same name already exists' });
        }

        const insertQuery = 'INSERT INTO tbl_raw_materials (raw_material_name, raw_material_quantity, raw_material_unit, date_added) VALUES (?, ?, ?, NOW())';
        conn.query(insertQuery, [rawMaterialName, rawMaterialQuantity, rawMaterialUnit], (insertError, insertResults) => {
            if (insertError) {
                console.error('Error adding raw material:', insertError);
                return res.status(500).json({ message: 'Failed to add raw material', error: insertError });
            }
            res.status(201).json({ message: 'Raw material added successfully', status: 201 });
        });
    });
});

router.put('/update-raw-material/:id', authenticateToken, authorizeRoles('superadmin', 'admin'), (req, res) => {
    const rawMaterialId = req.params.id;
    const { raw_material_name, raw_material_quantity, raw_material_unit } = req.body;

    if (!raw_material_name || isNaN(raw_material_quantity) || !raw_material_unit) {
        return res.status(400).json({ message: 'Invalid input data' });
    }

    const query = `
    UPDATE tbl_raw_materials 
    SET raw_material_name = ?, raw_material_quantity = ?, raw_material_unit = ?, date_added = NOW() 
    WHERE raw_material_id = ?
`;

conn.query(query, [raw_material_name, raw_material_quantity, raw_material_unit, rawMaterialId], (error, results) => {
    if (error) {
        console.error('Error updating raw material:', error);
        return res.status(500).json({ message: 'Failed to update raw material', error });
    }
    if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Raw material not found' });
    }
    res.status(200).json({ message: 'Raw material updated successfully', status: 200 });
});

});

router.get("/top-selling-sales", authenticateToken, authorizeRoles('superadmin'), (req, res) => {
    try {
        const query = `
        SELECT i.id, i.itemname, i.img, i.price, SUM(o.quantity) AS total_quantity_sold
        FROM tbl_orders o
        JOIN tbl_items i ON o.id = i.id
        JOIN tbl_sale s ON o.orderId = s.orderId
        WHERE o.status = 'completed'
        AND s.saleDate >= CURDATE()
        AND s.saleDate < CURDATE() + INTERVAL 1 DAY
        GROUP BY i.id, i.itemname, i.img, i.price
        ORDER BY total_quantity_sold DESC
        LIMIT 3;
        `;

        conn.query(query, (err, result) => {
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

router.post("/unit", (req, res) => {
    const { unit_name } = req.body;
    console.log(req.body);

    if (!unit_name) {
        return res.status(422).json({ status: 422, message: "Fill all the details" });
    }

    try {
        conn.query("INSERT INTO units SET ?", { unit_name: unit_name }, (err, result) => {
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

router.get("/units", (req, res) => {
    try {
        conn.query("SELECT * FROM units", (err, results) => {
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

router.post("/unit-stock", (req, res) => {
    const { unit_stock_name } = req.body;
    console.log(req.body);

    if (!unit_stock_name) {
        return res.status(422).json({ status: 422, message: "Unit stock name is required" });
    }

    try {
        conn.query("INSERT INTO units_stock SET ?", { unit_stock_name: unit_stock_name }, (err, result) => {
            if (err) {
                console.log("error:", err);
                return res.status(500).json({ status: 500, error: "Database insertion error" });
            }
            console.log("unit stock added");
            return res.status(201).json({ status: 201, data: req.body });
        });
    } catch (error) {
        console.log("error:", error);
        res.status(500).json({ status: 500, error: "Server error" });
    }
});

router.get("/unit-stocks", (req, res) => {
    try {
        conn.query("SELECT * FROM units_stock", (err, results) => {
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

router.get('/api/admins', authenticateToken, authorizeRoles('superadmin'), (req, res) => {
    const query = `SELECT * FROM tbl_admins`;

    conn.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err.stack);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length > 0) {
            res.status(200).json({
                message: 'Admins fetched successfully',
                admins: results,
            });
        } else {
            res.status(404).json({ message: 'No admins found' });
        }
    });
});

router.get('/api/superadmins', authenticateToken, authorizeRoles('superadmin'), (req, res) => {
    const query = `SELECT * FROM tbl_superadmins`;

    conn.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err.stack);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length > 0) {
            res.status(200).json({
                message: 'Super Admins fetched successfully',
                admins: results,
            });
        } else {
            res.status(404).json({ message: 'No superadmins found' });
        }
    });
});

router.get('/api/users', authenticateToken, authorizeRoles('superadmin'), (req, res) => {
    const query = `SELECT * FROM tbl_users WHERE is_archived = 0`;

    conn.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err.stack);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length > 0) {
            res.status(200).json({
                message: 'Users fetched successfully',
                admins: results,
            });
        } else {
            res.status(404).json({ message: 'No users found' });
        }
    });
});

router.put('/edit-account/:type/:id', authenticateToken, authorizeRoles('superadmin'), (req, res) => {
    const { type, id } = req.params;
    const { name, username, password, role, gender } = req.body;
    let query;
    let params = [name, username, password, id];
    let checkQuery;
    let checkParams = [username, id];

    if (type === 'admin') {
        checkQuery = `SELECT COUNT(*) as count FROM tbl_admins WHERE username = ? AND id != ?`;
        query = `UPDATE tbl_admins SET name = ?, username = ?, password = ?, role = ? WHERE id = ?`;
        params.splice(3, 0, role); 
    } else if (type === 'superadmin') {
        checkQuery = `SELECT COUNT(*) as count FROM tbl_superadmins WHERE username = ? AND superadminid != ?`;
        query = `UPDATE tbl_superadmins SET name = ?, username = ?, password = ?, role = ? WHERE superadminid = ?`;
        params.splice(3, 0, role);
    } else if (type === 'user') {
        checkQuery = `SELECT COUNT(*) as count FROM tbl_users WHERE username = ? AND userId != ?`;
        query = `UPDATE tbl_users SET name = ?, username = ?, password = ?, gender = ? WHERE userId = ?`;
        params.splice(3, 0, gender);
    } else {
        return res.status(400).json({ message: 'Invalid account type' });
    }

    conn.query(checkQuery, checkParams, (err, checkResult) => {
        if (err) {
            console.error('Error checking username:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (checkResult[0].count > 0) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        conn.query(query, params, (err, result) => {
            if (err) {
                console.error('Error updating account:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Account not found' });
            }

            res.status(200).json({ message: 'Account updated successfully' });
        });
    });
});

router.put('/archive-account/:type/:id', authenticateToken, authorizeRoles('superadmin'), (req, res) => {
    const { type, id } = req.params;
    let query;

    if (type === 'admin') {
        query = `UPDATE tbl_admins SET is_archived = 1 WHERE id = ?`;
    } else if (type === 'user') {
        query = `UPDATE tbl_users SET is_archived = 1 WHERE userId = ?`;
    } else {
        return res.status(400).json({ message: 'Invalid account type or account type not supported for archiving' });
    }

    conn.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error archiving account:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Account not found' });
        }

        res.status(200).json({ message: 'Account archived successfully' });
    });
});

router.post('/api/cashiers/add', authenticateToken, authorizeRoles('superadmin'), (req, res) => {
    const { name, username, password } = req.body;

    if (!name || !username || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    const role = 'admin';
    const query = `INSERT INTO tbl_admins (name, username, password, role) VALUES (?, ?, ?, ?)`;
    const values = [name, username, password, role];  

    conn.query(query, values, (err, results) => {
        if (err) {
            console.error('Error executing query:', err.stack);
            return res.status(500).json({ message: 'Internal server error' });
        }

        res.status(200).json({ message: 'Cashier added successfully' });
    });
});

router.get('/UserDetails', authenticateToken, (req, res) => {
    const userId = req.user.userId;

    const query = 'SELECT userId, name, gender, username, mobile_number, password FROM tbl_users WHERE userId = ? AND is_archived = 0';

    conn.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err.stack);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length > 0) {
            const { userId, name, gender, username, mobile_number, password } = results[0];
            return res.status(200).json({ message: 'User details fetched successfully', user: { userId, name, gender, username, mobile_number, password } });
        } else {
            return res.status(404).json({ message: 'User not found' });
        }
    });
});

router.put('/updateUserDetails', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const { username, name, password, number } = req.body;

    // Step 1: Check if the username already exists for another active user
    const checkUsernameQuery = 'SELECT userId FROM tbl_users WHERE username = ? AND is_archived = 0 AND userId != ?';

    conn.query(checkUsernameQuery, [username, userId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err.stack);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length > 0) {
            // If the username already exists, send an error
            return res.status(400).json({ message: 'Username already taken' });
        }

        // Step 2: Prepare the fields to be updated
        let updateFields = [];
        let updateValues = [];

        // Only update fields that are not empty and have changed
        if (username) {
            updateFields.push('username = ?');
            updateValues.push(username);
        }
        if (name) {
            updateFields.push('name = ?');
            updateValues.push(name);
        }
        if (password) {
            updateFields.push('password = ?');
            updateValues.push(password);
        }
        if (number) {
            updateFields.push('mobile_number = ?');
            updateValues.push(number);
        }

        // Step 3: If there are fields to update, perform the update
        if (updateFields.length > 0) {
            const updateQuery = `UPDATE tbl_users SET ${updateFields.join(', ')} WHERE userId = ? AND is_archived = 0`;
            updateValues.push(userId);  // Add the userId as the last value

            conn.query(updateQuery, updateValues, (err, result) => {
                if (err) {
                    console.error('Error executing update query:', err.stack);
                    return res.status(500).json({ message: 'Error updating user details' });
                }

                if (result.affectedRows > 0) {
                    return res.status(200).json({ message: 'User details updated successfully' });
                } else {
                    return res.status(400).json({ message: 'No changes detected or user not found' });
                }
            });
        } else {
            return res.status(400).json({ message: 'No fields to update' });
        }
    });
});


module.exports = router;