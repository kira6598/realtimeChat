import styles from './styles.module.css'
import { useState,useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const RoomANdUsers = ({socket,username,room}) =>{
    const [roomUser,setRoomUsers] = useState([]);
    const navigate = useNavigate();
    useEffect(()=>{
        socket.on('chatroom_users',(data) =>{
            console.log(data);
            setRoomUsers(data);
        })
        return ()=>socket.off('chatroom_users');
    },[socket]);  

    useEffect(()=>{
        const handleUnload =()=>{
            if(roomUser.length===0) return
           sessionStorage.setItem("storedRoom",JSON.stringify(roomUser));
        }

        const handleOnLoad = ()=>{
            const Data = JSON.parse (sessionStorage.getItem("storedRoom"))
            console.log(Data);
            setRoomUsers(Data);
        }
         window.addEventListener("beforeunload",handleUnload)
         window.addEventListener("load",handleOnLoad)
         return ()=> {
            window.removeEventListener("beforeunload",handleUnload);
            window.removeEventListener("load",handleOnLoad)
         }; 
    },[roomUser])
    const leaveRoom =()=>{
        const createdTime = Date.now();
        socket.emit('leave_room',{username,room,createdTime})
        //Redirect to home page
        navigate('/',{replace:true});
    };
    return (
        <div className={styles.roomAndUsersColumn}>
            <h2 className={styles.roomTitle}>{room}</h2>
            <div>
                {roomUser.length > 0 && <h5 className={styles.usersTitle}>Users: </h5>}
                <ul className={styles.usersList}>
                    {roomUser.map((user)=>(
                        <li
                        style={{
                            fontWeight : `${user.username === username ? 'bold': 'normal'}`,
                        }}
                        key={user.id}
                        >
                            {user.username}
                        </li>
                    ) )}
                </ul>
            </div>

            <button className='btn btn-outline' onClick={leaveRoom}>
                Leave
            </button>
        </div>
    )
}
export default RoomANdUsers;