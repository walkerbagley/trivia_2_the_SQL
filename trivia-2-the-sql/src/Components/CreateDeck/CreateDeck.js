import React from 'react'
import './styles.css'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react';
import { createDeck, addRound } from '../../Services/Decks.js';
import { useAxios } from '../../Providers/AxiosProvider.js';

const CreateDeck = () => {
    const axios = useAxios(); 
    const navigate = useNavigate();

    const [deckName, setDeckName] = useState("");
    const [deckDesc, setDeckDesc] = useState("");
    const [questionCat, setQuestionCat] = useState("");
    const [questionNum, setQuestionNum] = useState("");
    const [rounds, setRounds] = useState([]);
    const [addRounds, setAddRounds] = useState([]);


    const createDeckFunc = async (deckName, deckDesc, rounds) => {
      try {
        const ds = await createDeck(axios, deckName, deckDesc, rounds);
        console.log('ds:', ds);
        navigate(`/decks/${ds.id}`, {state: {deckId:ds.id}});
      } catch (error) {
        console.error("Failed to fetch decks:", error);
      }
    };

    const addRoundFunc = async (questionCat, questionNum) => {
      try {
        const round = await addRound(axios, questionCat, questionNum);
        console.log('round:', round);
        setRounds(rounds.append(round));
      } catch (error) {
        console.error("Failed to add round:", error);
      }
    };

    const generateAddRound = () => {
      const round = (        
        <div>
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
        <button type="submit" className="create_button" onClick={() => addRoundFunc(questionCat, questionNum)}>Add</button>
        </div>);
      setAddRounds([...addRounds, round]);
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
            
            <h3>Add rounds:</h3>
            {addRounds.map((item, i) => (<ul>{item}</ul>))}
            <button type="submit" className="create_button" onClick={() => generateAddRound()}>Add Round</button>

            <h3>Create the deck!</h3>
            <button type="submit" className="create_button" onClick={() => createDeckFunc(deckName, deckDesc, rounds)}>Create</button>

        </div>
      );
    };
export default CreateDeck;