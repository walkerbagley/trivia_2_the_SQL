// GameService.js

export const GameService = {
  async getAllGames(axiosClient) {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: '/game',
    };

    try {
      const response = await axiosClient.request(config);
      console.log("Games fetched successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching games:", error);
      throw error;
    }
  },

  async getGameById(axiosClient, gameId) {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `/game/${gameId}`,
    };

    try {
      const response = await axiosClient.request(config);
      console.log("Game details fetched successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching game details:", error);
      throw error;
    }
  },

  async createGame(axiosClient, gameData) {
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `/game`,
      data: gameData,
    };

    try {
      const response = await axiosClient.request(config);
      console.log("Game created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating game:", error);
      throw error;
    }
  },

  async joinGame(axiosClient, joinData) {
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `/game/join`,
      data: joinData,
    };

    try {
      const response = await axiosClient.request(config);
      console.log("Joined game successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error joining game:", error);
      throw error;
    }
  },

  async startGame(axiosClient, gameId) {
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `/game/${gameId}/start`,
    };

    try {
      const response = await axiosClient.request(config);
      return response;
    } catch (error) {
      console.error("Error starting game:", error);
      throw error;
    }
  },

  async deleteGame(axiosClient, gameId) {
    const config = {
      method: 'delete',
      maxBodyLength: Infinity,
      url: `/game/${gameId}`,
    };

    try {
      const response = await axiosClient.request(config);
      console.log("Game deleted successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error deleting game:", error);
      throw error;
    }
  },

  async getTeamNames(axiosClient, gameId) {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `/game/${gameId}/team`,
    };

    try {
      const response = await axiosClient.request(config);
      return response.data;
    } catch (error) {
      console.error("Error fetching team names:", error);
      throw error;
    }
  },

  async submitAnswer(axiosClient, gameId, answerData) {
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `/game/${gameId}/answer`,
      data: answerData,
    };

    try {
      const response = await axiosClient.request(config);
      console.log("Answer submitted successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error submitting answer:", error);
      throw error;
    }
  },

  async moveToNextQuestion(axiosClient, gameId) {
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `/game/${gameId}/next`,
    };

    try {
      const response = await axiosClient.request(config);
      console.log("Moved to next question successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error moving to next question:", error);
      throw error;
    }
  },

  async getGameScores(axiosClient, gameId) {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `/game/${gameId}/score`,
    };

    try {
      const response = await axiosClient.request(config);
      return response.data;
    } catch (error) {
      console.error("Error fetching game scores:", error);
      throw error;
    }
  },

  async leaveGame(axiosClient, gameId) {
    const config = {
      method: 'put',
      maxBodyLength: Infinity,
      url: `/game/${gameId}/leave`,
    };
  
    try {
      const response = await axiosClient.request(config);
      console.log(`Successfully left the game with ID: ${gameId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to leave the game with ID ${gameId}:`, error);
      throw error;
    }
  },

  async rejoinGame(axiosClient) {
    const config = {
      method: 'put',
      maxBodyLength: Infinity,
      url: `/game/rejoin`,
    };
  
    try {
      const response = await axiosClient.request(config);
      console.log(`Successfully rejoined the game`);
      return response.data;
    } catch (error) {
      console.error(`Failed to rejoin the game`, error);
      throw error;
    }
  },

  async endGame(axiosClient, gameId) {
    const config = {
      method: 'put',
      maxBodyLength: Infinity,
      url: `/game/${gameId}/end`,
    };
  
    try {
      const response = await axiosClient.request(config);
      console.log(`Successfully ended the game with ID: ${gameId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to end the game with ID ${gameId}:`, error);
      throw error;
    }
  }

};
