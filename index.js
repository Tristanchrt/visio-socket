const app = require('express')();
const { equal } = require('assert');
var cors = require('cors');
const http = require('http').Server(app);
//const io = require('socket.io')(http, { origins: ['http://localhost:4200', "*:*"], transports: ['polling', 'flashsocket'] });
var corsOptions = {
    origin: ["https://localhost:4200", "https://tresor.victordurand.fr", "https://rhumpa-loompa.fr"],
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const io = require("socket.io")(http, {
    cors: {
        origin: ["https://localhost:4200"],
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['polling']
});


let connectedUsers = [];

let winners = [];

io.on("connection", socket => {
    socket.on("phone.calling", (sessionDescription) => {
        console.log('Someone is calling');
        socket.broadcast.emit('phone.call', sessionDescription);
    });

    socket.on("phone.answer", (answer) => {
        console.log('Annswer to phone');
        socket.broadcast.emit('phone.answer', answer);
    });

    socket.on('phone.new-ice-candidate', (candidat) => {
        console.log('ice candidate sharing');
        socket.broadcast.emit('phone.new-ice-candidate', candidat);
    })
    // socket.on('user.login', username => {
    //     if (userExists(username)) {
    //         console.warn(`User ${username} already connected`);
    //     } else {
           
    //     }
    //     socket.emit('users.list.updated', connectedUsers);
    //     socket.broadcast.emit('users.list.updated', connectedUsers);
    //     socket.once('disconnect', reason => {
    //         console.log(`${username} has disconnected`);
    //         //remove user from connected list
    //     });
    // });



    // socket.on('user.disconnect', user => {
    //     console.log(`${username} has disconnected`);
    //     socket.to("admin").emit("admin.new.logs", `${username} has disconnected`);
    //     const index = getUserIndex(username);
    //     if (index !== -1)
    //         connectedUsers.splice(index, 1);
    //     socket.broadcast.emit('users.connected', connectedUsers);
    // });

    

});


app.get("/connected_users", cors(corsOptions), (req, res) => {
    res.send(getActiveUsers());
})





http.listen(process.env.PORT || 3000);