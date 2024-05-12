const express = require("express");
const router = new express.Router();
const conn = require("../db/conn");
const multer = require("multer");
const moment = require("moment");
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/LoginForm', (req, res) => {
    const { username, password } = req.body;
  
    // check if the username and password match a user in the database
  
    const query = `SELECT * FROM tbl_admins WHERE username = ? AND password = ?`;
    conn.query(query, [username, password], (err, results) => {
      if (err) {
        console.error('Error executing query:', err.stack);
        return res.status(500).json({ message: 'Internal server error' });
      }
  
      if (results.length > 0) {
        // Successful login
        res.status(200).json({ message: 'Login successful' });
      } else {
        // Login error
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
        callback(null,Error("only image is allowd"))
    }
}

var upload = multer({
    storage:imgconfig,
    fileFilter:isImage
})



// register userdata
router.post("/additem",upload.single("photo"),(req,res)=>{
    const {fname} = req.body;
    const {filename} = req.file;

  
    if(!fname || !filename){
        res.status(422).json({status:422,message:"fill all the details"})
    }
    
    try {
        
        let date = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");
        
        conn.query("INSERT INTO usersdata SET ?",{username:fname,userimg:filename,date:date},(err,result)=>{
            if(err){
                console.log("error")
            }else{
                console.log("data added")
                res.status(201).json({status:201,data:req.body})
            }
        })
    } catch (error) {
        res.status(422).json({status:422,error})
    }
});


// get user data
router.get("/getdata",(req,res)=>{
    try {
        conn.query("SELECT * FROM usersdata",(err,result)=>{
            if(err){
                console.log("error")
            }else{
                console.log("data get")
                res.status(201).json({status:201,data:result})
            }
        })
    } catch (error) {
        res.status(422).json({status:422,error})
    }
});


// delete user
router.delete("/:id",(req,res)=>{
    const {id} = req.params;
   try {
    conn.query(`DELETE FROM usersdata WHERE id ='${id}'`,(err,result)=>{
        if(err){
            console.log("error")
        }else{
            console.log("data delete")
            res.status(201).json({status:201,data:result})
        }
    })
   } catch (error) {
    res.status(422).json({status:422,error})
   }
})



module.exports = router;

const PORT = process.env.PORT || 3000 ;

app.listen(PORT, () => {
  console.log(`The server has started on port ${PORT}`);
});