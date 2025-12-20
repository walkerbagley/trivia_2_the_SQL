
// Get a question by ID
export const getQuestionById = async (axiosClient, id) => {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `/question/${id}`,
    };
  
    try {
      const response = await axiosClient.request(config);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch question with ID ${id}:`, error);
      
    }
  };

  // Get all questions created by a specific user
  export const getMyQuestions = async (axiosClient, userId) => {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `/question/my/${userId}`,
    };
  
    try {
      const response = await axiosClient.request(config);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch questions for user ${userId}:`, error);
      throw error;
    }
  };
  
  // Create a new question
  export const createQuestion = async (axiosClient, question) => {
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `/question/`,
      data: question,
    };
  
    try {
      const response = await axiosClient.request(config);
      JSON.stringify(response.data);
      return response.data; // Returns the created question's ID
    } catch (error) {
      console.error("Failed to create question:", error);
      
    }
  };
  
  // Update an existing question
  export const updateQuestion = async (axiosClient, id, question) => {
    const config = {
      method: 'put',
      maxBodyLength: Infinity,
      url: `/question/${id}`,
      data: question,
    };
  
    try {
      const response = await axiosClient.request(config);
      return response.data;
    } catch (error) {
      console.error(`Failed to update question with ID ${id}:`, error);
      
    }
  };
  
  // Delete a question
  export const deleteQuestion = async (axiosClient, id) => {
    const config = {
      method: 'delete',
      maxBodyLength: Infinity,
      url: `/question/${id}`,
    };
  
    try {
      const response = await axiosClient.request(config);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete question with ID ${id}:`, error);
      
    }
  };


  export const getNewQuestion = async (axiosClient, category = null, difficulty = null) => {
    const params = new URLSearchParams();
    
    if (category) {
      params.append('category', category);
    }
    if (difficulty) {
      params.append('difficulty', difficulty);
    }

    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `/question/new/${params.toString() ? `?${params.toString()}` : ''}`,
    };
  
    try {
      const response = await axiosClient.request(config);
      return response.data;
    } catch (error) {
      console.error("Failed to roll new question:", error);
      throw error;
    }
  };

  export const getAvailableCategories = async (axiosClient) => {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: '/question/categories/',
    };
  
    try {
      const response = await axiosClient.request(config);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch available categories:", error);
      throw error;
    }
  };

  // Get a batch of questions with pagination and filters
  export const getQuestionBatch = async (axiosClient, options = {}) => {
    const {
      includeUserCreated = false,
      categories = null,
      attributes = null,
      difficulties = null,
      reviewStatus = null,
      pageSize = 25,
      pageNum = 1
    } = options;


    const difficulty_map = {
      "Any": null,
      "Easy": 1,
      "Medium": 2,
      "Hard": 3
    };

    const params = new URLSearchParams();
    
    if (includeUserCreated) {
      params.append('include_user_created', includeUserCreated);
    }
    
    if (categories && categories.length > 0) {
      categories.forEach(category => {
        if (category.toLowerCase() !== "any") {
          params.append('category', category);
        }
      });
    }
    
    if (attributes && attributes.length > 0) {
      attributes.forEach(attribute => {
        params.append('attribute', attribute);
      });
    }
    
    if (difficulties && difficulties.length > 0) {
      difficulties.forEach(difficulty => {
        if (difficulty.toLowerCase() !== "any") {
          const difficultyValue = difficulty_map[difficulty];
          if (difficultyValue !== undefined) {
            params.append('difficulty', difficultyValue);
          } else {
            console.error(`Invalid difficulty level: ${difficulty}`);
          }
        }
      });
    }

    if (reviewStatus && reviewStatus.toLowerCase() !== "all") {
      // Backend expects review_status as a list, so we send it as an array-like parameter
      params.append('review_status', reviewStatus);
    }
    
    params.append('page_size', pageSize);
    params.append('page_num', pageNum);

    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `/question/?${params.toString()}`,
    };
  
    try {
      const response = await axiosClient.request(config);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch question batch:", error);
      throw error;
    }
  };