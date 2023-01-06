module.exports=(io)=>{
    
// making users array for online users.
let users= [];

const addUser = (userId,socketId)=>{
    !users.some(user =>user.userId ===userId) &&
    users.push({userId,socketId});
}

// when someone disconnect.
const removeUser = (socketId)=>{
    users = users.filter(user=>user.socketId !==socketId)
}

const findReceiver = (userId)=>{
    return users.find((user)=>user.userId === userId);
}

io.on("connection", (socket)=>{
    // when user is connected.
    console.log("a user connected");
    // take userId and socketId from user.
    socket.on("addUser", userId=>{
        addUser(userId,socket.id);
        io.emit("getUsers", users);
    })

    // send and get message
    socket.on("sendMessage",({senderId,receiverId,text})=>{
        const receiver = findReceiver(receiverId);
        io.to(receiver?.socketId).emit("getMessage",{
            senderId,
            text
        })
    })

    // this event is called automatically when user disconnect.
    socket.on("disconnect", ()=>{
        console.log("a user disconnected")
        removeUser(socket.id);
        io.emit("getUsers", users);

    })
})
}