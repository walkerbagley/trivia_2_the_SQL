import React from 'react'
import './styles.css'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react';
import { getQuestions, createDeck, updateDeck } from '../../Services/Decks.js';

const CreateDeck = () => {
    //let questionlist = [1,2,3,4,5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] 
    const [allQuestions, setQuestions] = useState([]);
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
  
    // Load data
    // useEffect(() => {
    //   getQuestions();
    //   .then(data => setData(oldData => [...oldData, ...data]));
    // }, [page]); 
  
    // Handle scroll
    useEffect(() => {
      const fetchQuestions = async () => {
        try {
          const ds = await getQuestions();
          setQuestions(ds);
        } catch (error) {
          console.error("Failed to fetch decks:", error);
        }
      };

      fetchQuestions();

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

    

    const [deck, setDeck] = useState({
      name: '',
      desc: ''
    });

    const handleChange = (event) => {
      setDeck({
        ...deck,
        [event.target.name]: event.target.value
      });
    };

    return (
        <div class='createpage'>
            <h1>Create a Deck!</h1>
            <div class="desc_info">
              <div class='deckname_div'>
                <label className='deckname' for="deckname">Enter Deck Name: </label>
                <input className='deckname' type="text" id="deckname" name="deckname" defaultValue={deck.name} required/>
              </div>
              <div class='deckdesc_div'>
                <label className='deckdesc' for="deckdesc">Enter Deck Description: </label>
                <input className='deckdesc' type="text" id="deckdesc" name="deckdesc" defaultValue={deck.desc}/>
              </div>
              <button type="submit" className="create_button" onClick={createDeck(deck.name, deck.desc)}>Create</button>
            </div>
            
            <h3>Add questions:</h3>
            <div id='questionlist' style={{ height: '300px', overflow: 'scroll' }}>
              <div className="grid-container">
                {allQuestions ?
                allQuestions.map((id) => (
                  <li>question description {id} <button onClick={updateDeck(deck.name, deck.desc)}>add</button></li>
              ))
              : <></>}
              
              </div>
            </div>
        </div>
      );
}
export default CreateDeck;