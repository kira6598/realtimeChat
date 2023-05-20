import { useState } from "react"


const SendMessage = ({socket,username,room}) =>{
    const [message,setMessages]=useState('');
    const sendMessage = ()=>{
        if(message!==''){
           
            const createdtime = Date.now();
            socket.emit('send_message',{username,room,message,createdtime})
            setMessages('');
        }
    };
    
    return (
        <div className="{style.sendMessageContainer}">
            <input
            className="{style.messageInput}"
            placeholder="Message..."
            onChange={(e)=>setMessages(e.target.value)}
            value={message}
            />
            <button className="btn btn-primary" onClick={sendMessage}>
            Send Message
            </button>
        </div>
    ) ;
    
}
export default SendMessage