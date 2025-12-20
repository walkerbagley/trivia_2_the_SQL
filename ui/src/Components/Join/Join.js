import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import './styles.css'
import { useAxios } from '../../Providers/AxiosProvider.js';
import { toast } from "react-toastify";
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
  // const [selectedTeamId, setSelectedTeamId] = useState(null);
  

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
          toast.error("Failed to fetch teams");
        }
      };

      fetchTeams()
      // setTeamId("56eb4197-4a7a-418b-b5f2-da2bb892699a2");
    }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJoinCode(String(value).toUpperCase())
  };

  function joinGame() {
    if (teamId==="" || joinCode===""){
      toast.info("Please select a team and enter a join code!")
      return;
    }
    GameService.joinGame(axios, {"join_code":joinCode, "team_id":teamId}).then((data)=>{
      if (data && data.game_id) {
        navigate("/loading/"+joinCode, { state: { gameId : data.game_id, joinCode : joinCode, teamId:teamId, host:false } })
      } else {
        toast.error("Invalid response from server");
      }
    }).catch((error)=>{
      console.error(error);
      let errorMessage = "Failed to join game";
      if (error.response && error.response.status === 404) {
        errorMessage = "Game not found. Please check your join code.";
      } else if (error.response && error.response.data && error.response.data.detail) {
        errorMessage = error.response.data.detail;
      }
      toast.error(errorMessage);
    });
  };

  // function goToGame(){
  //   if (gameId == 'active'){
  //   }
  // }
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevents form reload
    joinGame(); // Your function for handling the submission
  };
  
  return (
    <div className="join-page center">
      <h1>Choose a team</h1>
        <div className='teamGrid'>
            {myteams?.map((team) => (
              <div  key={team.id} className={`teamCard ${team.id === teamId ? 'selected' : ''}`}>
                <button className="teamCard-button" onClick={()=>{setTeamId(team.id)}}>
                  <h3 className='h3'>{team.name}</h3>
                  <p className='p'>{team.member_ids.length} member{team.member_ids.length !== 1 ? 's' : ''}</p>
                </button>
              </div>
          ))}
        </div>
        <h1>Enter GameID</h1>
        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-field">
            <input
              type="text"
              id="join_code"
              name="join_code"
              value={joinCode}
              onChange={handleChange}
              placeholder="Enter your join code"
              aria-required="true"
              className="form-input"
              required
            />
          </div>

          <button type="submit" className="join-button">
            Join Game
          </button>
        </form>
    </div>
  );
}
export default JoinPage;