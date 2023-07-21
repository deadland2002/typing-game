const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require("cors");


const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Specify the allowed origin
    methods: ["GET", "POST"], // Specify the allowed HTTP methods
    allowedHeaders: ["Access-Control-Allow-Origin"], // Specify the allowed headers
    credentials: true, // Enable CORS credentials
  },
});


app.use(cors());
app.use(express.static("../client/dist"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.get("/", (req, res) => {
  res.send("hi");
});

var rooms = {}
var directory = {}

function HandleJoinRoom(SocketId , RoomId , Name){
  directory[SocketId] = {
    room : RoomId,
    name : Name
  }

  if(rooms[RoomId]){
    rooms[RoomId][SocketId] = {
      Name : Name,
      Points : 0
    }
  }else{
    rooms[RoomId] = {
      [SocketId] : {
        Name : Name ,
        Points : 0
      }
    }
  }

}


io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("join room",async (args)=>{
    HandleJoinRoom(socket.id , args[0] , args[1])
    socket.join("room_"+args[0])

    let player_list = structuredClone(rooms[args[0]]);
    // delete player_list[socket.id]
    
    
    io.to("room_"+args[0]).emit("player_list",player_list);
    
    console.log(rooms)
  })

  socket.on("disconnect", () => {
    if(directory[socket.id] && rooms[directory[socket.id].room]){

      delete rooms[directory[socket.id].room][socket.id]
    }
   
    console.log("a user disconnected",directory[socket.id]);
    socket.leave("room_"+directory[socket.id]?.room)

    let player_list = structuredClone(rooms[directory[socket.id]?.room]);

    io.to("room_"+directory[socket.id]?.room).emit("player_list",player_list);

    console.log(player_list)
    
    delete directory[socket.id]
  });


  socket.on("Start Game",(args)=>{
    console.log("pinged backend start")
    console.log(directory[socket.id].room)
      io.to("room_"+directory[socket.id].room).emit("begin game")
  })
  
  
  
  socket.on("Game Over",(args)=>{
    console.log("pinged backend over")
    let room_id = directory[socket.id].room;
    let player_list = structuredClone(rooms[room_id]);
      io.to("room_"+directory[socket.id].room).emit("game end",player_list)
  })
  
  
  
  
  socket.on("correct answers",(score)=>{
    console.log("pinged backend score")
    let room_id = directory[socket.id].room;
    rooms[room_id][socket.id].Points = score;
    let player_list = structuredClone(rooms[room_id]);
    
    console.log(player_list);
    
    io.to("room_"+room_id).emit("player_list",player_list);
  })
});



server.listen(3000, () => {
  console.log("listening on *:3000");
});
