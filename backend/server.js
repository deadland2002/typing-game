const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require("cors");
const os = require('os');
const dotenv = require("dotenv")


dotenv.config();

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
  res.sendFile("../frontend/dist/index.html");
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
      Name : adminSocket === SocketId ? `${Name} (ADMIN)` : Name.replaceAll("(ADMIN)","") ,
      Points : 0
    }
  }else{
    rooms[RoomId]={
      Players:{
        [SocketId] : {
          Name : `${Name} (ADMIN)` ,
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


try{
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
      if(rooms[roomId]){
        HandleJoinRoom(socket.id , roomId , name)
        return
      }

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
      console.log("a user disconnected");

      if(directory[socket.id] && rooms[directory[socket.id].room]){
        delete rooms[directory[socket.id].room].Players[socket.id]
      }

      if(directory[socket.id]){
        const roomId = directory[socket.id].room;
        socket.leave("room_"+roomId)
        let player_list = structuredClone(rooms[roomId].Players);
        io.to("room_"+roomId).emit("player_list",player_list);
        console.log(player_list)
        delete directory[socket.id]
      }else{
        console.log("socket not found in directory")
      }
    });


    socket.on("Start Game",(time)=>{
      if(!directory[socket.id])
        return;

      console.log("pinged backend start")
      console.log(directory[socket.id].room)

      const roomId = directory[socket.id].room;
      const AdminSocket = Object.keys(rooms[roomId].Admin)[0]
      // if(socket.id === )

      console.log("Start Game",rooms[roomId])
      if(socket.id !== AdminSocket){
        return;
      }

      let totalPara = 6;
      let randomQuestionIndex = Math.min(Math.floor(Math.random() * totalPara) , totalPara - 1);

      // console.log(rooms[roomId].Players)

      for(let key of Object.keys(rooms[roomId].Players))
        rooms[roomId].Players[key].Points = 0;

      io.to("room_"+directory[socket.id].room).emit("begin game",randomQuestionIndex,time)
    })



    socket.on("Game Over",(args)=>{
      if(!directory[socket.id])
        return;
      console.log("pinged backend over")
      let room_id = directory[socket.id].room;
      let player_list = structuredClone(rooms[room_id].Players);
      io.to("room_"+directory[socket.id].room).emit("game end",player_list)
    })




    socket.on("correct answers",(score)=>{
      if(!directory[socket.id])
        return;
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
}catch (e){
  console.log(JSON.stringify(e));
}






app.get("/",(req,res)=>{
  res.sendFile(__dirname+"../frontend/dist") ;
})




// Get the local IP address of the system
const networkInterfaces = os.networkInterfaces();
let ipAddress = '';
Object.keys(networkInterfaces).forEach(interfaceName => {
  networkInterfaces[interfaceName].forEach(networkInterface => {
    if (networkInterface.family === 'IPv4' && !networkInterface.internal) {
      ipAddress = networkInterface.address;
    }
  });
});


const PORT = process.env.PORT || 80;
server.listen(PORT, "0.0.0.0",() => {
  console.log("server listening on");
  console.log(`http://${ipAddress}:${PORT}`);
});
