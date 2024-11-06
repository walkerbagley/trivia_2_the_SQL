import React from 'react'
import './styles.css'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react';

const CreateDeck = () => {
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
  
    // Load data
    {/* useEffect(() => {
      fetch(`https://api.example.com/data?page=${page}`) // add question list
        .then(response => response.json())
        .then(data => setData(oldData => [...oldData, ...data]));
    }, [page]); */}
  
    // Handle scroll
    useEffect(() => {
      function handleScroll(event) {
        const { scrollTop, clientHeight, scrollHeight } = event.target;
  
        if (scrollHeight - scrollTop === clientHeight) {
          setPage(oldPage => oldPage + 1);
        }
      }
  
      const element = document.getElementById('questionlist');
      element.addEventListener('scroll', handleScroll);
  
      return () => {
        element.removeEventListener('scroll', handleScroll);
      };
    }, []);
    return (
        <div class='createpage'>
            <div id='questionlist' style={{ height: '200px', overflow: 'scroll' }}>
            </div>
        </div>
      );
}
export default CreateDeck;