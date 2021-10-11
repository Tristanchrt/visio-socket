const app = require('express')();
var cors = require('cors');
const { captureRejectionSymbol } = require('events');
var corsOptions = {
    origin: ["*", "http://localhost:4200", "http://tresor.victordurand.fr", "http://rhumpa-loompa.fr"],
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions));
const http = require('http').Server(app);

const io = require("socket.io")(http, {
    cors: {
        origin: ["http://localhost:4200"],
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['polling']
});

console.log("Start server");

let connectedUsers = {};
let usersId = [];

io.on("connection", socket => {

    socket.on("login", (user) => {
        if(user){
            console.log('CONNECTION USER : ', user);
            socket.id = user.id;
            connectedUsers[user.id] = socket;
            if(!usersId.includes(user.id))
                usersId.push(user.id);
            
            // user.roomIds.forEach(room => {
            //     connectedUsers[idUser].join(room);
            // });
            
            connected(user);
            console.log('usersId.length : ', usersId.length, 'connectedUsers.length', connectedUsers.length);
            setup(user.id);
        }else{
            console.log("No user...");
        }
    });
});

const connected = (user) => {
    connectedUsers[user.id].broadcast.emit('new.user', usersId);
}

const setup = (idUser) => {

    connectedUsers[idUser].on("phone.calling", (sessionDescription, video, users_ids) => {
        console.log('Someone is calling : '+ users_ids);
        users_ids = users_ids.filter(ele => ele.id != idUser);
        users_ids.forEach(id => {
            connectedUsers[id].emit('phone.call', sessionDescription, video);
        });
    });

    connectedUsers[idUser].on("phone.answer", (roomId, answer) => {
        console.log('Answer to phone');
        let room = getRoom(roomId);
        room.users.forEach(id => {
            connectedUsers[use].emit('phone.answer', answer);
        });
    });

    connectedUsers[idUser].on('message.new', (message, type, roomId) => {
        console.log('New message', users_ids);
        io.to(roomId).emit('message.send', { message, type });
    });

    connectedUsers[idUser].on('phone.new-ice-candidate', (candidat) => {
        console.log('ice candidate sharing');
        // connectedUsers.emit('phone.new-ice-candidate', candidat);
    });

    connectedUsers[idUser].on('phone.negociating', sessionDescription => {
        // connectedUsers.emit('phone.negociating', sessionDescription);
    });

    connectedUsers[idUser].on('disconnect', (user) => {
        removeUser(user.id);
        usersId.splice(usersId.indexOf(user.id), 1);
    });

    connectedUsers[idUser].on('connect_failed', () => {
        throw 'Connection Failed';
    });
}

const removeUser = (user) => {
    delete connectedUsers[user];
}

app.get("/connected_users", cors(corsOptions), (req, res) => {
    res.send(getActiveUsers());
})

http.listen(process.env.PORT || 3000, "0.0.0.0");