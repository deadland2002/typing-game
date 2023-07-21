import React, { useEffect, useState } from "react";
import Paragraph from "../data/Paragraph.json";
import Sentence from "../data/Sentences.json";
import Hard from "../data/Hard.json";

const DifficultySelector = ({ questionState, setCountDown, setIntervaltime }) => {
  const HandleQuestion = (difficulity) => {
    var max = 0;
    if (difficulity == 1) {
      max = 29;
      setCountDown(30);
      setIntervaltime(30);
    } else if (difficulity == 2) {
      max = 5;
      setCountDown(60);
      setIntervaltime(60);
    } else if (difficulity == 3) {
      max = 4;
      setCountDown(60);
      setIntervaltime(60);
    }

    const random = Math.random();
    const scaledRandom = random * (max - 0 + 1);
    const randomNumber = Math.floor(scaledRandom) + 0;
    console.log(randomNumber);

    if (difficulity == 1) {
      HandleSetQuestion(Sentence[randomNumber]);
    } else if (difficulity == 2) {
      HandleSetQuestion(Paragraph[randomNumber]);
    } else if (difficulity == 3) {
      HandleSetQuestion(Hard[randomNumber]);
    }
  };

  const HandleSetQuestion = (question) => {
    let arrayWords = question.split(" ");
    let wordObj = [];

    for (let i of arrayWords) {
      if (i.length >= 1) {
        wordObj.push([i, "normal"]);
      }
    }

    console.log(wordObj);

    questionState(wordObj);
  };

  return (
    <div className="difficulity_Selector">
      <span key={"label"}>select difficulity</span>
      <button
        onClick={() => {
          HandleQuestion(1);
        }}
        key={"easy"}
      >
        easy
      </button>
      <button
        onClick={() => {
          HandleQuestion(2);
        }}
        key={"med"}
      >
        medium
      </button>
      <button
        onClick={() => {
          HandleQuestion(3);
        }}
        key={"diff"}
      >
        hard
      </button>
    </div>
  );
};

const QuestionMount = ({
  questions,
  questionState,
  setCountDown,
  HandleTimer,
}) => {
  return (
    <>
      <label className="Question_Mount" htmlFor="input_text">
        {questions.map((single) => {
          return <span className={single[1]}>{single[0]}</span>;
        })}
      </label>

      <TypeSpace
        questions={questions}
        questionState={questionState}
        setCountDown={setCountDown}
        HandleTimer={HandleTimer}
      />
    </>
  );
};

const TypeSpace = ({ questionState, questions, setCountDown, HandleTimer }) => {
  const [currWord, setCurrWord] = useState(0);
  const [started, setStarted] = useState(false);

  let ques = structuredClone(questions);

  const HandleChange = (e) => {
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
      questionState(ques);
    } else if (
      words &&
      words.length >= 2 &&
      questions[words.length - 2][0] != words[words.length - 2]
    ) {
      ques[words.length - 2][1] = "incorrect";
      questionState(ques);
    }

    if (words && words.length >= 1 && questions[words.length - 1]) {
      ques[words.length - 1][1] = "current";
      if (ques[words.length - 2] && ques[words.length - 2][1] == "current") {
        ques[words.length - 2][1] == "normal";
      }
    }
    console.log(words.length, ques[words.length - 1]);
  };
  return (
    <>
      <div className="Input_component">
        <textarea id="input_text" type="text" onChange={HandleChange} />
      </div>
    </>
  );
};

const Singleplayer = () => {
  const [question, setQuestion] = useState("");
  const [started, setStarted] = useState(false);
  const [countDown, setCountDown] = useState(0);
  const [running, setrunning] = useState(false);
  const [intervalState, setIntervalState] = useState();
  const [intervalTime ,setIntervaltime] = useState(0)

  useEffect(() => {
    let timerInterval = 1000;
    let intervalId;
    if (started && !running) {
      intervalId = setInterval(() => {
        setCountDown((prev) => prev - 1);
      }, 1000);
      setrunning(true);
      setIntervalState(intervalId);
    }

    return () => {
      clearInterval(intervalId); 
    };


  }, [started]);


  useEffect(() => {
    if(countDown == 0 && running){
      setStarted(false);
      setrunning(false);
      console.log("ended");
      clearInterval(intervalState);
      HandleEnd();
    }
    console.log("Countdown:", countDown);
  }, [countDown]);

  const HandleTimer = () => {
    console.log("start called");

    setStarted(true);
  };

  const HandleEnd = () =>{
    let correct = 0;
    for(var i of question){
      if(i[1] == "correct"){
        correct++;
      }
    }

    let score = intervalTime == 60 ? correct : correct*2
    alert(`Congratulations! You scored ${score}%`)
  }

  return (
    <>
      <title>Single Player</title>
      <div className="Single_Player">
        <span className="title">Single Player </span>
        <span className="timer">Time remaining : {countDown}s </span>
        {question
          ? [
              <QuestionMount
                questions={question}
                questionState={setQuestion}
                setCountDown={setCountDown}
                HandleTimer={HandleTimer}
              />,
            ]
          : [
              <DifficultySelector
                questionState={setQuestion}
                setCountDown={setCountDown}
                setIntervaltime={setIntervaltime}
              />,
            ]}
      </div>
    </>
  );
};

export default Singleplayer;
