import React from 'react'

const StartGame = ({Start,Players}) => {

    const HandleStart = () =>{
        if(Players.length <=1 ){
            alert("need at least 2 players")
            return;
        }

        Start();
    }
  return (
    <div>
        <span>StartGame</span>
        <button onClick={HandleStart}>Start</button>
    </div>
  )
}

export default StartGame