import React from 'react';
import { useParams } from 'react-router-dom';
import './styles.css';

const DeckDetails =  () => {
  const { id } = useParams();

  console.log('hello world', id);

  return (
    <div className="deckdetails">
      <h1>Deck #{id}</h1>
      <h2>Questions</h2>
      <ol>
        <li>hello world</li>
      </ol>
    </div>
  );
}
export default DeckDetails;