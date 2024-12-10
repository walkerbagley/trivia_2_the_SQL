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
        method: 'delete',
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

export const createTeam = async (axios, teamName, userID) => {
    let data = JSON.stringify({
        name: teamName,
        member_ids: [userID]
    });

    let config = {
        method: 'post',
        url: '/team/',
        data: data
    };
      
    try {
        const response = await axios.request(config);
        return response.data;
    } catch (error) {
        console.error("Failed to create team:", error);
        throw error;
    }
}

export const updateTeam = async (axios, teamID, newName) => {
    let data = JSON.stringify({
        name: newName,
    });

    let config = {
        method: 'put',
        url: '/team/' + teamID,
        data: data
    };
      
    try {
        const response = await axios.request(config);
        console.log(response);
        return response.data;
    } catch (error) {
        console.error("Failed to update team:", error);
        throw error;
    }
}