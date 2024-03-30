const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require("cors");


const io = new Server(server, {
  cors: {
    origin: "*", // Specify the allowed origin
    methods: ["GET", "POST"], // Specify the allowed HTTP methods
    allowedHeaders: ["Access-Control-Allow-Origin"], // Specify the allowed headers
    credentials: true, // Enable CORS credentials
  },
});


app.use(cors());
app.use(express.static("../frontend/dist"));
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

  if(rooms[RoomId] && rooms[RoomId].Players){
    const adminSocket = Object.keys(rooms[RoomId].Admin)[0];
    console.log('replace data ',adminSocket , SocketId)

    rooms[RoomId].Players[SocketId] = {
      Name : adminSocket === SocketId ? `${Name}(ADMIN)` : Name.replaceAll("(ADMIN)","") ,
      Points : 0
    }
  }else{
    rooms[RoomId]={
      Players:{
        [SocketId] : {
          Name : `${Name}(ADMIN)` ,
          Points : 0
        }
      },
      Admin:{
        [SocketId] : {
          Name : Name ,
        }
      }
    }
  }

}





function HandleCreateRoom(SocketId , RoomId , Name){
  directory[SocketId] = {
    room : RoomId,
    name : Name
  }

  rooms[RoomId] = {
    Admin:{
      [SocketId] : {
        Name : Name ,
      }
    }
  }

}


io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("join room",async (args)=>{
    HandleJoinRoom(socket.id , args[0] , args[1])
    socket.join("room_"+args[0])

    let player_list = structuredClone(rooms[args[0]].Players);
    // delete player_list[socket.id]
    
    
    io.to("room_"+args[0]).emit("player_list",player_list);
    
    console.log("rooms",JSON.stringify(rooms))
  })



  socket.on("room create",async (args)=>{
    const {roomId,name} = args;
    HandleCreateRoom(socket.id , roomId , name)
    console.log("room-create",args)
  })



  socket.on("get User",async ()=>{
    const roomId = directory[socket.id].room;

    console.log(rooms[directory[socket.id].room].Players)

    const name = rooms[directory[socket.id].room].Players[socket.id].Name

    socket.emit("receive user",name)

    console.log("get User",roomId,name)
  })

  socket.on("disconnect", () => {
    if(directory[socket.id] && rooms[directory[socket.id].room]){
      delete rooms[directory[socket.id].room].Players[socket.id]
    }

    const roomId = directory[socket.id].room;

    console.log("a user disconnected");
    console.log(directory[socket.id]);
    console.log(rooms[roomId].Players);

    socket.leave("room_"+roomId)

    let player_list = structuredClone(rooms[roomId].Players);

    io.to("room_"+roomId).emit("player_list",player_list);

    console.log(player_list)
    
    delete directory[socket.id]
  });


  socket.on("Start Game",(args)=>{
    console.log("pinged backend start")
    console.log(directory[socket.id].room)

    const roomId = directory[socket.id].room;
    const AdminSocket = Object.keys(rooms[roomId].Admin)[0]
    // if(socket.id === )

    console.log("Start Game",rooms[roomId])
    if(socket.id !== AdminSocket){
      return;
    }

    let max = 14;
    let randomNumber;
    const random = Math.random();
    const scaledRandom = random * (max - 0 + 1);
    randomNumber = Math.floor(scaledRandom) + 0;

    io.to("room_"+directory[socket.id].room).emit("begin game",randomNumber)
  })
  
  
  
  socket.on("Game Over",(args)=>{
    console.log("pinged backend over")
    let room_id = directory[socket.id].room;
    let player_list = structuredClone(rooms[room_id].Players);
      io.to("room_"+directory[socket.id].room).emit("game end",player_list)
  })
  
  
  
  
  socket.on("correct answers",(score)=>{
    console.log("pinged backend score")
    let room_id = directory[socket.id].room;
    rooms[room_id].Players[socket.id].Points = score;
    let player_list = structuredClone(rooms[room_id].Players);
    let admin = structuredClone(rooms[room_id].Admin);

    console.log("correct answers",player_list);
    
    io.to("room_"+room_id).emit("player_list",player_list);
    io.to("room_"+room_id).emit("admin",admin);

  })
});






app.get("/",(req,res)=>{
  res.sendFile(__dirname+"../frontend/dist") ;
})



server.listen(3000, "0.0.0.0",() => {
  console.log("listening on *:3000");
});
