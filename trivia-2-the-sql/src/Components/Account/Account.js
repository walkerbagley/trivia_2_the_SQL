import './styles.css';
import { getTeams } from "./AccountService.js";
import React from "react";
import { useAxios } from '../../Providers/AxiosProvider';

const Account = () => {
  const axios = useAxios();
  const teams = (axios) => {
    return getTeams(axios);
  }
  console.log(teams(axios));
  // axios.get('/team/').then((response) => {
  //   console.log(response);
  // }).catch((error) => {
  //   console.log(error);
  // });
  // console.log(teams);
    // return teams;
  // }

  return (
    <div className="accountpage">
      <li className="decklist">
          <h1>Deck List</h1>
        <h1>Your Teams</h1>
          <h1>Join a Team</h1>
      </li>
    </div>
  );
}
export default Account;