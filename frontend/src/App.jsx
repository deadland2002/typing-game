import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { socket } from "./socket";
import {BrowserRouter , Routes , Route} from "react-router-dom"
import { Home  , Singleplayer , Multiplayer , JoinGame} from "../pages";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/singlePlayer" element={<Singleplayer />} />
          <Route path="/multiPlayer" element={<Multiplayer />} />
          <Route path="/multiplayer/join/:ID" element={<JoinGame />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
