


const getRoom = (userid) => {
    return [];
}

const createRoom = (userid) => {
    
}
const isRoomExists = (userid) => {
    let isExist = true;
    return isExist;
}


return await fetch("localhost:8080/public/api/", {
        "method": "POST",
        "mode": "cors"
    }).then(res => Promise.all([res.status, res.json()]))
        .then(([status, jsonData]) => {
            access_token = jsonData.access_token;
            console.log(access_token)
        }).catch(e => console.log(e));