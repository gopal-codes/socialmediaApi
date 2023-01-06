const router = require("express").Router();
const Conversation = require("../models/Conversation");


//add new conversation of user while following other user.
router.post("/", async (req, res) => {
  const oldConversation = await Conversation.findOne({
    members: 
    { $all:[req.body.senderId, req.body.receiverId]} || 
    { $all:[req.body.receiverId, req.body.senderId]}
  });
  try {
     if(!oldConversation)
     {
    const newConversation = new Conversation({
      members: [req.body.senderId, req.body.receiverId],
    });
    const savedConversation = await newConversation.save();
    res.status(200).json(savedConversation);
    }else{res.status(200).json("old conversation exist.")}
  } catch (err) {
    res.status(500).json(err);
  }
});
  
  //get conv of a user
  
  router.get("/:userId", async (req, res) => {
    try {
      const conversation = await Conversation.find({
        members: { $in: [req.params.userId] },
      });
      res.status(200).json(conversation);
    } catch (err) {
      res.status(500).json(err);
    }
  });

  // get conv that includes two userId

  router.get("/find/:firstUserId/:secondUserId",async(req,res)=>{
    try {
      const conversation = await Conversation.findOne({
        members: { $all:[req.params.firstUserId, req.params.secondUserId]}
      });
      res.status(200).json(conversation);
    } catch (error) {
      console.log(error)
    }
  })

  // delete conversation between user and user's frd when unfollowed.
  router.delete("/deleteConversation/:firstUserId/:secondUserId",async(req,res)=>{
    try {
      const conversation = await Conversation.findOneAndDelete({
        members: 
        { $all:[req.params.firstUserId, req.params.secondUserId]} || 
        { $all:[req.params.secondUserId, req.params.firstUserId]}
      });
      if(conversation)
      {res.status(200).json("conversation deleted.");}
      else{res.status(200).json("conversation don't exist");}

    } catch (error) {
      console.log(error)
    }
  })
  
module.exports = router;