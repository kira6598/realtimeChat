
let axios = require('axios');
const { response } = require('express');

function harperGetMessage (room){
    const dbUrl = process.env.HARPERDB_URL;
    const dbUser = process.env.HARPERDB_USERNAME
    const dbPw = process.env.HARPERDB_PW;
    if (!dbUrl || !dbPw) return null;

    let data = JSON.stringify({
        operation:'sql',
        sql: `SELECT * FROM realtime_chat_app.message where room = "${room}"`
    });
    
    let config ={
        method : 'post',
        url:dbUrl,
        headers :{
            'Content-Type':'application/json',
            // Authorization: dbPw,
        },
        auth:{
            username:dbUser,
            password:dbPw
        },
        data:data
    };
    return new Promise((resolve,reject)=>{
        axios(config).then((response)=> resolve(JSON.stringify(response.data)))
        .catch((err)=>reject(err))
    })
}
module.exports= harperGetMessage;