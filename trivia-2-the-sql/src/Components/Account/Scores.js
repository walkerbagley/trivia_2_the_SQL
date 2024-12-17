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
            console.log(data);
            setScores(data);
        });
    }, []);

    return (
      <div className='scoresGrid center'>
        <h1>Score History:</h1>
        {scores && scores.length > 0 ? (
                    scores.map((s) => (
                        <div className='scoresGrid-item' key={s.name}>
                            <strong>{s.name}</strong>: {s.score}
                        </div>
                    ))
                ) : (
                    <p>No scores available.</p> // Optional: Message for empty scores
                )}
      </div>  
    );
};

export default ScoresHistoryPage;