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
                                <strong>{new Date(s.date).toDateString()}</strong>
                            </h3>
                            <p>
                                Team Name: {s.team_name}
                            </p>
                            <p>
                                Score: {s.score}
                            </p>
                            <p>
                                Percent Correct: {s.percentage}%
                            </p>
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