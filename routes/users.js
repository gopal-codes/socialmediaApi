const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");


//update user
router.put('/:id', async(req,res)=>{
    if(req.body.userId === req.params.id || req.body.isAdmin){
        if(req.body.password){
            try{
                const salt =await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password,salt);
            }catch(err){
                return res.status(500).json(err);
            }
        }
        try{
            const user = await User.findByIdAndUpdate(req.params.id,{
                $set : req.body,
            });
            res.status(200).json("Account has been updated");
        }catch(err){
            return res.status(500).json(err);
        }
    }else{
        return res.status(403).json("you can update only your account!");
    }
});

// delete user
router.delete('/:id', async(req,res)=>{
    if(req.body.userId === req.params.id || req.body.isAdmin){
        try{
            const user = await User.findByIdAndDelete(req.params.id);
            res.status(200).json("Account has been deleted");
        }catch(err){
            return res.status(500).json(err);
        }
    }else{
        return res.status(403).json("you can delete only your account!");
    }
});

// get a user by username
router.get("/all", async(req,res)=>{
    try{
        let name= req.query.qry;
        if(name!==""){
            const user = await User.find({})
            const users= user.filter((user)=>{
            return user.username.toLowerCase().startsWith(name.toLowerCase())
             })
            res.json(users)
        }
    }catch(err){
        res.json(err);
    }
});
// get a user by userId
router.get("/:id", async(req,res)=>{
    try{
        const user = await User.findById(req.params.id);
        res.status(200).json(user);
    }catch(err){
        res.status(500).json(err);
    }
});
// follow a user
router.put("/:id/follow",async (req,res)=>{
    if(req.body.userId !== req.params.id){
        try{
            // currentuser is person who is logined IN.And user is to whom we are going to follow 
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if(!user.followers.includes(req.body.userId)){
                await user.updateOne({$push:{followers:req.body.userId}});
                await currentUser.updateOne({$push:{followings:req.params.id}});
                res.status(200).json("user has been followed");
            }else{
                res.json("you already follow this user");
            }
        }catch(err){
            res.status(500).json(err);
        }
    } else{
        res.status(403).json("you cant follow yourself");
    }
});
// unfollow a user
router.put("/:id/unfollow",async (req,res)=>{
    if(req.body.userId !== req.params.id){
        try{
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if(user.followers.includes(req.body.userId)){
                await user.updateOne({$pull:{followers:req.body.userId}});
                await currentUser.updateOne({$pull:{followings:req.params.id}});
                res.status(200).json("user has been unfollowed");
            }else{
                res.json("you dont follow this user");
            }
        }catch(err){
            res.status(500).json(err);
        }
    } else{
        res.status(403).json("you can't unfollow yourself");
    }
});

// get friends detail...
router.get("/friends/:userId", async (req,res)=>{
   try {
    const user = await User.findById(req.params.userId);
    // const userFollowers = await Promise.all(
    //     user.followers.map((friendId)=>{
    //         return User.findById(friendId)
    //     })
    // );
    const userFollowings = await Promise.all(
        user.followings.map((friendId)=>{
            return User.findById(friendId)
        })
    );
   // const friends = userFollowers.concat(userFollowings);
    let friendList =[];
    userFollowings.map((friend)=>{
        const {_id,username,profilepicture} = friend;
        friendList.push({_id,username,profilepicture})
    });
    res.status(200).json(friendList);
   } catch (error) {
    res.send(error);
   }
})

module.exports = router;