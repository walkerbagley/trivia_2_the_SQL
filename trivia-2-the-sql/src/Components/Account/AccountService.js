import axios from "axios";

const api = 'http://127.0.0.1:8000/'

export const getTeams = () => {
    let config = {
        method: 'get',
        url: api + 'team',
        headers: { 
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ3YmFnbGV5IiwiZXhwIjoxNzMxMDQyNDIwfQ.FWKSc7vhfTnUTOquQ-zvM_7MeKGU6VetWUtE2d_EAMA'
        }
    };

    axios.request(config).then((response) => {
        console.log(JSON.stringify(response.data));
        return response;
    }).catch((error) => {
        console.log(error);
    });
}