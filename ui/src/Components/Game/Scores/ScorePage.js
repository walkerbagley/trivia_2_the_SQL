import { useLocation } from "react-router-dom";
import { GameService } from '../../../Services/Game.js'
import { useAxios } from '../../../Providers/AxiosProvider.js'
import React, { useEffect, useState } from "react";
import './styles.css';

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
            <div className="scores-page__container">
                <h1 className="scores-page__title">🏆 Final Scores 🏆</h1>
                <div className="scores-page__list">
                    {scores && scores.length > 0 ? (
                        scores
                        .sort((a, b) => b.score - a.score)
                        .map((s, index) => (
                            <div key={s.name} className={`score-card ${index === 0 ? 'score-card--first' : index === 1 ? 'score-card--second' : index === 2 ? 'score-card--third' : ''}`}>
                                <div className="score-card__rank">
                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                </div>
                                <div className="score-card__content">
                                    <p className="score-card__name">{s.name}</p>
                                    <p className="score-card__score">{s.score} pts</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="scores-page__empty">No scores available.</p>
                    )}
                </div>
            </div>
        </div>
    );

};

export default ScorePage;