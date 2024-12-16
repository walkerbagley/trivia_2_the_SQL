import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import './styles.css'
import { useAxios } from '../../Providers/AxiosProvider.js';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { GameService } from '../../Services/Game.js';
import { getTeams } from "../Account/AccountService.js";
import { useUserSession } from '../../Providers/UserProvider.js';


const JoinPage =  () => {
  const axios = useAxios();
  const { user } = useUserSession();
  const navigate = useNavigate();
  // const [gameId, setGameId] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [teamId, setTeamId] = useState("");
  const [myteams, setMyteams] = useState([]);
  

  useEffect(() => { // fetch my teams
      const fetchTeams = async () => {
        try {
          const t = await getTeams(axios);
          let m = [];
          t.forEach(team => {
            if (team.member_ids.includes(user.id)) {
              m.push(team);
            }
          });
          setMyteams(m);
        }
        catch (error) {
          console.error("Failed to fetch teams:", error);
        }
      };

      fetchTeams()
    }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJoinCode(value)
  };

  function joinGame() {
    console.log(teamId, joinCode);
    try {
      if (teamId==="" || joinCode===""){
        toast.info("Please select a team and enter a join code!")
        return;
      }
      GameService.joinGame(axios, {"join_code":joinCode, "team_id":teamId}).then((data)=>{
        console.log('Requestion Join Game',data);
        navigate("/loading/"+joinCode, { state: { gameId : data[0], joinCode : joinCode, teamId:teamId } })
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
    <div className="join-page center">
      <h1>Choose a team</h1>
        <div className='teamGrid'>
            {myteams?.map((team) => (
              <div  key={team.id} className='teamCard'>
                <button className="teamCard-button" onClick={()=>{setTeamId(team.id)}}>
                  <h3 className='h3'>{team.name}</h3>
                  <p className='p'>{team.member_ids.length} member{team.member_ids.length != 1 ? 's' : ''}</p>
                </button>
              </div>
          ))}
        </div>
        <h1>Enter GameID</h1>
        <form>
          <div className="form-field">
            <label htmlFor="join_code">Join Code:</label>
            <input 
              type="text" 
              id="join_code" 
              name="join_code"
              value={joinCode}
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