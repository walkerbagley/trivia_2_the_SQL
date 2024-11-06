import axios from 'axios';

export const getAllDecks = () => {
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: 'http://127.0.0.1:8000/deck',
    headers: { 
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ6YWNoYiIsImV4cCI6MTczMDkxODQzN30.BDwAf4ptU6ubWOSkLiKpQT_w_-Mj4GnXn_S1Kc2S_bE'
    }
  };

  axios.request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));
  })
  .catch((error) => {
    console.log(error);
  });
};
