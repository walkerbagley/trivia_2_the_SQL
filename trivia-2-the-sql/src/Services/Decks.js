import axios from 'axios';

// {"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwYXQiLCJleHAiOjE3MzEwNDIyNTN9.IADSm27QgYJsNFHstD1Jsc_3RdJoDioSoLdpz794qZA","token_type":"bearer"}
export const getAllDecks = () => {
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: 'http://127.0.0.1:8000/deck',
    headers: { 
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwYXQiLCJleHAiOjE3MzEwNDIyNTN9.IADSm27QgYJsNFHstD1Jsc_3RdJoDioSoLdpz794qZA'
    }
  };
  console.log("config", config);
  axios.request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));
  })
  .catch((error) => {
    console.log(error);
  });
};

export const getDeck = (id) => {
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: 'http://127.0.0.1:8000/deck/73a3f5dc-3fad-44d3-bf24-000d419ab326',
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
}

export const createDeck = (name, description) => {
  let data = JSON.stringify({
    "name": "test_deck 2",
    "description": "this will be deleted"
  });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'http://127.0.0.1:8000/deck',
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
}

export const updateDeck = (name, description) => {
  let data = JSON.stringify({
    "name": "test_deck 3",
    "description": "this will be deleted"
  });

  let config = {
    method: 'put',
    maxBodyLength: Infinity,
    url: 'http://127.0.0.1:8000/deck/17960949-f5be-4079-940a-f04d6e1b3669',
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
}

export const deleteDeck = () => {
  let config = {
    method: 'delete',
    maxBodyLength: Infinity,
    url: 'http://127.0.0.1:8000/deck/17960949-f5be-4079-940a-f04d6e1b3669',
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
}

export const addQuestion = () => {
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'http://127.0.0.1:8000/deck/73a3f5dc-3fad-44d3-bf24-000d419ab326/question/0078a7ac-46ea-4244-9bb9-6c0e5f2457bc',
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
}

export const getQuestions = () => {
    let data = '';
    
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: 'http://127.0.0.1:8000/deck/73a3f5dc-3fad-44d3-bf24-000d419ab326/question',
      headers: { 
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
}

export const removeQuestion = () => {
    let config = {
      method: 'delete',
      maxBodyLength: Infinity,
      url: 'http://127.0.0.1:8000/deck/73a3f5dc-3fad-44d3-bf24-000d419ab326/question/0078a7ac-46ea-4244-9bb9-6c0e5f2457bc',
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
}