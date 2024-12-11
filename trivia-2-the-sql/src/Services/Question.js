const url_start = 'http://127.0.0.1:8001';

// Get a question by ID
export const getQuestionById = async (axiosClient, id) => {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${url_start}/question/${id}`,
    };
  
    try {
      const response = await axiosClient.request(config);
      console.log("in getQuestionById", JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch question with ID ${id}:`, error);
      throw error;
    }
  };
  
  // Create a new question
  export const createQuestion = async (axiosClient, question) => {
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${url_start}/question/`,
      data: question,
    };
  
    try {
      const response = await axiosClient.request(config);
      console.log("in createQuestion", JSON.stringify(response.data));
      return response.data; // Returns the created question's ID
    } catch (error) {
      console.error("Failed to create question:", error);
      throw error;
    }
  };
  
  // Update an existing question
  export const updateQuestion = async (axiosClient, id, question) => {
    const config = {
      method: 'put',
      maxBodyLength: Infinity,
      url: `${url_start}/question/${id}`,
      data: question,
    };
  
    try {
      const response = await axiosClient.request(config);
      console.log("in updateQuestion", response.data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update question with ID ${id}:`, error);
      throw error;
    }
  };
  
  // Delete a question
  export const deleteQuestion = async (axiosClient, id) => {
    const config = {
      method: 'delete',
      maxBodyLength: Infinity,
      url: `${url_start}/question/${id}`,
    };
  
    try {
      const response = await axiosClient.request(config);
      console.log("in deleteQuestion", response.data);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete question with ID ${id}:`, error);
      throw error;
    }
  };