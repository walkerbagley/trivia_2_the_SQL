import './styles.css';
import React, { useEffect, useState } from "react";
import { useAxios } from '../../Providers/AxiosProvider.js';
import { useUserSession } from '../../Providers/UserProvider.js';

const ScoresPage = () => {

    return (
      <div className='scoresGrid center'>
        <h1>Score History:</h1>
      </div>  
    );
};

export default ScoresPage;