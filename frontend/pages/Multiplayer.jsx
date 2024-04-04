import React, { useEffect, useState } from "react";
import { socket } from "../src/socket";
import {useNavigate} from "react-router-dom"
import {root} from "postcss";

const Multiplayer = () => {
  const navigate = useNavigate();

  const HandleCreate = async () => {
    const charset =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomString  = "";
    let length = 10;
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      randomString += charset[randomIndex];
    }

    let name = prompt("Name : ");

    randomString = prompt("Room ID : ")

    if(name === null || randomString === null || name==="" || randomString==="" || name === undefined || randomString === undefined){
      alert("values cannot be null");
      return
    }

    await socket.connect()
    await socket.emit("room create", {roomId:randomString,name:name});
    navigate("/multiplayer/join/"+randomString+":"+name);
  };
  
  const HandleJoin = async () =>{
      let roomId = prompt("RoomId : ");
      let name = prompt("Name : ");

      if(name === null || roomId === null || name==="" || roomId==="" || name === undefined || roomId === undefined){
        alert("values cannot be null");
        return
      }
      navigate("/multiplayer/join/"+roomId+":"+name);
  }


  return (
    <>
      <title>Multi Player</title>
      <div className="Multi_Player">
        <span className="title">Multi Player </span>

        <div className="room_options">
          <div>
            <button onClick={()=>{HandleJoin()}}>Join Room</button>
          </div>
          <div>
            <button onClick={()=>{HandleCreate()}}>Create Room</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Multiplayer;
