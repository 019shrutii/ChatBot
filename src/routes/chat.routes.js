const express=require('express');
const router=express.Router();
const chatController=require('../controllers/chat.controllers');

router.post('/send',chatController.sendMessage);
router.get('/thread/:threadId',chatController.getMessages);

module.exports=router;
