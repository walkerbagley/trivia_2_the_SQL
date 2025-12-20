import './styles.css';
import React, { useEffect, useState } from "react";
import { useAxios } from '../../Providers/AxiosProvider.js';
import { useUserSession } from '../../Providers/UserProvider.js';
import TeamsPage from './Teams.js'
import ScoresHistoryPage from './Scores.js'

const Account = () => {
  const axios = useAxios();
  const { user } = useUserSession();
  const [currentPage, setCurrentPage] = useState("teams");
  

  return (
    <div className="accountpage">
      <div className="toggle-buttons">
        <button
          onClick={() => setCurrentPage("teams")}
          className={currentPage === "teams" ? "active" : ""}
        >
          Teams
        </button>
        <button
          onClick={() => setCurrentPage("scores")}
          className={currentPage === "scores" ? "active" : ""}
        >
          Scores
        </button>
      </div>

      {/* Render the selected page */}
      <div className="page-content">
        {currentPage === "teams" && <TeamsPage />}
        {currentPage === "scores" && <ScoresHistoryPage />}
      </div>
    </div>
  );
}
export default Account;