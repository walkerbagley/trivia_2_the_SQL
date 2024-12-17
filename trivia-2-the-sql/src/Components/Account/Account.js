import './styles.css';
import React, { useEffect, useState } from "react";
import { useAxios } from '../../Providers/AxiosProvider';
import { useUserSession } from '../../Providers/UserProvider.js';
import { TeamsPage } from './Teams.js'
import { ScoresPage } from './Scores.js'

const Account = () => {
  const axios = useAxios();
  const { user } = useUserSession();
  

  return (
    <div className="accountpage">
      <TeamsPage/>
      <ScoresPage/>
    </div>
  );
}
export default Account;