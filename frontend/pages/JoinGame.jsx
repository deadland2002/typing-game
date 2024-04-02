import React, {useEffect, useMemo, useState} from "react";
import {useParams} from "react-router-dom";
import {socket} from "../src/socket";
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
  const [timer, setTimer] = useState(2);
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
  const [isAdminMode,setIsAdminMode] = useState(false);
  const [originalParagraph,setOriginalParagraph] = useState("");


  const [intervalState, setIntervalState] = useState();
    const [timer, setTimer] = useState(180);
  const [start, setStart] = useState(false);

  let ques = structuredClone(questions);

  useEffect(() => {
    HandleSetQuestion();

      const words = ["a","d","m","i","n","m","o","d","e"];
      let currWord = [];
      let isLocalAdmin = false;
    const HandleAdmin = (e) =>{
      if(isAdminMode || isLocalAdmin)
          return true;

      if(currWord.length >= words.length){
        currWord = [];
      }else{
        currWord.push(e.key);
      }

      if (JSON.stringify(currWord)===JSON.stringify(words)){
        alert("admin activated");
        setIsAdminMode(true);
        isLocalAdmin = true;
        currWord = [];
      }

      console.log(currWord)
    }

    document.addEventListener("keydown",HandleAdmin);
    return ()=>{
      document.removeEventListener("keydown",HandleAdmin)
    }
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
    setOriginalParagraph(question)
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

      if(isAdminMode){
        const orgWord = ques[words.length - 1][0];
        const userWord = words[words.length - 1];

        ques[words.length - 1][2] = orgWord.substring(0, userWord?.length ?? 0);

        console.log(orgWord,userWord,ques[words.length - 1][2]);
        let textAns = "";

        const newArr = ques.slice(0,words.length);
        for(let index=0 ; index<newArr.length; index++){
          textAns += ques[index][0] ?? "";
          textAns += " ";
        }

        e.target.value = textAns;

        console.log(e.target.value)
      }else{
        ques[words.length - 1][2] = words[words.length - 1];
      }

      if (ques[words.length] && ques[words.length][1] === "current") {
        ques[words.length ][1] = "normal";
      }
      setQuestion(ques)
    }


    e.target.value = e.target.value.substring(0,originalParagraph.length)
    console.log(e.target.value)


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
          <textarea data-gramm="false"
                    data-gramm_editor="false"
                    data-enable-grammarly="false"
                    id="input_text" type="text"
                    onChange={HandleChange} onKeyDown={HandleKeyDown} />
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
              <div className="name_Wrapper" key={`player_${index+1}`}>
                <span key={`player_${index}`}>{single.Name}</span>
                <span key={`score_${index}`}>{single.Points}</span>
              </div>
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
  const [mount, setMount] = useState();

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
        if(value.includes("(ADMIN)"))
          setMount(<StartGame Start={HandleStart} Players={players} />);
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
          <span className="heading text-center border-b-2 pb-2 border-amber-400">Players</span>
          <div className="player_holder">
            {Object.keys(players).map((single, index) => {
              return (
                  <div className="name_Wrapper border-b-2 border-gray-700 py-2" key={`players_name_${index+1}`}>
                    <span key={`player_${index}`}>{players[single].Name}</span>
                    <span key={`score_${index}`}>{players[single].Points}</span>
                  </div>
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
