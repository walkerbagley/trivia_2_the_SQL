const api = 'http://127.0.0.1:8000/'

export const getTeams = async (axios) => {
    let config = {
        method: 'get',
        url: '/team/'
    };

    try {
        const response = await axios.request(config);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch teams:", error);
        throw error;
    }
}

export const addMember = async (axios, teamID, userID) => {
    let config = {
        method: 'post',
        url: '/team/' + teamID + '/member/' + userID
      };
      
    try {
        const response = await axios.request(config);
        return response.data;
    } catch (error) {
        console.error("Failed to add user to team:", error);
        throw error;
    }
}

export const removeMember = async (axios, teamID, userID) => {
    let config = {
        method: 'del',
        url: '/team/' + teamID + '/member/' + userID
      };
      
    try {
        const response = await axios.request(config);
        return response.data;
    } catch (error) {
        console.error("Failed to add user to team:", error);
        throw error;
    }
}