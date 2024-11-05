import Parse from "parse";

const api = 'http://127.0.0.1:8000/auth/'

export class User {
    constructor(username, password) {
        this.username = username;
        this.password = password
    }
}

export const createUser = (user) => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Credentials': true
        },
        body: {'username': user.username, 'password': user.password},
    };
    fetch(api + 'register', options).then((response) => {
        console.log(response.json())
        if (response.ok) {
            return response.json()
        }
    });
};
export const loginUser = () => { };