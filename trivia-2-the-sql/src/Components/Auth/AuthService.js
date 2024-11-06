import Parse from "parse";

const api = 'http://127.0.0.1:8000/auth/'

export class User {
    constructor(username, password) {
        this.username = username;
        this.password = password
    }
}

export const createUser = (user) => {
    const axios = require('axios');
    let data = JSON.stringify({
    "username": user.username,
    "password": user.password
    });

    let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: api + 'register',
    headers: { 
        'Content-Type': 'application/json', 
        'Authorization': '••••••'
    },
    data : data
    };

    axios.request(config)
    .then((response) => {
    console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
    console.log(error);
    });
};
export const loginUser = () => { };