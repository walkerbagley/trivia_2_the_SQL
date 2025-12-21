import './styles.css'
import { useAxios } from '../../../Providers/AxiosProvider.js'
import { useSupabase } from '../../../Providers/SupabaseProvider.js'
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GameService } from '../../../Services/Game.js';
import { getQuestionById } from '../../../Services/Question.js'
import ScoresModal from '../Scores/ScoreModel.js';

const QuestionPage = () => {
    const axios = useAxios();
    const { supabase, isReady } = useSupabase();
    const location = useLocation();
    const navigate = useNavigate();
    
    // State variables
    const [currAnswer, setCurrAnswer] = useState("");
    const [active, setActive] = useState("");
    const [question, setQuestion] = useState("");
    const [scores, setScores] = useState([]);
    const [options, setOptions] = useState({"a": [], "b": [], "c": [], "d": []});
    const [roundNumber, setRoundNumber] = useState(0);
    const [questionNumber, setQuestionNumber] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [currentTeamId, setCurrentTeamId] = useState(null);
    const [teamAnswers, setTeamAnswers] = useState({});
    const [showScoresModal, setShowScoresModal] = useState(false);
    
    // Refs for tracking state
    const optionsRef = useRef({"a": [], "b": [], "c": [], "d": []});
    const questionNumberRef = useRef(0);
    const roundNumberRef = useRef(0);
    const randomNumRef = useRef(Math.floor(Math.random() * 4));
    const lastAnswerRef = useRef(null);
    const channelsRef = useRef([]);

    let allAnswered = false;

    const toggleScoresModal = () => {
        setShowScoresModal(!showScoresModal);
    };

    const getQuestionSizeClass = (questionText) => {
        const length = questionText.length;
        if (length > 150) return 'question-text-xs';
        if (length > 100) return 'question-text-sm';
        if (length > 70) return 'question-text-md';
        return 'question-text';
    };

    function shuffleArray(arr) {
        const length = arr.length;
        const shuffled = new Array(length);
        const normalizedOffset = randomNumRef.current % length;
        for (let i = 0; i < length; i++) {
            const newIndex = (i + normalizedOffset) % length;
            shuffled[newIndex] = arr[i];
        }
        return shuffled;
    }

    const answerQuestion = (letter) => {
        setActive(letter);
        lastAnswerRef.current = options[letter][1];
        try {
            GameService.submitAnswer(
                axios,
                location.state.gameId,
                {
                    round_number: roundNumber,
                    question_number: questionNumber,
                    answer: options[letter][1]
                }
            ).catch((error) => {
                console.error('Error submitting answer:', error);
            });
        } catch (error) {
            console.error('Error in answerQuestion:', error);
        }
    };

    const fetchScores = async () => {
        try {
            const s = await GameService.getGameScores(axios, location.state.gameId);
            setScores(s);
        } catch (error) {
            console.error('Error fetching scores:', error);
        }
    };

    const fetchNewQuestion = async (questionId) => {
        try {
            const resp = await getQuestionById(axios, questionId);
            randomNumRef.current = Math.floor(Math.random() * 4);
            setQuestion(resp.question);
            
            const shuffledOptions = shuffleArray([
                [resp.a, "a"],
                [resp.b, "b"],
                [resp.c, "c"],
                [resp.d, "d"]
            ]);
            
            const newOptions = {
                "a": shuffledOptions[0],
                "b": shuffledOptions[1],
                "c": shuffledOptions[2],
                "d": shuffledOptions[3]
            };
            
            optionsRef.current = newOptions;
            setOptions(newOptions);
        } catch (error) {
            console.error('Error fetching question:', error);
        }
    };

    const handleGameUpdate = (gameData) => {
        console.log('Game update received:', gameData);
        
        // Check if game is complete
        if (gameData.status === 'complete') {
            navigate("/score/" + location.state.joinCode, {
                state: { gameId: location.state.gameId }
            });
            return;
        }

        // Update round if changed
        if (gameData.current_round !== roundNumberRef.current) {
            roundNumberRef.current = gameData.current_round;
            setRoundNumber(gameData.current_round);
            fetchScores();
        }

        // Update question if changed
        if (gameData.current_question !== questionNumberRef.current) {
            questionNumberRef.current = gameData.current_question;
            setQuestionNumber(gameData.current_question);
            setActive("");
            lastAnswerRef.current = null;
            
            // Fetch the new question
            if (gameData.current_question > 0) {
                // TODO: Note: You'll need to pass the question_id somehow
                // Option 1: Add question_id to Games table
                // Option 2: Calculate from DeckRounds/RoundQuestions
                // For now, we'll use a workaround via API
                fetchCurrentQuestion();
            }
        }

        // Calculate time remaining
        if (gameData.last_question_start && gameData.question_time_sec) {
            const startTime = new Date(gameData.last_question_start).getTime();
            const now = Date.now();
            const elapsed = (now - startTime) / 1000;
            const remaining = Math.max(0, gameData.question_time_sec - elapsed);
            setTimeRemaining(Math.floor(remaining));
        }
    };

    const handleScoreUpdate = () => {
        fetchScores();
    };

    const handleAnswerUpdate = (payload) => {
        const answer = payload.new;

        if (location.state.host) {
            allAnswered = scores.length > 0 && scores.every(team => teamAnswers[team.team_id]);
            setTeamAnswers(prev => ({
                ...prev,
                [answer.team_id]: {
                    answer: answer.answer,
                    team_id: answer.team_id
                }
            }));
        }
        
        // Only update if it's for current team, round, and question
        if (answer.team_id === currentTeamId &&
            answer.round_number === roundNumber &&
            answer.question_number === questionNumber) {
            
            // Find which option matches the answer
            for (const [letter, value] of Object.entries(optionsRef.current)) {
                if (value[1] === answer.answer) {
                    setActive(letter);
                    lastAnswerRef.current = answer.answer;
                    break;
                }
            }
        }
    };

    const fetchCurrentQuestion = async () => {
        try {
            // Fetch current game state to get question_id
            const gameState = await GameService.getCurrentGameState(axios, location.state.gameId);
            if (gameState.question_id) {
                await fetchNewQuestion(gameState.question_id);
            }
        } catch (error) {
            console.error('Error fetching current question:', error);
        }
    };

    const getInitialGameState = async () => {
        try {
            const gameState = await GameService.getCurrentGameState(axios, location.state.gameId);
            
            if (!gameState) return;
            
            // Set initial state
            if (gameState.status === 'complete') {
                navigate("/score/" + location.state.joinCode, {
                    state: { gameId: location.state.gameId }
                });
                return;
            }
            
            roundNumberRef.current = gameState.current_round;
            setRoundNumber(gameState.current_round);
            
            questionNumberRef.current = gameState.current_question;
            setQuestionNumber(gameState.current_question);
            
            // Get team ID
            if (gameState.team_id) {
                setCurrentTeamId(gameState.team_id);
            }
            
            // Get current question
            if (gameState.question_id) {
                await fetchNewQuestion(gameState.question_id);
            }
            
            // Get scores
            await fetchScores();
            
            // Set time remaining
            if (gameState.last_question_start && gameState.question_time_sec) {
                const startTime = new Date(gameState.last_question_start).getTime();
                const now = Date.now();
                const elapsed = (now - startTime) / 1000;
                const remaining = Math.max(0, gameState.question_time_sec - elapsed);
                setTimeRemaining(Math.floor(remaining));
            }
            
            // Set current answer if exists
            if (gameState.team_answer) {
                for (const [letter, value] of Object.entries(optionsRef.current)) {
                    if (value[1] === gameState.team_answer) {
                        setActive(letter);
                        lastAnswerRef.current = gameState.team_answer;
                        break;
                    }
                }
            }
        } catch (error) {
            console.error('Error getting initial game state:', error);
        }
    };

    // Set up Realtime subscriptions
    useEffect(() => {
        if (!supabase || !isReady || !location.state.gameId) return;

        console.log('Setting up Realtime subscriptions...');
        
        // Initial fetch
        getInitialGameState();

        // Subscribe to Games table
        const gamesChannel = supabase
            .channel(`game-${location.state.gameId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'Games',
                    filter: `id=eq.${location.state.gameId}`
                },
                (payload) => {
                    handleGameUpdate(payload.new);
                }
            )
            .subscribe((status) => {
                console.log('Games subscription status:', status);
            });

        // Subscribe to Scores table
        const scoresChannel = supabase
            .channel(`scores-${location.state.gameId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'Scores',
                    filter: `game_id=eq.${location.state.gameId}`
                },
                () => {
                    handleScoreUpdate();
                }
            )
            .subscribe((status) => {
                console.log('Scores subscription status:', status);
            });

        // Subscribe to Answers table
        const answersChannel = supabase
            .channel(`answers-${location.state.gameId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'Answers',
                    filter: `game_id=eq.${location.state.gameId}`
                },
                (payload) => {
                    handleAnswerUpdate(payload);
                }
            )
            .subscribe((status) => {
                console.log('Answers subscription status:', status);
            });

        channelsRef.current = [gamesChannel, scoresChannel, answersChannel];

        // Cleanup
        return () => {
            console.log('Cleaning up Realtime subscriptions...');
            channelsRef.current.forEach(channel => {
                supabase.removeChannel(channel);
            });
            channelsRef.current = [];
        };
    }, [supabase, isReady, location.state.gameId]);

    // Client-side countdown timer
    useEffect(() => {
        if (timeRemaining <= 0) return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining]);

    // Update current answer display when active changes
    useEffect(() => {
        try {
            if (active === "" || active === null) {
                setCurrAnswer("No Answer");
                return;
            }
            if (options[active] === null || options[active] === undefined || !options[active][0]) {
                setCurrAnswer("No Answer");
                return;
            }
            setCurrAnswer(options[active][0]);
        } catch (error) {
            console.error('Error setting current answer:', error);
        }
    }, [active, options]);

    const nextQuestion = () => {
        GameService.moveToNextQuestion(axios, location.state.gameId).catch((error) => {
            console.error('Error moving to next question:', error);
        });
    };

    const endGame = () => {
        GameService.endGame(axios, location.state.gameId).then(() => {
            navigate("/score/" + location.state.joinCode, {
                state: { gameId: location.state.gameId }
            });
        }).catch((error) => {
            console.error('Error ending game:', error);
        });
    };

    function leaveGame() {
        const confirmed = window.confirm("Are you sure you want to leave?");
        if (confirmed) {
            GameService.leaveGame(axios, location.state.gameId).then(() => {
                navigate('/');
            }).catch((error) => {
                console.error('Error leaving game:', error);
            });
        }
    }

    return (
        <div className='question-page'>
            {location.state.host && allAnswered && (
                <div className='all-answered'>
                    ✅ All teams have answered!
                </div>
            )}
            <div className='center'>
                <h2>Time Remaining: {timeRemaining}</h2>
                <h1 className='question-text'>Round {roundNumber}</h1>
                <h1 className={getQuestionSizeClass(question)}>
                    Question {questionNumber}: {question}
                </h1>
            </div>
            <div className='question-grid-container'>
                <div className='question-grid-item'>
                    <button
                        onClick={() => answerQuestion('a')}
                        disabled={location.state.host}
                        className={active === "a" ? 'selected-answer-button' : ""}
                    >
                        <strong>A</strong> {options["a"][0]}
                    </button>
                </div>
                <div className='question-grid-item'>
                    <button
                        onClick={() => answerQuestion('b')}
                        disabled={location.state.host}
                        className={active === "b" ? 'selected-answer-button' : ""}
                    >
                        <strong>B</strong> {options["b"][0]}
                    </button>
                </div>
                <div className='question-grid-item'>
                    <button
                        onClick={() => answerQuestion('c')}
                        disabled={location.state.host}
                        className={active === "c" ? 'selected-answer-button' : ""}
                    >
                        <strong>C</strong> {options["c"][0]}
                    </button>
                </div>
                <div className='question-grid-item'>
                    <button
                        onClick={() => answerQuestion('d')}
                        disabled={location.state.host}
                        className={active === "d" ? 'selected-answer-button' : ""}
                    >
                        <strong>D</strong> {options["d"][0]}
                    </button>
                </div>
            </div>
            <div className='next-question-button'>
                {location.state.host && (
                    <>
                        <button onClick={nextQuestion}>Next Question</button>
                        <button onClick={endGame}>End Game</button>
                        <button onClick={() => setShowScoresModal(true)}>View Scores</button>
                    </>
                )}
                {!location.state.host && (
                    <>
                        <button onClick={leaveGame}>Leave Game</button>
                        <button onClick={() => setShowScoresModal(true)}>View Scores</button>
                    </>
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
            {location.state.host && (
                <div>
                    <h2>Team Answers</h2>
                    <div className='team-answers'>
                        {Object.entries(teamAnswers).map(([teamId, data]) => {
                            // Find team name from scores
                            const team = scores.find(s => s.team_id === teamId);
                            const teamName = team ? team.name : 'Unknown Team';
                            
                            return (
                                <div key={teamId} className='team-answer-item'>
                                    <strong>{teamName}:</strong> {data.answer || 'No answer yet'}
                                </div>
                            );
                        })}
                        {Object.keys(teamAnswers).length === 0 && (
                            <p>No answers submitted yet</p>
                        )}
                    </div>
                </div>
            )}
            <ScoresModal 
                isOpen={showScoresModal}
                onClose={() => setShowScoresModal(false)}
                scores={scores}
            />
        </div>
    );
};

export default QuestionPage;