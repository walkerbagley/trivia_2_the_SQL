import './styles.css';
import { getTeams, addMember, removeMember, createTeam } from "./AccountService.js";
import React, { useEffect, useState } from "react";
import { useAxios } from '../../Providers/AxiosProvider';
import { useUserSession } from '../../Providers/UserProvider.js';

const Account = () => {
  const axios = useAxios();
  const { user } = useUserSession();
  const [teamName, setTeamName] = useState("");
  const [myteams, setMyteams] = useState([]);
  const [teams, setTeams] = useState([]);
  const [updateTeams, setUpdateTeams] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const t = await getTeams(axios);
        let m = [];
        let o = [];
        t.forEach(team => {
          if (team.member_ids.includes(user.id)) {
            m.push(team);
          }
          else {
            o.push(team);
          }
        });
        setTeams(o);
        setMyteams(m);
      }
      catch (error) {
        console.error("Failed to fetch teams:", error);
      }
    };
    if (updateTeams) {
      fetchTeams();
      setUpdateTeams(false);
    }
  }, [updateTeams]);

  // useEffect(() => {
  //   console.log(myteams, teams);
  // }, [myteams, teams]);

  const addToTeam = async (teamID) => {
    try {
      const r = await addMember(axios, teamID, user.id);
      setUpdateTeams(true);
    } catch (error) {
      console.error("Failed to add user to team:", error);
    }
  }
  const removeFromTeam = async (teamID) => {
    try {
      const r = await removeMember(axios, teamID, user.id);
      setUpdateTeams(true);
    } catch (error) {
      console.error("Failed to remove user from team:", error);
    }
  }
  const createNewTeam = async (teamName) => {
    try {
      const r = await createTeam(axios, teamName, user.id);
      // console.log(r.id);
      const m = await addMember(axios, r.id, user.id);
      setUpdateTeams(true);
    } catch (error) {
      console.error("Failed to remove user from team:", error);
    }
  }

  return (
    <div className="accountpage">
      <h1>Welcome { user.user_name }!</h1>
      <h1>My Teams</h1>
      <div className='teamGrid'>
        <div className='teamCard'>
          <form className='form' onSubmit={(e) => {
              e.preventDefault();
              createNewTeam(teamName);
            }}>
            <input className='textfield' type='text' name='teamname' placeholder='Team Name' onChange={(e) => {
              e.preventDefault();
              setTeamName(e.target.value);
            }} required></input>
            <button type='submit' className='button' onSubmit={(e) => {
              e.preventDefault();
              createNewTeam(teamName);
            }}>Create Team</button>
          </form>
        </div>
      {myteams?.map((team) => {
        return (
          <div key={team.id} className='teamCard'>
              <h3 className='h3'>{team.name}</h3>
              <p className='p'>{team.member_ids.length} member{team.member_ids.length != 1 ? 's' : ''}</p>
            <button className='button' onClick={() => removeFromTeam(team.id)}>-</button>
          </div>
        );
      })}
      </div>
      {teams.length ? <h1>Join a Team</h1> : <></>}
      <div className='teamGrid'>
      {teams?.map((team) => {
        return (
          <div key={team.id} className='teamCard'>
              <h3 className='h3'>{team.name}</h3>
              <p className='p'>{team.member_ids.length} member{team.member_ids.length != 1 ? 's' : ''}</p>
            <button className='button' onClick={() => addToTeam(team.id)}>+</button>
          </div>
        );
      })}
      </div>
    </div>
  );
}
export default Account;