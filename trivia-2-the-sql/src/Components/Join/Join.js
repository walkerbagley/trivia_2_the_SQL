import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom';
import './styles.css'
import { useAxios } from '../../Providers/AxiosProvider.js';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { GameService } from '../../Services/Game.js';

const JoinPage =  () => {
  const axios = useAxios();
  const navigate = useNavigate();
  // const [gameId, setGameId] = useState("");
  const [formValues, setFormValues] = useState({ team_id: '', join_code: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
    console.log(formValues);
  };

  function joinGame() {
    try {
      GameService.joinGame(axios, formValues).then((data)=>{
        console.log('Requestion Join Game',data);
        // setGameId(data[0])
        navigate("/loading/"+formValues.join_code, { state: { gameId : data[0], joinCode : formValues.join_code } })
      });
    } catch (error){
      toast.error(error);
    }
  };

  // function goToGame(){
  //   if (gameId == 'active'){
  //   }
  // }
  
    return (
    <div className="join-page">
        <h1>Enter GameID</h1>
        <form>
          <div className="form-field">
            <label htmlFor="team_id">Team ID:</label>
            <input 
              type="text" 
              id="team_id" 
              name="team_id" 
              value={formValues.team_id}
              onChange={handleChange} 
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="join_code">Join Code:</label>
            <input 
              type="text" 
              id="join_code" 
              name="join_code"
              value={formValues.join_code}
              onChange={handleChange} 
              required
            />
          </div>
          <button className='join-button' onClick={()=>joinGame()}>Join Game</button>
          <ToastContainer/>
      </form>
    </div>
  );
}
export default JoinPage;