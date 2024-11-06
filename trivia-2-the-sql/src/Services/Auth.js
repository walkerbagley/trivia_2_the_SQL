import axios from 'axios';

url_start = 'http://127.0.0.1:8000'

export const login = () => {
  let data = JSON.stringify({
    "username": "zachb",
    "password": "1r1sh"
  });
  
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: url_start +'/auth/login',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ6YWNoYiIsImV4cCI6MTczMDkxODQzN30.BDwAf4ptU6ubWOSkLiKpQT_w_-Mj4GnXn_S1Kc2S_bE'
    },
    data : data
  };
  
  axios.request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));
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
    url: url_start +'/auth/register',
    headers: { 
        'Content-Type': 'application/json', 
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ6YWNoYiIsImV4cCI6MTczMDkxODQzN30.BDwAf4ptU6ubWOSkLiKpQT_w_-Mj4GnXn_S1Kc2S_bE'
    },
    data : data
    };

    axios.request(config)
    .then((response) => {
    console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
    console.log(error);
    });
};