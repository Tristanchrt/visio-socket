const app = require('express')();
var cors = require('cors');
var corsOptions = {
    origin: ["*","https://localhost:4200", "https://tresor.victordurand.fr", "https://rhumpa-loompa.fr"],
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


let connectedUsers = [];


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
    socket.on('phone.negociating', sessionDescription => {
        socket.broadcast.emit('phone.negociating', sessionDescription);
    })



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





http.listen(process.env.PORT || 3000, "0.0.0.0");