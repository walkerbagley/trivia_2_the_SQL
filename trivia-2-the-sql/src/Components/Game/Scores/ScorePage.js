import { useNavigate, useLocation } from "react-router-dom";
import { GameService } from '../../../Services/Game.js'
import { useAxios } from '../../../Providers/AxiosProvider.js'
import { useEffect, useState } from "react";

const ScorePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const axios = useAxios(); 
    const [scores, setScores] = useState([]);


    const fetchGameScores = async () => {
        GameService.getGameScores(axios, location["state"]["gameId"]).then((value) => {
            console.log(value)
            setScores(value)
        }).catch((error) => {
          console.log("failed to get scores", error)
        }) 
      };

    useEffect(() => {
          fetchGameScores();
          console.log(location["state"]["gameId"]);

        }, []);

    return (
        <div>
            <h1>Let's tally the trivia</h1>
            <div>
                <ol>
                {
                    scores ? scores.map((score) => {
                        <li>{score.team_id}: {score.score}</li>
                    }) : <></>
                }
                </ol>
            </div>

        </div>
    );

}

export default ScorePage;