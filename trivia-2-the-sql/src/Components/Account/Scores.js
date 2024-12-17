import './styles.css';
import React, { useEffect, useState } from "react";
import { useAxios } from '../../Providers/AxiosProvider.js';
import { useUserSession } from '../../Providers/UserProvider.js';
import { getUserScores } from '../../Services/User.js'

const ScoresHistoryPage = () => {
    const axios = useAxios();
    const { user } = useUserSession();
    const [scores, setScores] = useState([])

    useEffect(() => {
        getUserScores(axios, user.id).then((data)=>{
            setScores(data);
        });
    }, []);

    return (
      <div className='center'>
        <h1>Score History</h1>
      <div className='scoresGrid'>
        {scores && scores.length > 0 ? (
                    scores.map((s) => (
                        <div className='scoresGrid-item' key={s.game_id}>
                            <h3>
                                {s.team_name}
                            </h3>
                            <p>{new Date(s.date).toDateString()}
                            </p>
                            <div>
                                <p><strong>{s.score}</strong><br/>points</p>
                                <p><strong>{s.percentage}%</strong><br/>correct</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No scores available.</p> // Optional: Message for empty scores
                )}
      </div>  
      </div>  
    );
};

export default ScoresHistoryPage;