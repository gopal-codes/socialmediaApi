const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// register new user
router.post('/register', async(req,res)=>{
    try{
        // generate new hashed password using bcrypt..
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password,salt);

        // getting old users detail.
        const oldusers = User.findOne({email:req.body.email})
         // create new user..
        const newUser = await new User({
            username:req.body.username,
            email:req.body.email,
            password:hashedPassword
        });

        // save and respond...
        if(oldusers.email===req.body.email){
            res.status(200).json("Email already taken!!!");
        }else{
            const user = await newUser.save();
            res.status(200).json(user);
        }
    }catch(err){
        console.log(err);
    }
});

// LOGIN ...
router.post("/login",async (req,res)=>{
    try{
        const { email, password } = req.body;
        const user = await User.findOne({email:email});
        const validPassword =user && await bcrypt.compare(password,user.password);

        if (user) {
          if (validPassword) {
            res.status(200).json(user);
          } else {
            res.json({ message: "password didn't match" });
          }
        } else {
            res.json({ message: "User Not Register" });
          }
    }catch(err){
        res.status(500).json(err);
    }
});



module.exports = router;