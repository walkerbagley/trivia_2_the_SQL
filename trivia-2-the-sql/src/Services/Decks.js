// import useAxios from '../Providers/AxiosProvider'
// const axios = useAxios();
//import axios from "axios";

export const getAllDecks = async (axiosClient) => { 
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: '/deck'
  };

  //axiosClient.request(config)
  try {
    const response = await axiosClient.request(config);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch decks:", error);
      // Propagate the error so it can be handled by the caller
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
     
  }
};

export const createDeck = async (axiosClient, name, description, rounds=[]) => {
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
    
  }

}

export const updateDeck = async (axiosClient, id, name, description) => {
  let data = JSON.stringify({
    "name": name,
    "description": description
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

  try {
    const response = await axiosClient.request(config);
    return response.data;
  } catch (error) {
    console.error("Failed to update deck:", error);
    throw error;
  }
}

export const deleteDeck = (axiosClient, id) => {
  let config = {
    method: 'delete',
    maxBodyLength: Infinity,
    url: '/deck/' + id
  };

  axiosClient.request(config)
  .then((response) => {
    JSON.stringify(response.data);
  })
  .catch((error) => {
    console.log(error);
  });
}

export const addQuestionToRound = async (axiosClient, roundId, question_number, questionId) => {
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: '/deck/round/' + roundId + '/' + question_number + '/' + questionId
  };

  try {
    const response = await axiosClient.request(config);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
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
        // Propagate the error so it can be handled by the caller
    }
}

export const getDeckQuestions = async (axiosClient, deck_id) => {
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
      // Propagate the error so it can be handled by the caller
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
  }
}

export const removeQuestionFromRound = async (axiosClient, roundId, questionId) => {
    let config = {
      method: 'delete',
      maxBodyLength: Infinity,
      url: '/deck/round/' + roundId + '/question/' + questionId
    };
    
    try {
      const response = await axiosClient.request(config);
      return response;
    } catch (error) {
      console.error("Failed to remove question from round:", error);
      throw error;
    }
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
      // Propagate the error so it can be handled by the caller
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
      // Propagate the error so it can be handled by the caller
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