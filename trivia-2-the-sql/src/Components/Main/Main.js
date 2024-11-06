import React from 'react'
import './styles.css'
import { useNavigate } from "react-router-dom";
import { getAllDecks } from '../../Services/Decks';
import { useAxios } from '../../Providers/AxiosProvider';
import { useAuthSession } from '../../Providers/AuthProvider';
import { login } from '../../Services/Auth';
import { register } from '../../Services/Auth';


const Main =  () => {
    const navigate = useNavigate();
    const { token, setJwt, clearJwt } = useAuthSession();
    console.log("token", token);
    var axios = useAxios();
    axios.get('/team/').then((response) => {
        console.log(response);
    }).catch((error) => {
        console.log(error);
    });

    return (
    <div className="titlepage">
        <div className="maintitle">Trivia 2: The SQL</div>
        <div className="buttons">
            <button
                className="button-52"
                onClick={() => navigate('/Play')}>
                Join Game
            </button>
            <button
                className="button-52"
                onClick={() => navigate('/Host')}>
                Host Game
            </button>
            <button
                className="button-52"
                onClick={() => getAllDecks()}>
                Test
            </button>
        </div>
    </div>
  );
}
export default Main;
