const express = require("express");
const conn = require("../db/conn");
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


// img storage confing
var imgconfig = multer.diskStorage({
    destination:(req,file,callback)=>{
        callback(null,"./uploads");
    },
    filename:(req,file,callback)=>{
        callback(null,`image-${Date.now()}.${file.originalname}`)
    }
});


// img filter
const isImage = (req,file,callback)=>{
    if(file.mimetype.startsWith("image")){
        callback(null,true)
    }else{
        callback(null,Error("only image is allowed"))
    }
}

var upload = multer({
    storage:imgconfig,
    fileFilter:isImage
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

        conn.query("INSERT INTO tbl_items SET ?", {itemname: fname, img: filename, date: date, quantity: quantity, price:price}, (err, result) => {
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

    conn.query(
        'INSERT INTO tbl_cart (userId, id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?',
        [userId, itemId, quantity, quantity],
        (error, results, fields) => {
            if (error) {
                console.error(error);
                res.status(500).json({ status: 'error', message: 'Internal server error' });
            } else {
                res.status(201).json({ status: 'success', message: 'Item added to cart' });
                console.log("added to tbl_cart");
            }
        }
    );
});

//cart, customer role
router.get('/cart', authenticateToken, authorizeRoles('customer'), (req, res) => {
  const userId = req.user.userId;

  conn.query(
      'SELECT tbl_items.itemname, tbl_cart.quantity FROM tbl_cart JOIN tbl_items ON tbl_cart.id = tbl_items.id WHERE tbl_cart.userId = ?',
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