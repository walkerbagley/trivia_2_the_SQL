import React, {useNavigate,useState} from 'react'
import './styles.css'
import { useAxios } from '../../Providers/AxiosProvider.js';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { GameService } from '../../Services/Game';

const PrePlay =  () => {
  const axios = useAxios();

  [formValues, setFormValues] = useState({ team_id: '', join_code: '' });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  function joinGame(gameId) {
    try {
      GameService.joinGame(axios, gameId, formValues);
    } catch (error){
      toast.error(error);
    }
  };

    return (
    <div className="playpage">
        <h1>Enter GameID</h1>
        <form>
          <div class="form-field">
            <label for="teamName">Team ID:</label>
            <input 
              type="text" 
              id="teamName" 
              name="teamName" 
              value={formValues.teamName}
              onChange={handleChange} 
              required
            />
          </div>
          <div class="form-field">
            <label for="joinCode">Join Code:</label>
            <input 
              type="text" 
              id="joinCode" 
              name="joinCode"
              value={formValues.joinCode}
              onChange={handleChange} 
              required
            />
          </div>
          <button onClick={()=>joinGame()}></button>
          <ToastContainer/>
      </form>
    </div>
  );
}
export default PrePlay;