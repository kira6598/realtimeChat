import styles from './styles.module.css';
import { useState, useEffect, useRef } from 'react';

const Messages = ({ socket }) => {
  const [messagesRecieved, setMessagesReceived] = useState([]);
  const messagesColumnRef = useRef(null);
  // Runs whenever a socket event is recieved from the server
  useEffect(() => {
    socket.on('receive_message', (data) => {
      console.log(data);
      setMessagesReceived((state) => [
        ...state,
        {
          message: data.message,
          username: data.username,
          __createdtime__: data.createdtime,
        },
      ]);

    });
    	// Remove event listener on component unmount
      return () => socket.off('receive_message');
    }, [socket]);

    useEffect(()=>{
      socket.on('last_100_msg',(last100msg)=>{
        console.log('Last 100 msg: ',JSON.parse(last100msg));
        last100msg=JSON.parse(last100msg);
        //sort
        last100msg = sortMessagesByDate(last100msg);
        setMessagesReceived((state)=> [...last100msg,...state]);
      })
      return ()=>socket.off('last_100_msg')
    },[socket])
    
    function sortMessagesByDate(messages) {
    return messages.sort(
      (a, b) => parseInt(a.__createdtime__) - parseInt(b.__createdtime__)
    );
  }  

  useEffect(()=>{
    const handleUnload =()=>{
      if(messagesRecieved.length===0) return;
       sessionStorage.setItem("storedMsg",JSON.stringify(messagesRecieved));
    }
    const handleOnLoad = () =>{
      const Data = JSON.parse (sessionStorage.getItem("storedMsg"))
      console.log(Data);
      setMessagesReceived(Data);
    }
     window.addEventListener("beforeunload",handleUnload)
     window.addEventListener("load",handleOnLoad)
     return ()=> {
      window.removeEventListener("beforeunload",handleUnload);
      window.removeEventListener("onload",handleOnLoad)
     }; 

},[messagesRecieved])

  useEffect(()=>{
    messagesColumnRef.current.scrollTop =
    messagesColumnRef.current.scrollHeight;

  },[messagesRecieved])

  // dd/mm/yyyy, hh:mm:ss
  function formatDateFromTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  return (
    <div className={styles.messagesColumn} ref={messagesColumnRef} >
      {messagesRecieved.map((msg, i) => (
        <div className={styles.message} key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className={styles.msgMeta}>{msg.username}</span>
            <span className={styles.msgMeta}>
              {formatDateFromTimestamp(msg.__createdtime__)}
            </span>
          </div>
          <p className={styles.msgText}>{msg.message}</p>
          <br />
        </div>
      ))}
    </div>
  );
};

export default Messages;