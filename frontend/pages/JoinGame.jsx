import React, { useEffect, useMemo, useReducer, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../src/socket";
import Paragraph from "../data/Paragraph.json";
import PropTypes from "prop-types";









const StartGame = ({Start,Players}) => {

  useEffect(() => {
    socket.on("begin game",()=>{
      Start();
    })
  }, [Start]);

  const HandleStart = () =>{
      socket.emit("Start Game");
  }
return (
  <div className="Start_Game">
      <span>StartGame :</span>
      <button onClick={HandleStart}>Start</button>
  </div>
)
}












const CountDown = ({ setCompleted }) => {
  const [intervalState, setIntervalState] = useState();
  const [timer, setTimer] = useState(10);
  const [start, setStart] = useState(false);

  useMemo(() => {
    let id = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    setIntervalState(id);

    return () => {
      clearInterval(intervalState);
    };
  }, []);

  useEffect(() => {
    if (timer <= 0) {
      clearInterval(intervalState);
      setCompleted();
    }
  }, [timer]);

  return <div className="countdown">Game will start in <span className="timer">{timer}</span></div>;
};
















const TypeArea = ({questionNumber}) => {
  const [currWord, setCurrWord] = useState(0);
  const [started, setStarted] = useState(false);
  const [questions, setQuestion] = useState([]);


  const [intervalState, setIntervalState] = useState();
    const [timer, setTimer] = useState(10);
  const [start, setStart] = useState(false);

  let ques = structuredClone(questions);

  useEffect(() => {
    HandleSetQuestion();
  }, []);


  useMemo(() => {
    let id = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    setIntervalState(id);

    return () => {
      clearInterval(intervalState);
    };
  }, []);

  useEffect(() => {
    if (timer <= 0) {
      clearInterval(intervalState);
      HandlePingCorrect();
      socket.emit("Game Over");
    }
  }, [timer]);


  const HandleKeyDown = (event) => {
    switch (event.key) {
      case "ArrowUp":
        // console.log("Up arrow key pressed");
        event.preventDefault(); // Prevent default action (like scrolling)
        event.stopPropagation();
        break;
      case "ArrowDown":
        // console.log("Down arrow key pressed");
        event.preventDefault(); // Prevent default action (like scrolling)
        event.stopPropagation();
        break;
      case "ArrowLeft":
        // console.log("Left arrow key pressed");
        event.preventDefault(); // Prevent default action (like scrolling)
        event.stopPropagation();
        break;
      case "ArrowRight":
        // console.log("Right arrow key pressed");
        event.preventDefault(); // Prevent default action (like scrolling)
        event.stopPropagation();
        break;
      case "Enter":
        // console.log("Enter key pressed");
        event.preventDefault(); // Prevent default action (like scrolling)
        event.stopPropagation();
        break;
      default:
        break;
    }
  };


  const HandleSetQuestion = () => {
    // console.log("Question",questionNumber);
    let question = Paragraph[questionNumber];

    // console.log(randomNumber);
    // console.log(question);

    let arrayWords = question.split(" ");
    let wordObj = [];

    for (let i of arrayWords) {
      if (i.length >= 1) {
        wordObj.push([i, "normal",undefined]);
      }
    }

    // console.log(wordObj);

    setQuestion(wordObj);
  };

  const HandleChange = async (e) => {

    // console.log(e.key)

    const { value } = e.target;

    setStarted(true);
    if (!started) {
      HandleTimer();
    }

    let words = value.split(" ");

    // console.log(words)

    const ques = structuredClone(questions);

    if (
      words &&
      words.length >= 2 &&
      questions[words.length - 2][0] == words[words.length - 2]
    ) {
      ques[words.length - 2][1] = "correct";
      ques[words.length - 2][2] = undefined;
      setQuestion(ques);
    } else if (
      words &&
      words.length >= 2 &&
      questions[words.length - 2][0] != words[words.length - 2]
    ) {
      ques[words.length - 2][1] = "incorrect";
      setQuestion(ques);
    }

    if (words && words.length >= 1 && questions[words.length - 1]) {
      ques[words.length - 1][1] = "current";
      ques[words.length - 1][2] = words[words.length - 1];

      if (ques[words.length] && ques[words.length][1] === "current") {
        ques[words.length ][1] = "normal";
      }
      // console.log("called later",ques[words.length - 1])
      setQuestion(ques)
    }



    HandlePingCorrect();
  };




  const HandlePingCorrect = () =>{
    

    let correct_answers = 0;

    for(var i of questions){
      if(i[1]=="correct"){
        correct_answers++;
      }
    }

    socket.emit("correct answers",correct_answers)

    // console.log(correct_answers);
  }
  return (
    <>
    <span className="timer_type">Time remaining : {timer}</span>
      <div className="Type_Area">
        <label className="Question_Mount" htmlFor="input_text">
          {questions.map((single, index) => {
            return (
                <div key={`span_word_${index}`}
                     style={{
                       position:"relative",
                       margin:`10px 0px 5px 0px`
                     }}>

                  {
                    single[2] ? <span className={single[1]}>{single[2]}</span> :
                        <span className={single[1]}>{single[0]}</span>
                  }

                  {
                      ["current"].includes(single[1]) && <span style={{
                        position:"absolute",
                        left:"0",
                        top:"-25px"
                      }} >{single[0]}</span>
                  }

                </div>
            );
          })}
        </label>
        <div className="Input_component">
          <textarea id="input_text" type="text" onChange={HandleChange} onKeyDown={HandleKeyDown} />
        </div>
      </div>
    </>
  );
};










const EndGame = ({players,name}) =>{
  const [players_array , setPlayers] = useState([]);
  const [winner , setWinner] = useState("");

  console.log("got name as",name)
  useEffect(()=>{
    let array = Object.keys(players).map((single)=>{
      return players[single]
    })

    let sorted = array.sort((a,b)=>{
      return a.Points > b.Points ? -1 : 1
    })

    setWinner(sorted[0])
    setPlayers(sorted)
    // console.log(sorted)
  },[])
  return (
    <>
      <div className="Game_Over_Parent">
        <div className="Game_header">
          <div className={`flex items-center`}>
            <span>Winner</span>
            <span>{winner.Name}</span>
          </div>

          <span className="header">Scores</span>

        </div>
        <div className="score_wrapper">
          
        {players_array.map((single, index) => {
          return (
            <>
              <div className="name_Wrapper">
                <span key={`player_${index}`}>{single.Name}</span>
                <span key={`score_${index}`}>{single.Points}</span>
              </div>
            </>
          );
        })}
        
        </div>
      </div>
    </>
  );
}


EndGame.propTypes = {
  players: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired
}









const JoinGame = () => {
  const { ID } = useParams();
  const [name, setName] = useState(ID.split(":")[1]);
  const [nameSocket, setNameSocket] = useState("");
  const [players, setPlayers] = useState({});
  const [id, setID] = useState(ID.split(":")[0]);
  const [countDownCompleted, setCountdownCompleted] = useState(false);
  const [randomNumber , setRandomNumber] = useState(0)

  useEffect(() => {
    socket.connect();

    socket.emit("join room", ID.split(":"));

    socket.emit("get User");

    socket.on("player_list", (value) => {
      setPlayers(structuredClone(value));
      // console.log(value);
    });
    
    socket.on("begin game", (value) => {
      setRandomNumber(value);
      HandleStart();
      // console.log("pinged handle start",value)
    });



    socket.on("receive user", (value) => {
      if(value && value.length >= 1){
        setNameSocket(value)
      }
      console.log("receive user",value)
    });
    
    
    
    socket.on("game end", (value) => {
      HandleEnd(value);
      // console.log("pinged handle end")
    });

  }, [name]);

  useEffect(() => {}, [countDownCompleted]);

  const HandleStart = () => {
    // console.log(Object.keys(players).length)
    // console.log(players);
    setMount(<CountDown setCompleted={HandleCompletedCountdown} />);
  };

  const HandleCompletedCountdown = () => {
    const randomQuestionIndex = Math.min(Math.floor(Math.random() * Paragraph.length) , Paragraph.length - 1);
    setMount(<TypeArea questionNumber={randomQuestionIndex} />);
  };

  const [mount, setMount] = useState(
    <StartGame Start={HandleStart} Players={players} />
  );


  const HandleEnd = (player_list) =>{
    console.log(player_list)
    setMount(<EndGame players={player_list} name={nameSocket} />)
  }

  const HandleCopy = () =>{
    navigator.clipboard.writeText(id);
    alert("copied");
  }

  const HandleReset = () =>{
    socket.emit("Start Game");
  }

  return (
    <div className="Join_Game">
      <span className="title">Multi Player</span>
      <div className="room_id flex items-center gap-2 justify-between w-full py-2 px-3">
        <div className={`flex gap-2 w-full`}>
          <span className={`text-yellow-400`}>{nameSocket}</span>
          <div>
            <span>Room Id : {id} </span>
            <span onClick={HandleCopy}>copy</span>
          </div>
        </div>
        <div>
          {
              nameSocket.includes("(ADMIN)") &&
              <span className="text-sm bg-gray-800 p-2 rounded-md cursor-pointer" onClick={HandleReset}>Reset</span>
          }
        </div>
      </div>


      <div className="wrapper">
        <div className="player_holder_parent">
          <span className="heading">Players</span>
          <div className="player_holder">
            {Object.keys(players).map((single, index) => {
              return (
                <>
                  <div className="name_Wrapper">
                    <span key={`player_${index}`}>{players[single].Name}</span>
                    <span key={`score_${index}`}>{players[single].Points}</span>
                  </div>
                </>
              );
            })}
          </div>
        </div>

        <div className="Game_Area">{mount}</div>
      </div>
    </div>
  );
};

export default JoinGame;
