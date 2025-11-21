import './styles.css'
import { useAxios } from '../../../Providers/AxiosProvider.js'
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GameService } from '../../../Services/Game.js';
import {getCurrentUserStatus} from '../../../Services/User.js'
import {getQuestionById} from '../../../Services/Question.js'

const QuestionPage =  () => {
    const axios = useAxios();
    const location = useLocation();
    const navigate = useNavigate();
    const [currAnswer, setCurrAnswer] = useState("");
    const [active, setActive] = useState("");
    const [question, setQuestion] = useState("");
    const [scores, setScores] = useState([]);
    const [options, setOptions] = useState({"a": [], "b": [], "c": [], "d": []});
    const optionsRef = useRef({"a": [], "b": [], "c": [], "d": []});
    const [roundNumber, setRoundNumber] = useState(0);
    const [questionNumber, setQuestionNumber] = useState(0);
    const questionNumberRef = useRef(0);
    const roundNumberRef = useRef(0);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const randomNumRef = useRef(Math.floor(Math.random() * (4)));
    const lastAnswerRef = useRef(null);

    const getQuestionSizeClass = (questionText) => {
        const length = questionText.length;
        if (length > 150) return 'question-text-xs';
        if (length > 100) return 'question-text-sm';
        if (length > 70) return 'question-text-md';
        return 'question-text';
    };

    function shuffleArray(arr) {
        const length = arr.length;
        const shuffled = new Array(length); // Create an empty array of the same length
        const normalizedOffset = randomNumRef.current % length;
        for (let i = 0; i < length; i++) {
            const newIndex = (i + normalizedOffset) % length; // Calculate new position
            shuffled[newIndex] = arr[i]; // Move the element to its new position
        }
        return shuffled;
    }

    const answerQuestion = (letter) => {
        setActive(letter);
        lastAnswerRef.current = options[letter][1];
        try {
            GameService.submitAnswer(axios,location.state.gameId,{"round_number":roundNumber,"question_number":questionNumber,"answer":options[letter][1]}).catch((error)=>{
                console.error(error);
            });
        } catch (error) {
            console.error(error);
        }
    };

    const getGameStatus = () => {
        getCurrentUserStatus(axios).then((data) => {
            if (data===null || data.game_status===null || data.game_status.status === 'complete'){
                navigate("/score/"+location.state.joinCode, { state: { gameId : location.state.gameId } });
                return;
            }
            if (data?.game_status?.time_remaining !== undefined){
                setTimeRemaining(data.game_status.time_remaining);
            }
            
            // Only update active if the answer has changed from backend and is different from what we have
            if (data?.game_status?.team_answer !== null && 
                data?.game_status?.team_answer !== undefined &&
                data.game_status.team_answer !== lastAnswerRef.current){
                for (const [letter, value] of Object.entries(optionsRef.current)){
                    if (value[1] === data.game_status.team_answer){
                        setActive(letter);
                        lastAnswerRef.current = data.game_status.team_answer;
                        break;
                    }
                }
            }
            
            const newRoundNumber = data?.game_status?.round_number;
            const newQuestionNumber = Number(data?.game_status?.question_number);
            
            // Only update if round changed
            if (newRoundNumber !== undefined && roundNumberRef.current !== newRoundNumber) {
                roundNumberRef.current = newRoundNumber;
                setRoundNumber(newRoundNumber);
                // Fetch scores when round changes
                GameService.getGameScores(axios, location.state.gameId).then((s) => {
                    setScores(s);
                }).catch((error)=>{
                    console.error(error);
                });
            }
            
            // Only update if question changed
            if (newQuestionNumber !== undefined && questionNumberRef.current !== newQuestionNumber){
                questionNumberRef.current = newQuestionNumber;
                setQuestionNumber(newQuestionNumber);
                setActive("");
                lastAnswerRef.current = null;
                getQuestionById(axios, data.game_status.question_id).then((resp) => {
                    randomNumRef.current = Math.floor(Math.random() * (4));
                    setQuestion(resp.question);
                    const shuffledOptions = shuffleArray([[resp.a, "a"], [resp.b, "b"], [resp.c, "c"], [resp.d, "d"]]);
                    optionsRef.current = { "a": shuffledOptions[0], "b": shuffledOptions[1], "c": shuffledOptions[2], "d": shuffledOptions[3] };
                    setOptions({ "a": shuffledOptions[0], "b": shuffledOptions[1], "c": shuffledOptions[2], "d": shuffledOptions[3] });
                }).catch((error)=>{
                    console.error(error);
                });
            }
        }).catch((error)=>{
            console.error(error);
        });
    };

      useEffect(() => { // set team answer when active changes
        try{
            if (active === "" || active === null){
                setCurrAnswer("No Answer");
                return;
            }
            if (options[active] === null || options[active] === undefined || !options[active][0]) {
                setCurrAnswer("No Answer");
                return;
            }
            setCurrAnswer(options[active][0])
        } catch{
            console.error('useEffect error in setting currAnswer')
        }
      }, [active])


    // Polling for game status changes
    useEffect(() => {
        getGameStatus(); // Initial fetch
        const interval = setInterval(() => {
          getGameStatus();
        }, 2000);
        return () => clearInterval(interval);
      }, []);

    const nextQuestion = () => {
        GameService.moveToNextQuestion(axios, location.state.gameId).catch((error) => {
            console.error(error);
        });
        // No need to call getGameStatus - the polling interval will pick it up
    };
    const endGame = () => {
        GameService.endGame(axios, location.state.gameId).then((resp) => {
            navigate("/score/"+location.state.joinCode, { state: { gameId : location.state.gameId } });
        });
    };
    function leaveGame(){
        const confirmed = window.confirm("Are you sure you want to leave?");
        if (confirmed){
            GameService.leaveGame(axios, location.state.gameId).then((resp) => {
                navigate('/');
            });
        };
    };

    return (
        <div className='question-page'>
            <div className='center'>
                <h2>Time Remaining: {timeRemaining}</h2>
                <h1 className='question-text'>Round {roundNumber}</h1>
                <h1 className={getQuestionSizeClass(question)}>Question {questionNumber}: {question}</h1>
            </div>
                <div className='question-grid-container'>
                    <div className='question-grid-item'>
                        <button onClick={()=>{answerQuestion('a')}} disabled={location.state.host}
                            className={active === "a" ? 'selected-answer-button' : ""}>
                                <strong>A</strong> {options["a"][0]}
                        </button>
                    </div>
                    <div className='question-grid-item'>
                        <button onClick={()=>{answerQuestion('b')}} disabled={location.state.host}
                            className={active === "b" ? 'selected-answer-button' : ""}>
                            <strong>B</strong> {options["b"][0]}
                        </button>
                    </div>
                    <div className='question-grid-item'>
                        <button onClick={()=>{answerQuestion('c')}} disabled={location.state.host}
                            className={active === "c" ? 'selected-answer-button' : ""}>
                            <strong>C</strong> {options["c"][0]}
                        </button>
                    </div>
                    <div className='question-grid-item'>
                        <button onClick={()=>{answerQuestion('d')}} disabled={location.state.host}
                            className={active === "d" ? 'selected-answer-button' : ""}>
                            <strong>D</strong> {options["d"][0]}
                        </button>
                    </div>
                </div>
            <div className='next-question-button'>
               {location.state.host && (
                <>
                    <button onClick={()=>{nextQuestion()}} >Next Question</button>
                    <button onClick={() => {endGame()}} >End Game</button>
                </>
                )}
                {!location.state.host && (
                <button onClick={leaveGame} >Leave Game</button>
                )}
            </div>
            <div className='center'>
                <p>Current Answer: {currAnswer}</p>
            </div>
            <div>
                <h1>Scores</h1>
                <ul>
                    {scores ? 
                    scores.map((s) => (
                    <li key={s.name}>
                        <h3>{s.name}: {s.score}</h3>
                    </li>
                    ))
                    : (<p>No Scores Found</p>)
                    }
                </ul>
            </div>
        </div>
    );
};
export default QuestionPage;