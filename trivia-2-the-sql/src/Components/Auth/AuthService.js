// import Parse from "parse";
import axios from "axios";

const api = 'http://127.0.0.1:8000/auth/'

export class User {
    constructor(username, password) {
        this.username = username;
        this.password = password
    }
}

export const createUser = (user) => {
    let data = JSON.stringify({
        "username": user.username,
        "password": user.password
    });

    let config = {
        method: 'post',
        url: api + 'register',
        headers: { 
            'Content-Type': 'application/json', 
            'Authorization': ''
        },
        data : data
    };

    axios.request(config).then((response) => {
        JSON.stringify(response.data);
        return response;
    }).catch((error) => {
        console.log(error);
    });
};

export const loginUser = async (user) => {
    let data = JSON.stringify({
        "username": user.username,
        "password": user.password
    });

    let config = {
        method: 'post',
        url: api + 'login',
        headers: { 
            'Content-Type': 'application/json', 
            'Authorization': ''
        },
        data : data
    };

    return await axios.request(config)
};