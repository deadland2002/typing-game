import React, { useEffect, useMemo, useReducer, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../src/socket";
import Paragraph from "../data/Paragraph.json";









const StartGame = ({Start,Players}) => {

  const HandleStart = () =>{
      socket.emit("Start Game");

      Start();
  }
return (
  <div>
      <span>StartGame</span>
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

  return <div>Game will start in {timer}</div>;
};
















const TypeArea = () => {
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





  const HandleSetQuestion = () => {
    // console.log("Question");
    let question;

    let max = 5;
    let randomNumber;

    do {
      const random = Math.random();
      const scaledRandom = random * (max - 0 + 1);
      randomNumber = Math.floor(scaledRandom) + 0;

      question = Paragraph[randomNumber];
    } while (!question);

    // console.log(randomNumber);
    // console.log(question);

    let arrayWords = question.split(" ");
    let wordObj = [];

    for (let i of arrayWords) {
      if (i.length >= 1) {
        wordObj.push([i, "normal"]);
      }
    }

    // console.log(wordObj);

    setQuestion(wordObj);
  };

  const HandleChange = async (e) => {
    const { value } = e.target;

    setStarted(true);
    if (!started) {
      HandleTimer();
    }

    let words = value.split(" ");
    if (
      words &&
      words.length >= 2 &&
      questions[words.length - 2][0] == words[words.length - 2]
    ) {
      ques[words.length - 2][1] = "correct";
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
      if (ques[words.length - 2] && ques[words.length - 2][1] == "current") {
        ques[words.length - 2][1] == "normal";
      }
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

    console.log(correct_answers);
  }
  return (
    <>
    <span className="timer_type">Time remaining : {timer}</span>
      <div className="Type_Area">
        <label className="Question_Mount" htmlFor="input_text">
          {questions.map((single, index) => {
            return (
              <span className={single[1]} key={`span_word_${index}`}>
                {single[0]}
              </span>
            );
          })}
        </label>
        <div className="Input_component">
          <textarea id="input_text" type="text" onChange={HandleChange} />
        </div>
      </div>
    </>
  );
};










const EndGame = ({players}) =>{
  const [players_array , setPlayers] = useState([]);
  const [winner , setWinner] = useState("");
  useEffect(()=>{
    let array = Object.keys(players).map((single)=>{
      return players[single]
    })

    let sorted = array.sort((a,b)=>{
      return a.Points > b.Points ? -1 : 1
    })

    setWinner(sorted[0])
    setPlayers(sorted)
    console.log(sorted)
  },[])
  return (
    <>
      <div className="Game_Over_Parent">
        <div className="Game_header">
          <div>
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












const JoinGame = () => {
  const { ID } = useParams();
  const [name, setName] = useState(ID.split(":")[1]);
  const [players, setPlayers] = useState({});
  const [id, setID] = useState(ID.split(":")[0]);
  const [countDownCompleted, setCountdownCompleted] = useState(false);

  useEffect(() => {
    socket.connect();
    socket.emit("join room", ID.split(":"));

    socket.on("player_list", (value) => {
      setPlayers(structuredClone(value));
      console.log(value);
    });
    
    socket.on("begin game", (value) => {
      HandleStart();
      console.log("pinged handle start")
    });
    
    
    
    socket.on("game end", (value) => {
      HandleEnd(value);
      console.log("pinged handle end")
    });

  }, [name]);

  useEffect(() => {}, [countDownCompleted]);

  const HandleStart = () => {
    console.log(Object.keys(players).length)
    console.log(players);
    
    // if (Object.keys(players).length <= 1) {
    //   alert("need at least 2 players");
    //   return;
    // }

    setMount(<CountDown setCompleted={HandleCompletedCountdown} />);
  };

  const HandleCompletedCountdown = () => {
    setMount(<TypeArea />);
  };

  const [mount, setMount] = useState(
    <StartGame Start={HandleStart} Players={players} />
  );


  const HandleEnd = (player_list) =>{
    console.log(player_list);
    setMount(<EndGame players={player_list} />)
  }

  return (
    <div className="Join_Game">
      <span className="title">Multi Player</span>

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
