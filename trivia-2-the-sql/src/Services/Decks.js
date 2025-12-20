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

// export const addQuestionToRound = async (axiosClient, roundId, question_number, questionId) => {
//   let config = {
//     method: 'post',
//     maxBodyLength: Infinity,
//     url: '/deck/round/' + roundId + '/' + question_number + '/' + questionId
//   };

//   try {
//     const response = await axiosClient.request(config);
//     return response;
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// }

export const addQuestionToRound = async (axiosClient, roundId, questionNumber, category = null, difficulty = null) => {
  const params = new URLSearchParams();
  
  if (category) {
    params.append('category', category);
  }
  if (difficulty) {
    params.append('difficulty', difficulty);
  }

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `/deck/round/${roundId}/${questionNumber}${params.toString() ? `?${params.toString()}` : ''}`
  };

  try {
    const response = await axiosClient.request(config);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const addSpecificQuestionToRound = async (axiosClient, roundId, questionNumber, questionId) => {
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `/deck/round/${roundId}/${questionNumber}/${questionId}`
  };

  try {
    const response = await axiosClient.request(config);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const replaceQuestionInRound = async (axiosClient, roundId, questionId, questionNumber, category = null, difficulty = null) => {
  const params = new URLSearchParams();
  
  if (category) {
    params.append('category', category);
  } else {
    throw new Error("Category must be provided to replace question in round");
  }
  if (difficulty) {
    params.append('difficulty', difficulty);
  }

  let config = {
    method: 'put',
    maxBodyLength: Infinity,
    url: `/deck/round/${roundId}/question/${questionId}/${questionNumber}${params.toString() ? `?${params.toString()}` : ''}`
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


export const addRound = async (axiosClient, deck_id, num_questions=10, categories=[], attributes=[], round_number=null) => {
  let data = JSON.stringify({
    "categories": categories,
    "attributes": attributes,
    "num_questions": num_questions
  });

  const params = new URLSearchParams();
  if (round_number !== null && round_number !== undefined) {
    params.append('round_number', round_number);
  }

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `/deck/${deck_id}/round${params.toString() ? `?${params.toString()}` : ''}`,
    headers: { 
      'Content-Type': 'application/json', 
    },
    data: data
  };

  try {
    const response = await axiosClient.request(config);
    return response.data;
  } catch (error) {
    console.error("Failed to add round:", error);
    throw error;
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

export const deleteRound = async (axiosClient, round_id) => {
  let config = {
    method: 'delete',
    maxBodyLength: Infinity,
    url: '/deck/round/' + round_id
  };

  try {
    const response = await axiosClient.request(config);
    return response;
  } catch (error) {
    console.error("Failed to delete round:", error);
    throw error;
  }
}