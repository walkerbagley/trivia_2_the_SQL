const url_start = 'http://127.0.0.1:8000';

// Get all users
export const getAllUsers = async (axiosClient) => {
  const config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `${url_start}/user`,
  };

  try {
    const response = await axiosClient.request(config);
    console.log("in getAllUsers", JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw error;
  }
};

// Get user status
export const getCurrentUserStatus = async (axiosClient) => {
  const config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `${url_start}/user/status`,
  };

  try {
    const response = await axiosClient.request(config);
    console.log("in getCurrentUserStatus", JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user status:", error);
    throw error;
  }
};

// Get a user by ID
export const getUserById = async (axiosClient, id) => {
  const config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `${url_start}/user/${id}`,
  };

  try {
    const response = await axiosClient.request(config);
    console.log("in getUserById", JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch user with ID ${id}:`, error);
    throw error;
  }
};

// Update a user
export const updateUser = async (axiosClient, id, user) => {
  const config = {
    method: 'put',
    maxBodyLength: Infinity,
    url: `${url_start}/user/${id}`,
    data: user,
  };

  try {
    const response = await axiosClient.request(config);
    console.log("in updateUser", response.data);
    return response.data;
  } catch (error) {
    console.error(`Failed to update user with ID ${id}:`, error);
    throw error;
  }
};

// Delete a user
export const deleteUser = async (axiosClient, id) => {
  const config = {
    method: 'delete',
    maxBodyLength: Infinity,
    url: `${url_start}/user/${id}`,
  };

  try {
    const response = await axiosClient.request(config);
    console.log("in deleteUser", response.data);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete user with ID ${id}:`, error);
    throw error;
  }
};

// Get a user's decks
export const getUserDecks = async (axiosClient, userId) => {
  const config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `${url_start}/user/${userId}/deck`,
  };

  try {
    const response = await axiosClient.request(config);
    console.log("in getUserDecks", JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch decks for user ID ${userId}:`, error);
    throw error;
  }
};

// Add a deck to a user
export const addUserDeck = async (axiosClient, userId, deckId) => {
  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `${url_start}/user/${userId}/deck/${deckId}`,
  };

  try {
    const response = await axiosClient.request(config);
    console.log("in addUserDeck", response.data);
    return response.data;
  } catch (error) {
    console.error(`Failed to add deck ${deckId} to user ID ${userId}:`, error);
    throw error;
  }
};

// Remove a deck from a user
export const removeUserDeck = async (axiosClient, userId, deckId) => {
  const config = {
    method: 'delete',
    maxBodyLength: Infinity,
    url: `${url_start}/user/${userId}/deck/${deckId}`,
  };

  try {
    const response = await axiosClient.request(config);
    console.log("in removeUserDeck", response.data);
    return response.data;
  } catch (error) {
    console.error(`Failed to remove deck ${deckId} from user ID ${userId}:`, error);
    throw error;
  }
};
