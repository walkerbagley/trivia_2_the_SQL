import './styles.css'
import { useNavigate } from "react-router-dom";
import { getCurrentUserStatus } from '../../Services/User.js';
import { useAxios } from '../../Providers/AxiosProvider.js';
import React, { useEffect } from 'react'
import { GameService } from '../../Services/Game.js';
import { toast, ToastContainer } from "react-toastify";


const Main =  () => {
    const navigate = useNavigate();
    const axios = useAxios();
    
    // check if game has started
    const getGameStatus = () => {
        getCurrentUserStatus(axios).then((data) => {
            if (data.game_status===null || data.user_status == 'home' || data.game_status.status==='completed'){
                return
            }
            if (data.game_status.id){
                GameService.getGameById(axios,data.game_status.id).then((game) => {
                    if (!game){
                        return;
                    };
                    if (game.status === "open"){
                        navigate("/loading/"+game.join_code, { state: { gameId : game.id, joinCode : game.join_code, teamId:null } })
                    } else if (game.status === "in_progress") {
                        navigate("/play/"+game.join_code, { state: { gameId : game.id } });
                    }
                    else {
                        return
                    };
                });
            }
        });
    };

    const rejoinGame = () => {
        GameService.rejoinGame(axios).then((value) => {
        }
        );
    }


    useEffect(() => {
        getGameStatus();
    });

    return (
    <div className="titlepage">
        <ToastContainer/>
        <div className="maintitle">Trivia 2: The SQL</div>
        <div className="buttons">
            <button
                className="button-52"
                onClick={() => navigate('/Join')}>
                Join Game
            </button>
            <button
                className="button-52"
                onClick={() => navigate('/Host')}>
                Host Game
            </button>
            <button
                className="button-52"
                onClick={() => rejoinGame()}>
                Rejoin Game
            </button>
        </div>
    </div>
  );
}
export default Main;
