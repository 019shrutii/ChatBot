const Chat=require('../models/Chat');
const Thread=require('../models/Thread');
const asyncHandler=require('../utils/asyncHandler');
const {getIO, onlineUsers}=require('../socket/socket');

exports.sendMessage=asyncHandler(async(req,res)=>{
    const {sender,receiver,message}=req.body;

    if (!sender || !receiver || !message) 
        return res.status(400).json({message:'All fields are required'});

    //find or create thread
    let thread=await Thread.findOne({
        participants:{$all:[sender,receiver]}});

    if (!thread) {
        thread=await Thread.create({participants:[sender,receiver]});
    }

    //create chat
    const chat=await Chat.create({
        sender,
        receiver,
        message,
        thread:thread._id
    });
    
    //update thread
    thread.lastMessage=message;
    thread.lastMessageTime=new Date();
    await thread.save();

    //realtime emit
const receiverSocketId=onlineUsers.get(receiver);
    if (receiverSocketId) {
        getIO().to(receiverSocketId).emit('newMessage',chat);
    }
    res.status(201).json({message:'Message sent',chat});
});
//get messages by thread
exports.getMessages=asyncHandler(async(req,res)=>{
    const {threadId}=req.params;
    const {page=1,limit=20}=req.query;
    const messages=await Chat.find({thread:threadId})
    .sort({createdAt:-1})
    .skip((page-1)*limit)
    .limit(parseInt(limit));
    res.json({messages});
});

