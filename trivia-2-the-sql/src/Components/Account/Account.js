import './styles.css';
import { getTeams, addMember, removeMember } from "./AccountService.js";
import React, { useEffect, useState } from "react";
import { useAxios } from '../../Providers/AxiosProvider';
import { useUserSession } from '../../Providers/UserProvider.js';

const Account = () => {
  const axios = useAxios();
  const { user } = useUserSession();
  const [myteams, setMyteams] = useState([]);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const t = await getTeams(axios);
        let m = [];
        let o = [];
        t.forEach(team => {
          if (team.member_ids.includes(user)) {
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
    fetchTeams();
  }, []);

  useEffect(() => {
    console.log(myteams, teams);
  }, [myteams, teams]);

  const addToTeam = async (teamID) => {
    try {
      const r = await addMember(axios, teamID, user);
      console.log(r);
    } catch (error) {
      console.error("Failed to add user to team:", error);
    }
  }
  const removeFromTeam = async (teamID) => {}

  return (
    <div className="accountpage">
      <h1>Deck List</h1>
      <h1>Your Teams</h1>
      {myteams?.map((team) => {
        return (
          <div key={team.id} className='teamCard'>
            <div className='teamInfo'>
              <h3>{team.name}</h3>
              <p>{team.member_ids.length} members</p>
            </div>
          </div>
        );
      })}
      <h1>Join a Team</h1>
      {teams?.map((team) => {
        return (
          <div key={team.id} className='teamCard'>
            <div className='teamInfo'>
              <h3>{team.name}</h3>
              <p>{team.member_ids.length} members</p>
            </div>
            <button onClick={() => addToTeam(team.id)}>+</button>
          </div>
        );
      })}
    </div>
  );
}
export default Account;