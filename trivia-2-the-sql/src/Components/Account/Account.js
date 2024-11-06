import './styles.css';
import { getTeams } from "./AccountService.js";
import React, { useEffect, useState } from "react";

const Account = () => {
  useEffect(() => {
    const teams = getTeams();
    console.log(teams);
  });

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