// import useAxios from '../Providers/AxiosProvider'
// const axios = useAxios();
//import axios from "axios";

export const getAllDecks = async (axiosClient) => { 
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: '/deck'
  };

  try {
    const response = await axiosClient.request(config);
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
    url: '/deck/' + id
  };
  try {
    const response = await axiosClient.request(config)
    return response.data
  }catch (error) {
    console.error("Failed to fetch deck:", error);
    throw error; 
  }
};

export const createDeck = async (axiosClient, name, description, rounds=[]) => {
  console.log(rounds)
  let data = JSON.stringify({
    "name": name,
    "description": description,
    "rounds": rounds,
  });


  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: '/deck',
    data: data
  };

  try {
    const response = await axiosClient.request(config);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }

}

export const updateDeck = (axiosClient, id, name, description) => {
  let data = JSON.stringify({
    "name": "test_deck 3",
    "description": "this will be deleted"
  });

  let config = {
    method: 'put',
    maxBodyLength: Infinity,
    url: '/deck/' + id,
    headers: { 
      'Content-Type': 'application/json', 
    },
    data : data
  };

  axiosClient.request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));
  })
  .catch((error) => {
    console.log(error);
  });
}

export const deleteDeck = (axiosClient, id) => {
  let config = {
    method: 'delete',
    maxBodyLength: Infinity,
    url: '/deck/' + id
  };

  axiosClient.request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));
  })
  .catch((error) => {
    console.log(error);
  });
}

export const addQuestion = (axiosClient, deckId, questionId) => {
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: '/deck/' + deckId + '/question/' + questionId
  };

  axiosClient.request(config)
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
      url: '/question'
    };


    try {
      const response = await axiosClient.request(config);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch decks:", error);
      throw error;  // Propagate the error so it can be handled by the caller
    }
}

export const getDeckQuestions = async (axiosClient, deck_id) => {
  console.log("Getting new questions")
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: '/deck/' + deck_id + '/question'
  };


  try {
    const response = await axiosClient.request(config);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch decks:", error);
    throw error;  // Propagate the error so it can be handled by the caller
  }
}

export const getDeckRounds = async (axiosClient, deck_id) => {
    
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: '/deck/' + deck_id + '/round'
  };


  try {
    const response = await axiosClient.request(config);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch rounds:", error);
    throw error;  // Propagate the error so it can be handled by the caller
  }
}

export const removeQuestion = (axiosClient, deckId, questionId) => {
    let config = {
      method: 'delete',
      maxBodyLength: Infinity,
      url: '/deck/' + deckId + '/question/' + questionId
    };
    
    axiosClient.request(config)
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
    url: '/question',
    headers: { 
      'Content-Type': 'application/json', 
    },
  };


  try {
    const response = await axiosClient.post(config, data);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch decks:", error);
    throw error;  // Propagate the error so it can be handled by the caller
  }
}


export const addRound = async (axiosClient, num_questions=10, categories=[], attributes=[]) => {
  let data = JSON.stringify({
    "categories": categories,
    "attributes": attributes,
    "num_questions": num_questions
  });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: '/',
    headers: { 
      'Content-Type': 'application/json', 
    },
  };

  try {
    const response = await axiosClient.post(config, data);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch decks:", error);
    throw error;  // Propagate the error so it can be handled by the caller
  }
}

export const updateRound = async (axiosClient, round_id, categories, num_questions) => {
  let data = JSON.stringify({
    "categories": categories,
    "num_questions": num_questions
  });

  let config = {
    method: 'put',
    maxBodyLength: Infinity,
    url: '/deck' + '/round/' + round_id,
    data: data
  };

  return axiosClient.request(config)
}