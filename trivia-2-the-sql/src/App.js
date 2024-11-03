import './variables.css'
import { initializeParse } from '@parse/react';
import axios from 'axios';
import Components from './Components/Components';

initializeParse(
  'YOUR_SERVER_URL',
  'YOUR_APPLICATION_ID',
  'YOUR_JAVASCRIPT_KEY'
);

let isLoggedIn = false;

const App = () => {
//   const url = "";
//   const state = {
//     details : [],
//     user: "",
//   };

//   function componentDidMount() {

//     let data ;

//     axios.get('http://localhost:8000/')
//     .then(res => {
//         data = res.data;
//         this.setState({
//             details : data    
//         });
//     })
//     .catch(err => {})
//   }

    return (
      <Components/>
    );
};

export default App;
