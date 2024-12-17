import axios from 'axios';

export const login = () => {
  let data = JSON.stringify({
    "username": "zachb",
    "password": "1r1sh"
  });
  
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: '/auth/login',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ6YWNoYiIsImV4cCI6MTczMDkxODQzN30.BDwAf4ptU6ubWOSkLiKpQT_w_-Mj4GnXn_S1Kc2S_bE'
    },
    data : data
  };
  
  axios.request(config)
  .then((response) => {
    JSON.stringify(response.data);
  })
  .catch((error) => {
    console.log(error);
  });
};

export const register = () => {
    let data = JSON.stringify({
    "username": "zachb",
    "password": "1r1sh"
    });

    let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: '/auth/register',
    headers: { 
        'Content-Type': 'application/json', 
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ6YWNoYiIsImV4cCI6MTczMDkxODQzN30.BDwAf4ptU6ubWOSkLiKpQT_w_-Mj4GnXn_S1Kc2S_bE'
    },
    data : data
    };

    axios.request(config)
    .then((response) => {
    JSON.stringify(response.data);
    })
    .catch((error) => {
    console.log(error);
    });
};