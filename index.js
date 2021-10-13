const app = require('express')();
var cors = require('cors');
const { captureRejectionSymbol } = require('events');
var corsOptions = {
    origin: ["*", "http://localhost:4200", "http://tresor.victordurand.fr", "http://rhumpa-loompa.fr", "http://192.168.43.205:4200"],
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions));
const http = require('http').Server(app);

const io = require("socket.io")(http, {
    cors: {
        origin: ["http://192.168.43.205:4200", "http://localhost:4200"],
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['polling']
});

console.log("Start server");

let usersId = [];

io.on("connection", socket => {

    socket.on("login", (user) => {
        if(user){
            console.log('CONNECTION USER : ', user);

            if(!usersId.includes(user.id))
                usersId.push(user.id);
            
            user.rooms.forEach(room => {
                socket.join(room.id);
            });

            console.log(usersId);
            socket.broadcast.emit('new.user', user.id);
            socketEvent(socket, user.id);
        }else{
            console.log("No user...");
        }
    });
});


const socketEvent = (socket, idUser) => {

    socket.on("phone.calling", (sessionDescription, video, users_ids) => {
        console.log('Someone is calling : '+ users_ids);
        if(users_ids){
            users_ids = users_ids.filter(ele => ele.id != idUser);
            users_ids.forEach(id => {
                socket.emit('phone.call', sessionDescription, video);
            });
        }else{
            console.log('No user_ids');
        }
    });

    socket.on("phone.answer", (roomId, answer) => {
        console.log('Answer to phone');
    });

    socket.on('message.new', (obj) => {
        console.log('New message', obj);
        socket.to(obj.room_id).emit('message.send', obj);
    });

    socket.on('phone.new-ice-candidate', (candidat) => {
        console.log('ice candidate sharing');
        // connectedUsers.emit('phone.new-ice-candidate', candidat);
    });

    socket.on('phone.negociating', sessionDescription => {
        // connectedUsers.emit('phone.negociating', sessionDescription);
    });

    socket.on('disconnect', (user) => {
        usersId.splice(usersId.indexOf(user.id), 1);
    });

    socket.on('connect_failed', () => {
        throw 'Connection Failed';
    });
}


app.get("/connected_users", cors(corsOptions), (req, res) => {
    res.send(getActiveUsers());
})

http.listen(process.env.PORT || 3000, "0.0.0.0");