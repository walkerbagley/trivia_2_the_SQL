import React, {useEffect, useState} from 'react';
// import { useParams } from 'react-router-dom';
import './styles.css';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { getDeckQuestions, getDeck, getDeckRounds, updateRound, updateDeck, addQuestionToRound, removeQuestionFromRound, replaceQuestionInRound, addRound, deleteRound } from '../../../Services/Decks';
import { getAvailableCategories } from '../../../Services/Question.js';
import { useAxios } from '../../../Providers/AxiosProvider.js'
import { useUserSession } from "../../../Providers/UserProvider.js";
import { addUserDeck, removeUserDeck } from '../../../Services/User.js';
import Icon from '@mdi/react';
import { mdiPencilOutline, mdiCheck, mdiClose, mdiSync, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import { toast } from 'react-toastify';
import { maxQuestionsPerRound } from '../../../constants.js';
import { BackButton } from '../../Decks/BackButton/BackButton.js';

const DeckDetails =  () => {
  const { user } = useUserSession();
  const axios = useAxios(); 
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation(); 

  // const { deckId } = location.state || { deck: 'default value' };
  // const { id } = useParams();
  const [questions, setQuestions] = useState([]);
  const [rounds, setRounds] = useState({})
  const [deck, setDeck] = useState({});
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const [tempDescription, setTempDescription] = useState('');
  const [availableCategories, setAvailableCategories] = useState([]);
  const [showAddRoundForm, setShowAddRoundForm] = useState(false);
  const [newRoundCategory, setNewRoundCategory] = useState('');
  const [newRoundQuestions, setNewRoundQuestions] = useState(5);
  let num_rounds;

  const difficulties = [1, 2, 3];

  const fetchCategories = async () => {
    try {
      const categories = await getAvailableCategories(axios);
      setAvailableCategories(categories);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      // Fallback to empty array if fetch fails
      setAvailableCategories([]);
    }
  };

  const fetchDeck = async () => {
    try {
      const deck = await getDeck(axios, params.id);
      setDeck(deck);

      const qs = await getDeckQuestions(axios, deck.id);
      setQuestions(qs);

      const rs = await getDeckRounds(axios, deck.id);
      num_rounds = deck.rounds;
      
      // Convert array to object with round_number as key for easier access
      const roundsObject = {};
      rs.forEach((round, index) => {
        roundsObject[index] = round;
      });
      setRounds(roundsObject);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    }
  };

    useEffect(() => {
      fetchDeck();
      fetchCategories(); // Load categories in parallel
    }, [ ]);

    
    const addToUserDecks = async () => {
        addUserDeck(axios, user.id, deck.id).then((ud)=>{
            }).catch((error)=>{
              console.error(error);
        })
      }

    const removeFromUserDecks = async () => {
      const confirmed = window.confirm("Are you sure you want to remove this deck?");
      if (!confirmed) {
        return;
      }
      removeUserDeck(axios, user.id, deck.id).then(()=>{
     }).catch((error)=>{
       console.error(error);
    })
    }

    const rerollRound = async (round_id, cat, num) => {
      const confirmed = window.confirm("Are you sure you want to regenerate all questions for this round? This action cannot be undone.");
      if (!confirmed) {
        return;
      }
      updateRound(axios, round_id, cat, num).then(()=>{
      fetchDeck();
     }).catch((error)=>{
       console.error(error);
    })
    }

    const startEditingTitle = () => {
      setTempTitle(deck.name || '');
      setIsEditingTitle(true);
    };

    const startEditingDescription = () => {
      setTempDescription(deck.description || '');
      setIsEditingDescription(true);
    };

    const saveTitleEdit = () => {
      setDeck({...deck, name: tempTitle});
      setIsEditingTitle(false);
      setTempTitle('');
      updateDeck(axios, deck.id, tempTitle, deck.description).then(() => {
        console.log("Updated deck title");
        toast("Successfully updated deck name");
      }).catch((error) => {
        console.error("Failed to update deck title:", error);
        toast("Failed to update deck title");
      });
    };

    const saveDescriptionEdit = () => {
      setDeck({...deck, description: tempDescription});
      setIsEditingDescription(false);
      setTempDescription('');
      updateDeck(axios, deck.id, deck.name, tempDescription).then(() => {
        toast("Successfully updated deck description");
      }).catch((error) => {
        console.error("Failed to update deck description:", error);
        toast("Failed to update deck description");
      });
    };

    const cancelTitleEdit = () => {
      setIsEditingTitle(false);
      setTempTitle('');
    };

    const cancelDescriptionEdit = () => {
      setIsEditingDescription(false);
      setTempDescription('');
    };

    const handleAddQuestion = async (roundNumber, category, difficulty) => {
      try {
        // Calculate the correct question number for this specific round
        const questionsInRound = questions.filter(q => q.round_number === roundNumber + 1);
        const questionNumber = questionsInRound.length + 1;
        
        const response = await addQuestionToRound(
          axios, 
          rounds[roundNumber]["id"], 
          questionNumber, 
          category || null, 
          difficulty || null
        );
        
        if (!response || response.status < 200 || response.status >= 300) {
          throw new Error("Failed to add question to round");
        }
        
        const newQuestion = response.data.question;
        newQuestion.round_number = roundNumber + 1;
        
        toast("Question added successfully!");
        setQuestions([...questions, newQuestion]);
        console.log(questions)
      } catch (error) {
        console.error("Failed to add question:", error);
        toast("No questions available for the selected filters.");
      }
    };

    const handleRemoveQuestion = async (questionId, roundId) => {
      try {
        const confirmed = window.confirm("Are you sure you want to remove this question from the round? This cannot be undone.");
        if (!confirmed) {
          return;
        }
        
        const ret = await removeQuestionFromRound(axios, roundId, questionId);
        if (!ret || ret.status < 200 || ret.status >= 300) {
          throw new Error("Failed to remove question from round");
        }
        toast("Question removed successfully!");
        
        // Find the question being removed to get its round and position
        const removedQuestion = questions.find(q => q.id === questionId);
        if (!removedQuestion) return;
        
        // Filter out the removed question and update question numbers for the same round
        console.log(questions);
        const updatedQuestions = questions
          .filter(q => q.id !== questionId)
          .map(question => {
            if (question.round_number === removedQuestion.round_number && 
                question.question_number > removedQuestion.question_number) {
              return {
                ...question,
                question_number: question.question_number - 1
              };
            }
            return question;
          });
        
        setQuestions(updatedQuestions);
      } catch (error) {
        console.error("Failed to remove question:", error);
        toast("Failed to remove question from round.");
      }
    };

    const handleReplaceQuestion = async (questionId, roundId, questionNumber, roundIndex) => {
      try {
        const confirmed = window.confirm("Are you sure you want to regenerate this question? This cannot be undone.");
        if (!confirmed) {
          return;
        }
        const currentQuestion = questions.find(q => q.id === questionId);
        if (!currentQuestion || !currentQuestion.category) {
          throw new Error("Question not found");
        }
        const response = await replaceQuestionInRound(
          axios,
          roundId,
          questionId,
          questionNumber,
          currentQuestion.category,
          null
        );
        if (!response || response.status < 200 || response.status >= 300) {
          throw new Error("Failed to replace question in round");
        }
        const newQuestion = response.data.question;
        newQuestion.round_number = Math.floor(roundIndex) + 1;
        
        toast("Question replaced successfully!");
        
        const updatedQuestions = questions.map(q => 
          q.id === questionId ? newQuestion : q
        );
        setQuestions(updatedQuestions);
        
      } catch (error) {
        console.error("Failed to replace question:", error);
        toast("Failed to regenerate question. No questions available for the selected filters.");
      }
    };

    const handleAddNewRound = () => {
      setShowAddRoundForm(!showAddRoundForm);
    };

    const handleCreateNewRound = async () => {
      try {
        // Create categories array - if category is selected, use it, otherwise empty array
        const categories = newRoundCategory ? [newRoundCategory] : [];
        
        // Calculate the next round number based on current rounds
        const nextRoundNumber = Object.keys(rounds).length + 1;
        
        await addRound(axios, deck.id, newRoundQuestions, categories, [], nextRoundNumber);
        
        toast(`Successfully created new round with ${newRoundQuestions} questions${newRoundCategory ? ` in ${newRoundCategory}` : ''}!`);
        
        // Refresh the deck data to show the new round
        fetchDeck();
        
        // Reset form
        setShowAddRoundForm(false);
        setNewRoundCategory('');
        setNewRoundQuestions(5);
      } catch (error) {
        console.error("Failed to create new round:", error);
        toast("Failed to create new round. Please try again.");
      }
    };

    const handleCancelNewRound = () => {
      setShowAddRoundForm(false);
      setNewRoundCategory('');
      setNewRoundQuestions(5);
    };

    const handleDeleteRound = async (roundId, roundNumber) => {
      try {
        const confirmed = window.confirm(`Are you sure you want to delete Round ${roundNumber}? This will permanently remove all questions in this round and cannot be undone.`);
        if (!confirmed) {
          return;
        }
        
        await deleteRound(axios, roundId);
        
        toast(`Round ${roundNumber} deleted successfully!`);
        
        // Refresh the deck data to reflect the changes
        fetchDeck();
      } catch (error) {
        console.error("Failed to delete round:", error);
        toast("Failed to delete round. Please try again.");
      }
    };
 
    const getDefaultCategory = (roundCategories) => {
      if (roundCategories && roundCategories.length === 1) {
        return roundCategories[0];
      }
      return '';
    };

  const goBack = () => {
    navigate("/decks");
  }

  let addOrRemoveButton;
  if (!location.state.filter) {
    addOrRemoveButton = <button className='add-userdeck-btn' onClick={() => addToUserDecks()}>Add to my decks</button>
  } 
  else {
    addOrRemoveButton = <button className='add-userdeck-btn' onClick={() => removeFromUserDecks()}>Remove from my decks</button>
  }

let roundsDisplay = [];
for (const key in rounds) {
    roundsDisplay.push(
    <div key={key} className="round-container">
      <div className="round-header">
        <h3 className="round-title">Round {Number(key) + 1}</h3>
        <div className="round-actions">
          <button className='round-reroll-btn' onClick={() => rerollRound(rounds[key]["id"], rounds[key]["categories"], rounds[key]["num_questions"])}>Generate new questions</button>
          <button className='round-delete-btn' 
                  title={`Delete Round ${Number(key) + 1}`}
                  onClick={() => handleDeleteRound(rounds[key]["id"], Number(key) + 1)}>
            <Icon path={mdiTrashCanOutline} size={0.8} />
          </button>
        </div>
      </div>
    <ol className='questionlist'>
        {
          questions ?
          questions.map((question) => (
            <div key={question.id}>
                {question.round_number == Number(key) + 1 ? 
                  <li>
                    <div className='question'>{question.question.slice(0, 115)}</div>
                    <div className='question-actions'>
                      <button className='question-action-btn' title='Regenerate Question'
                              onClick={() => handleReplaceQuestion(question.id, rounds[key]["id"], question.question_number, Number(key))}>
                        <Icon path={mdiSync} size={0.8} />
                      </button>
                      <button className='question-action-btn' title='Remove Question'
                              onClick={() => handleRemoveQuestion(question.id, rounds[key]["id"])}>
                        <Icon path={mdiClose} size={0.8} />
                      </button>
                    </div>
                  </li> 
                : <></>}
              </div>
          ))
          : <></>
        }
      </ol>
      <div className="round-footer">
        <div className="add-question-container">
          <div className="question-filters">
          <select 
            defaultValue={getDefaultCategory(rounds[key]["categories"])}
            className="filter-dropdown"
            id={`category-${Number(key) + 1}`}
          >
            <option value="">Any Category</option>
            {availableCategories.map(category => (
              <option key={category} value={category}>
                {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
          <select 
            defaultValue=""
            className="filter-dropdown"
            id={`difficulty-${Number(key) + 1}`}
          >
            <option value="">Any Difficulty</option>
            {difficulties.map(diff => (
              <option key={diff} value={diff}>
                {diff}
              </option>
            ))}
          </select>
        </div>
        <button 
          className="add-question-btn" 
          title="Add Question to Round"
          onClick={() => {
            const categorySelect = document.getElementById(`category-${Number(key) + 1}`);
            const difficultySelect = document.getElementById(`difficulty-${Number(key) + 1}`);
            handleAddQuestion(
              Number(key),
              categorySelect.value || null,
              difficultySelect.value || null
            );
          }}
        >
          <Icon path={mdiPlus} size={1} />
          <span>Add Question</span>
        </button>
        </div>
      </div>
    </div>);
  }


  return (
    <div className="deckdetails-page">
      <div className="top-navigation">
        <BackButton onClick={goBack} />
        {addOrRemoveButton}
      </div>
      <div className="deck-header">
        <div className="deck-title-section">
          {isEditingTitle ? (
            <>
              <input 
                type="text" 
                value={tempTitle} 
                onChange={(e) => setTempTitle(e.target.value)}
                className="edit-input"
                placeholder="Deck name"
              />
              <div className="edit-buttons">
                <button className="save-btn" onClick={saveTitleEdit}>
                  <Icon path={mdiCheck} size={1} />
                </button>
                <button className="cancel-btn" onClick={cancelTitleEdit}>
                  <Icon path={mdiClose} size={1} />
                </button>
              </div>
            </>
          ) : (
            <>
              <h1>{deck.name}</h1>
              <button className="edit-deck-btn" onClick={startEditingTitle}>
                <Icon path={mdiPencilOutline} size={1} />
              </button>
            </>
          )}
        </div>
        <h5>Deck #{deck.id}</h5>
        <div className="deck-description-section">
          {isEditingDescription ? (
            <>
              <textarea 
                value={tempDescription} 
                onChange={(e) => setTempDescription(e.target.value)}
                className="edit-textarea"
                placeholder="Deck description"
                rows={3}
              />
              <div className="edit-buttons">
                <button className="save-btn" onClick={saveDescriptionEdit}>
                  <Icon path={mdiCheck} size={1} />
                </button>
                <button className="cancel-btn" onClick={cancelDescriptionEdit}>
                  <Icon path={mdiClose} size={1} />
                </button>
              </div>
            </>
          ) : (
            <>
              <h3>{deck.description}</h3>
              <button className="edit-deck-btn" onClick={startEditingDescription}>
                <Icon path={mdiPencilOutline} size={1} />
              </button>
            </>
          )}
        </div>
      </div>
      <h2>Rounds</h2>
      {roundsDisplay}
      <div className="add-round-section">
        {!showAddRoundForm ? (
          <button 
            className="add-round-btn"
            onClick={handleAddNewRound}
            title="Add New Round"
          >
            <Icon path={mdiPlus} size={1} />
            <span>Add New Round</span>
          </button>
        ) : (
          <div className="add-round-form">
            <h3>Add New Round</h3>
            <div className="round-form-controls">
              <div className="form-group">
                <label htmlFor="round-category">Category:</label>
                <select 
                  id="round-category"
                  className="round-form-dropdown"
                  value={newRoundCategory}
                  onChange={(e) => setNewRoundCategory(e.target.value)}
                >
                  <option value="">Any Category</option>
                  {availableCategories.map(category => (
                    <option key={category} value={category}>
                      {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="round-questions">Number of Questions:</label>
                <input 
                  type="number"
                  id="round-questions"
                  className="round-form-input"
                  min="1"
                  max={maxQuestionsPerRound}
                  value={newRoundQuestions}
                  onChange={(e) => setNewRoundQuestions(Math.min(maxQuestionsPerRound, Math.max(1, parseInt(e.target.value) || 1)))}
                />
              </div>
            </div>
            <div className="form-actions">
              <button className="create-round-btn" onClick={handleCreateNewRound}>
                <Icon path={mdiCheck} size={1} />
                <span>Create Round</span>
              </button>
              <button className="cancel-round-btn" onClick={handleCancelNewRound}>
                <Icon path={mdiClose} size={1} />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default DeckDetails;