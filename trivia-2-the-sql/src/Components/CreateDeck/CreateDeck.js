import React from 'react'
import './styles.css'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react';
import { getDeckQuestions, createDeck, updateDeck, getSortedQuestions } from '../../Services/Decks.js';
import { useAxios } from '../../Providers/AxiosProvider.js'

const CreateDeck = () => {
    //let questionlist = [1,2,3,4,5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
    const axios = useAxios(); 
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
  
    // Load data
    // useEffect(() => {
    //   getQuestions();
    //   .then(data => setData(oldData => [...oldData, ...data]));
    // }, [page]); 
  
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

    

    const [deckName, setDeckName] = useState("")
    const [deckDesc, setDeckDesc] = useState("")
    const [questionCat, setQuestionCat] = useState("")
    const [questionNum, setQuestionNum] = useState("")
    const [allQuestions, setQuestions] = useState([]);

    const fetchDeckQuestions = async (deck_id) => {
      try {
        const qs = await getDeckQuestions(axios, deck_id);
        setQuestions(qs)
      } catch (error) {
        console.error("Failed to fetch decks:", error);
      }
    }

    const createDeckFunc = async (deckName, deckDesc, questionCat, questionNum) => {
      try {
        const ds = await createDeck(axios, deckName, deckDesc, questionCat, questionNum);
        console.log('ds:', ds);
        navigate(`/decks/${ds.id}`, {state: {deckId:ds.id}});
        fetchDeckQuestions(ds.id);
      } catch (error) {
        console.error("Failed to fetch decks:", error);
      }
    };


    return (
        <div className='createpage'>
            <h1>Create a Deck!</h1>
            <div className="desc_info">
              <div className='deckname_div'>
                <label className='deckname' for="deckname">Enter Deck Name: </label>
                <input className='deckname' type="text" id="deckname" name="deckname" value={deckName}  onChange={(e) => setDeckName(e.target.value)} required/>
              </div>
              <div className='deckdesc_div'>
                <label className='deckdesc' for="deckdesc">Enter Deck Description: </label>
                <input className='deckdesc' type="text" id="deckdesc" name="deckdesc" value={deckDesc} onChange={(e) => setDeckDesc(e.target.value)}/>
              </div>
              
            </div>
            
            <h3>Add questions:</h3>
            <div className='choose_questions'>
              <form>
                <label for="category">Choose a category: </label>
                <select id="category" name="category" onChange={(e) => setQuestionCat(e.target.value)}>
                  <option value="brain-teasers" >Brain Teasers</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="world">World</option>
                  <option value="history">History</option>
                  <option value="pop culture">Pop Culture</option>
                  <option value="stem">STEM</option>
                  <option value="kids">Kids</option>
                  <option value="religion">Religion</option>
                  <option value="newest">Newest</option>
                  <option value="sports">Sports</option>
                  <option value="tv">TV</option>
                  <option value="general">General</option>
                  <option value="humanities">Humanities</option>
                </select>
                <label for="num">How many questions would you like to add? </label>
                <input className='num' type="text" id="num" name="num" value={questionNum} onChange={(e) => setQuestionNum(e.target.value)}/>
              </form>
            </div>
            <button type="submit" className="create_button" onClick={() => createDeckFunc(deckName, deckDesc, questionCat, questionNum)}>Create</button>




            <div id='questionlist' style={{ height: '300px', overflow: 'scroll' }}>
              <div className="grid-container">
                {allQuestions ?
                allQuestions.map((question) => (
                  <li>{question.question} </li>
              ))
              : <></>}
              
              </div>
            </div>
        </div>
      );
    };
export default CreateDeck;