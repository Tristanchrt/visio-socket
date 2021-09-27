const app = require('express')();
var cors = require('cors');
const { captureRejectionSymbol } = require('events');
var corsOptions = {
    origin: ["*", "https://localhost:4200", "https://tresor.victordurand.fr", "https://rhumpa-loompa.fr"],
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions));
const http = require('http').Server(app);

const io = require("socket.io")(http, {
    cors: {
        origin: "*",//["*"],//["https://localhost:4200"],
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['polling']
});

let connectedUsers = {};

io.on("connection", socket => {

    socket.on("login", (user) => {
        console.log('Login : ', user)
        socket.id = user.id;
        addUser(user, socket);
        setup(user.id)
    });
    
    const setup = (idUser) => {

        userSocket[idUser.id].on("phone.calling", (userCalled, sessionDescription) => {
            console.log('Someone is calling');
            userSocket[userCalled].emit('phone.call', sessionDescription);
            setupRoom(idUser, userCalled)
        });

        userSocket[idUser.id].on("phone.answer", (userAnswer, answer) => {
            console.log('Annswer to phone');
            userSocket[userAnswer].emit('phone.answer', answer);
        });

        userSocket[idUser.id].on('phone.new-ice-candidate', (candidat) => {
            console.log('ice candidate sharing');
            // userSocket.emit('phone.new-ice-candidate', candidat);
        });

        userSocket[idUser.id].on('phone.negociating', sessionDescription => {
            // userSocket.emit('phone.negociating', sessionDescription);
        });

        userSocket[idUser.id].on('disconnect', (user) => {
            removeUser(user.id)
        });
        userSocket[idUser.id].on('connect_failed', () => {
            throw 'Connection Failed';
        });
    }

    // socket.on('user.disconnect', user => {
    //     console.log(`${username} has disconnected`);
    //     socket.to("admin").emit("admin.new.logs", `${username} has disconnected`);
    //     const index = getUserIndex(username);
    //     if (index !== -1)
    //         connectedUsers.splice(index, 1);
    //     socket.broadcast.emit('users.connected', connectedUsers);
    // });
});


const setupRoom = (idUser, userCalled) => {

}


const addUser = (user, socket) => {
    connectedUsers[user.id] = socket;
}

const removeUser = () => {
    delete connectedUsers[user.id];
}

const userSocket = (id) => {
    if (connectedUsers.indexOf(user)) {
        return connectedUsers[user];
    }
}

app.get("/connected_users", cors(corsOptions), (req, res) => {
    res.send(getActiveUsers());
})

http.listen(process.env.PORT || 3000, "0.0.0.0");