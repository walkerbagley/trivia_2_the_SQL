import { useLocation } from "react-router-dom";
import { GameService } from '../../../Services/Game.js'
import { useAxios } from '../../../Providers/AxiosProvider.js'
import React, { useEffect, useState } from "react";

const ScorePage = () => {
    const location = useLocation();
    const axios = useAxios(); 
    const [scores, setScores] = useState([]);


    const fetchGameScores = async () => {
        GameService.getGameScores(axios, location["state"]["gameId"]).then((value) => {
            setScores(value)
        }).catch((error) => {
          console.log("failed to get scores", error)
        }) 
      };

    useEffect(() => {
          fetchGameScores();

        }, []);

    return (
        <div className="scores-page">
            <h1>Let's tally the trivia!</h1>
            <div>
            <ol>
                {scores && scores.length > 0 ? (
                    scores
                    .sort((a, b) => b.score - a.score) // Sort in descending order by score
                    .map((s) => (
                        <li key={s.name}>
                            <div className="score-card">
                                <p className="name">{s.name}</p>
                                <p>{s.score}</p>
                            </div>
                        </li>
                    ))
                ) : (
                    <p>No scores available.</p> // Optional: Message for empty scores
                )}
            </ol>
            </div>

        </div>
    );

};

export default ScorePage;