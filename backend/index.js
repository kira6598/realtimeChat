require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const {Server} = require('socket.io')
const harperSaveMessage = require('./service/harper-save-message');
const harperGetMessage = require('./service/harper-get-message');
const leaveRoom = require('./service/utils/leave-room')


app.use(cors())
const server = http.createServer(app);


let chatRoom=''; //E.g. javascript, node,...   
let allUsers=[]; //All users in current chat room
const CHAT_BOT = 'ChatBot';


const io = new Server(server,{
    cors:{
        origin:'http://localhost:3000',
        methods:['GET','POST'],
    },
})

io.on('connection',(socket)=>{
    console.log(`User connected ${socket.id}`);    
    socket.on('join_room',(data)=>{
        const {username,room} =data;
        socket.join(room)// join user to socket room
        console.log(room);
        let createdtime = Date.now();
        socket.to(room).emit('receive_message',{
            message:`${username} has joined the chat room`,
            username:CHAT_BOT,
            createdtime,
        });
        socket.emit('receive_message',{
            message:`Wellcome ${username}`,
            createdtime,
        })
        chatRoom=room;
        allUsers.push({id:socket.id,username,room});
       const chatRoomUser=allUsers.filter((user)=>user.room===room);
        socket.to(room).emit('chatroom_users',chatRoomUser);
        socket.emit('chatroom_users',chatRoomUser)

        harperGetMessage(room).then((last100Msg) =>{
            socket.emit('last_100_msg',last100Msg);
        }).catch((error)=> console.log(error))

    })
    socket.on('send_message',(data)=>{
        const {message,username,room,createdtime}=data;
        console.log(data);
        io.in(room).emit('receive_message',data);
        harperSaveMessage(message,username,room,createdtime)
        .then((response)=>console.log(response))
        .catch((err)=>console.log(err))
    })

    socket.on('leave_room',(data)=>{
        const {username,room} = data;
        socket.leave(room);
        const createdTime = Date.now();
        // Remove usr from memory
        allUsers= leaveRoom(socket.id,allUsers);
        socket.to(room).emit('chatroom_users',allUsers);
        socket.to(room).emit('receive_message',{
            username:CHAT_BOT,
            message: `${username} has left the chat`,
            createdTime,
        });
        console.log(`${username} has left the chat`);
    })
    socket.on('disconnect',()=>{
        console.log("User disconnected from the chat");
        const user = allUsers.find((user)=>user.id===socket.id);
        if(user?.username){
            allUsers= leaveRoom(socket.id,allUsers);
            socket.to(chatRoom).emit('chatroom_users',allUsers);
            socket.to(chatRoom).emit('receive_message',{
                message:`${user.username} has disconnected from the chat.`
            })
        }
    })
})
server.listen(4000, ()=>'server is running on port 4000');