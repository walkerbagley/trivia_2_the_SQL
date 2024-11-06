const api = 'http://127.0.0.1:8000/'

export const getTeams = (axios) => {
    let config = {
        method: 'get',
        url: '/team/'
        // 'Authentication': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ3YmFnbGV5IiwiZXhwIjoxNzMxMDQ3MDQ4fQ.m18gTFfvEnoKtfS7yh4kO5ugj6UEyI43nS0oyvQ254o'
    };

    axios.get('/team/').then((response) => {
        console.log(JSON.stringify(response.data));
        return response;
    }).catch((error) => {
        console.log(error);
    });
}