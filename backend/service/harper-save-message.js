
var axios = require('axios')

function harperSaveMessage(message,username,room){
    const dbUrl= process.env.HARPERDB_URL;
    const dbUser = process.env.HARPERDB_USERNAME
    const dbPw = process.env.HARPERDB_PW;
    if(!dbUrl ||!dbPw) return null;

    var data = JSON.stringify({
        operation:'insert',
        schema:'realtime_chat_app',
        table:'message',
        records:[
            {message,username,room}
        ]
    })
    var config ={
        method:'post',
        url:dbUrl,
        headers:{
            'Content-Type':'application/json',            
        },
        auth:{
            username:dbUser,
            password:dbPw
        },
        data:data
    }
    return new Promise((resolve,reject)=>{
        axios(config).then((response)=>{
            resolve(JSON.stringify(response.data))
        })
        .catch((err)=>reject(err))
    })
}
module.exports = harperSaveMessage;