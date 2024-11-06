// import useAxios from '../Providers/AxiosProvider'
// const axios = useAxios();
import axios from "axios";

const url_start = 'http://127.0.0.1:8002'

export const getAllDecks = async (axiosClient) => { 
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: url_start + '/deck',
    headers: { 
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ6YWNoYiIsImV4cCI6MTczMDkxODQzN30.BDwAf4ptU6ubWOSkLiKpQT_w_-Mj4GnXn_S1Kc2S_bE'
    }
  };

  try {
    const response = await axiosClient.request(config);
    console.log("in getAllDecks", JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error("Failed to fetch decks:", error);
    throw error;  // Propagate the error so it can be handled by the caller
  }
};


export const getDeck = async (axiosClient, id) => {
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: url_start + '/deck/73a3f5dc-3fad-44d3-bf24-000d419ab326',
    headers: { 
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ6YWNoYiIsImV4cCI6MTczMDkxODQzN30.BDwAf4ptU6ubWOSkLiKpQT_w_-Mj4GnXn_S1Kc2S_bE'
    }
  };
  try {
    const response = await axios.request(config)
    console.log("getdeckbyid ", response.data)
    return response.data
  }catch (error) {
    console.error("Failed to fetch deck:", error);
    throw error; 
  }
};

export const createDeck = async (axiosClient, name, description, category, num_questions) => {
  let data = JSON.stringify({
    "name": name,
    "description": description,
    "category": category,
    "num_questions": num_questions
  });


  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: url_start + '/deck',
    // headers: { 
    //   'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ6YWNoYiIsImV4cCI6MTczMDkxODQzN30.BDwAf4ptU6ubWOSkLiKpQT_w_-Mj4GnXn_S1Kc2S_bE',
    // },
    data: data
  };

  try {
    const response = await axiosClient.request(config);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }

  // axiosClient.request(config)
  // .then((response) => {
  //   console.log(JSON.stringify(response.data));
  // })
  // .catch((error) => {
  //   console.log(error);
  // });
}

export const updateDeck = (name, description) => {
  let data = JSON.stringify({
    "name": "test_deck 3",
    "description": "this will be deleted"
  });

  let config = {
    method: 'put',
    maxBodyLength: Infinity,
    url: url_start + '/deck/17960949-f5be-4079-940a-f04d6e1b3669',
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
    url: url_start + '/deck/17960949-f5be-4079-940a-f04d6e1b3669',
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
    url: url_start + '/deck/73a3f5dc-3fad-44d3-bf24-000d419ab326/question/0078a7ac-46ea-4244-9bb9-6c0e5f2457bc',
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

export const getQuestions = async (axiosClient) => {
    
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: url_start + '/question'
    };


    try {
      const response = await axiosClient.request(config);
      console.log("in getQuestions", JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error("Failed to fetch decks:", error);
      throw error;  // Propagate the error so it can be handled by the caller
    }
}

export const getDeckQuestions = async (axiosClient, deck_id) => {
    
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: url_start + '/deck/' + deck_id + '/question'
  };


  try {
    const response = await axiosClient.request(config);
    console.log("in getQuestions", JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error("Failed to fetch decks:", error);
    throw error;  // Propagate the error so it can be handled by the caller
  }
}

export const removeQuestion = () => {
    let config = {
      method: 'delete',
      maxBodyLength: Infinity,
      url: url_start + '/deck/73a3f5dc-3fad-44d3-bf24-000d419ab326/question/0078a7ac-46ea-4244-9bb9-6c0e5f2457bc',
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

export const getSortedQuestions = async (cat, diff, axiosClient) => {

  let data = JSON.stringify({
    "category": cat,
    "difficulty": diff
  });
    
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: url_start + '/question',
    headers: { 
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ6YWNoYiIsImV4cCI6MTczMDkxODQzN30.BDwAf4ptU6ubWOSkLiKpQT_w_-Mj4GnXn_S1Kc2S_bE',
      'Content-Type': 'application/json', 
    },
  };


  try {
    const response = await axiosClient.request(config);
    console.log("in getQuestions", JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error("Failed to fetch decks:", error);
    throw error;  // Propagate the error so it can be handled by the caller
  }
}