import './styles.css';
import { getTeams, addMember, removeMember, createTeam, updateTeam } from "./AccountService.js";
import React, { useEffect, useState } from "react";
import { useAxios } from '../../Providers/AxiosProvider.js';
import { useUserSession } from '../../Providers/UserProvider.js';

const TeamsPage = () => {
  const axios = useAxios();
  const { user } = useUserSession();
  const [teamName, setTeamName] = useState("");
  const [edit, setEdit] = useState("");
  const [newName, setNewName] = useState("");
  const [myteams, setMyteams] = useState([]);
  const [teams, setTeams] = useState([]);

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

  useEffect(() => {
    fetchTeams();
  }, []);

  const addToTeam = async (teamID) => {
      addMember(axios, teamID, user.id).then(() => {
        fetchTeams();
      }).catch ((error) => {
      console.error("Failed to add user to team:", error);
      });
    }

  const removeFromTeam = async (teamID) => {
      removeMember(axios, teamID, user.id).then(() => {
        fetchTeams();
      }).catch ((error) => {
      console.error("Failed to remove user from team:", error);
      });
  }

  const createNewTeam = async (teamName) => {
    createTeam(axios, teamName, user.id).then((value) => {
      fetchTeams();
      setTeamName("");
    }).catch ((error) => {
      console.error("Failed to create team:", error);
    });
  }

  const renameTeam = async (teamID, teamName) => {
      updateTeam(axios, teamID, teamName).then(() => {
        setEdit("");
        setNewName("");
        fetchTeams();
      }).catch ((error) => {
        console.error("Failed to rename team:", error);
      });
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
            <input className='textfield' type='text' value={teamName} name='teamname' placeholder='Team Name' onChange={(e) => {
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
            <form className={`form ${edit === team.id ? '' : 'hide'}`} onSubmit={(e) => {
              e.preventDefault();
              renameTeam(team.id, newName);
            }}>
              <input className='textfield' type='text' name='newname' placeholder='New Name' onChange={(e) => {
                e.preventDefault();
                setNewName(e.target.value);
              }} required></input>
              <button type='submit' className='button' onSubmit={(e) => {
                e.preventDefault();
                renameTeam(team.id, newName);
              }}>Change Name</button>
            </form>
            <p className='p'>{team.member_ids.length} member{team.member_ids.length !== 1 ? 's' : ''}</p>
            <div className='btncontainer'>
              <button className='button' onClick={() => removeFromTeam(team.id)}>-</button>
              <div className='separator'/>
              <button className='button' onClick={() => {
                if (team.id !== edit) {
                  setEdit(team.id);
                }
                else {
                  setEdit("");
                }
              }}>Rename</button>
            </div>
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
              <p className='p'>{team.member_ids.length} member{team.member_ids.length !== 1 ? 's' : ''}</p>
            <button className='button' onClick={() => addToTeam(team.id)}>+</button>
          </div>
        );
      })}
      </div>
    </div>
  );
}
export default TeamsPage;