import { useState, useEffect } from 'react';
import { getQuestionBatch, getAvailableCategories } from '../../Services/Question';
import { useAxios } from '../../Providers/AxiosProvider';
import Select from 'react-select';

const QuestionReview = () => {
  const axios = useAxios();
  const [filters, setFilters] = useState({
    reviewStatus: 'all',
    category: [],
    difficulty: [],
    creator: ''
  });
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState(null);
  const [availableCategories, setAvailableCategories] = useState([]);

  const difficulties = ["Any", "Easy", "Medium", "Hard"];
  const reviewStatuses = ["Any", "Needs Review", "Not Reviewed", "Reviewed"];
  const includeUserCreated = false;

  // Load categories on component mount
  useEffect(() => {
    if (availableCategories.length) return;
    getAvailableCategories(axios)
      .then(categories => setAvailableCategories(["Any"].concat(categories)))
      .catch(err => console.error("Failed to fetch categories:", err));
  }, [axios]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleMultiSelectChange = (filterType, selectedOptions) => {
    const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setFilters(prev => ({
      ...prev,
      [filterType]: values
    }));
  };

  const handleSearch = () => {
    console.log("Searching with filters:", filters);
    setIsLoading(true);
    const options = {
      reviewStatus: filters.reviewStatus,
      categories: filters.category,
      difficulties: filters.difficulty,
      creator: filters.creator
    };

    getQuestionBatch(axios, options)
      .then(data => {
        setQuestions(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch questions:", err);
        setIsLoading(false);
      });
  };

  const handleQuestionSelect = (question) => {
    setSelectedQuestion(question);
    setEditMode(false);
    setEditedQuestion(null);
    if (!availableCategories.length) {
      getAvailableCategories(axios)
        .then(categories => setAvailableCategories(["Any"].concat(categories)))
        .catch(err => console.error("Failed to fetch categories:", err));
    }
  };

  const handleEditStart = () => {
    setEditMode(true);
    setEditedQuestion({ ...selectedQuestion });
  };

  const handleEditCancel = () => {
    setEditMode(false);
    setEditedQuestion(null);
  };

  const handleEditSave = () => {
    // TODO: Implement API call to save edited question
    setSelectedQuestion(editedQuestion);
    
    // Update question in the list
    setQuestions(prevQuestions =>
      prevQuestions.map(q =>
        q.id === editedQuestion.id ? editedQuestion : q
      )
    );
    
    setEditMode(false);
    setEditedQuestion(null);
  };

  const handleEditChange = (field, value) => {
    setEditedQuestion(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOptionChange = (index, value) => {
    setEditedQuestion(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const handleReviewAction = (action) => {
    if (selectedQuestion) {
      const updatedQuestion = { ...selectedQuestion, review_status: action };
      setSelectedQuestion(updatedQuestion);
      
      // Update question in the list
      setQuestions(prevQuestions =>
        prevQuestions.map(q =>
          q.id === selectedQuestion.id ? updatedQuestion : q
        )
      );
    }
  };

  const handleDeleteQuestion = () => {
    if (selectedQuestion && window.confirm('Are you sure you want to delete this question?')) {
      // TODO: Implement API call to delete question
      setQuestions(prevQuestions => 
        prevQuestions.filter(q => q.id !== selectedQuestion.id)
      );
      setSelectedQuestion(null);
    }
  };

  return (
    <div className="question-review">
      <div className="question-review__filters">
        <h2 className="question-review__section-title">Filter Questions</h2>
        <div className="question-review__filter-grid">
          <div className="question-review__filter-group">
            <label className="question-review__filter-label">Review Status:</label>
            <select
              value={filters.reviewStatus}
              onChange={(e) => handleFilterChange('reviewStatus', e.target.value)}
              className="question-review__filter-select"
            >
              <option value="all">All</option>
              {reviewStatuses.map(status => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="question-review__filter-group">
            <label className="question-review__filter-label">Category:</label>
            <Select
              isMulti
              name="categories"
              options={availableCategories.filter(cat => cat !== "Any").map(cat => ({ value: cat, label: cat }))}
              value={filters.category.map(cat => ({ value: cat, label: cat }))}
              onChange={(selectedOptions) => handleMultiSelectChange('category', selectedOptions)}
              className="question-review__multi-select"
              classNamePrefix="select"
              placeholder="Select categories..."
            />
          </div>

          <div className="question-review__filter-group">
            <label className="question-review__filter-label">Difficulty:</label>
            <Select
              isMulti
              name="difficulties"
              options={difficulties.filter(diff => diff !== "Any").map(diff => ({ value: diff, label: diff }))}
              value={filters.difficulty.map(diff => ({ value: diff, label: diff }))}
              onChange={(selectedOptions) => handleMultiSelectChange('difficulty', selectedOptions)}
              className="question-review__multi-select"
              classNamePrefix="select"
              placeholder="Select difficulties..."
            />
          </div>

          <div className="question-review__filter-group">
            <label className="question-review__filter-label">Creator:</label>
            <input
              type="text"
              placeholder="Enter creator username..."
              value={filters.creator}
              onChange={(e) => handleFilterChange('creator', e.target.value)}
              className="question-review__filter-input"
            />
          </div>
        </div>

        <button
          onClick={handleSearch}
          className="question-review__search-button"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Search Questions'}
        </button>
      </div>

      <div className="question-review__results">
        {questions.length > 0 && (
          <div className="question-review__question-list">
            <h3 className="question-review__section-title">Questions ({questions.length})</h3>
            <div className="question-review__list">
              {questions.map(question => (
                <div
                  key={question.id}
                  className={`question-review__question-item ${selectedQuestion?.id === question.id ? 'question-review__question-item--selected' : ''}`}
                  onClick={() => handleQuestionSelect(question)}
                >
                  <div className="question-review__question-preview">
                    <span className="question-review__question-text">{question.question}</span>
                    <div className="question-review__question-meta">
                      <span className={`question-review__status question-review__status--${question.review_status}`}>
                        Status: {question.review_status}
                      </span>
                      <span className="question-review__category">{question.category}</span>
                      <span className="question-review__difficulty">Difficulty: {question.difficulty}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedQuestion && (
          <div className="question-review__question-details">
            <div className="question-review__details-header">
              <h3 className="question-review__section-title">Question Details</h3>
              <div className="question-review__details-actions">
                {!editMode ? (
                  <>
                    <button
                      onClick={handleEditStart}
                      className="question-review__action-button question-review__action-button--edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleDeleteQuestion}
                      className="question-review__action-button question-review__action-button--danger"
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleEditSave}
                      className="question-review__action-button question-review__action-button--save"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="question-review__action-button question-review__action-button--cancel"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="question-review__details-card">
              {!editMode ? (
                <>
                  <div className="question-review__detail-row">
                    <span className="question-review__detail-label">Question:</span>
                    <span className="question-review__detail-value">{selectedQuestion.question}</span>
                  </div>
                  <div className="question-review__detail-row">
                    <span className="question-review__detail-label">Answer:</span>
                    <span className="question-review__detail-value">{selectedQuestion.answer}</span>
                  </div>
                  <div className="question-review__detail-row">
                    <span className="question-review__detail-label">Options:</span>
                    <div className="question-review__options-list">
                      {selectedQuestion.options.map((option, index) => (
                        <span
                          key={index}
                          className={`question-review__option ${option === selectedQuestion.answer ? 'question-review__option--correct' : ''}`}
                        >
                          {option}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="question-review__detail-row">
                    <span className="question-review__detail-label">Category:</span>
                    <span className="question-review__detail-value">{selectedQuestion.category}</span>
                  </div>
                  <div className="question-review__detail-row">
                    <span className="question-review__detail-label">Difficulty:</span>
                    <span className="question-review__detail-value">{selectedQuestion.difficulty}</span>
                  </div>
                  <div className="question-review__detail-row">
                    <span className="question-review__detail-label">Creator:</span>
                    <span className="question-review__detail-value">{selectedQuestion.creator}</span>
                  </div>
                  <div className="question-review__detail-row">
                    <span className="question-review__detail-label">Status:</span>
                    <span className={`question-review__detail-value question-review__status question-review__status--${selectedQuestion.review_status}`}>
                      {selectedQuestion.review_status}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="question-review__edit-row">
                    <label className="question-review__edit-label">Question:</label>
                    <textarea
                      value={editedQuestion.question}
                      onChange={(e) => handleEditChange('question', e.target.value)}
                      className="question-review__edit-textarea"
                    />
                  </div>
                  <div className="question-review__edit-row">
                    <label className="question-review__edit-label">Answer:</label>
                    <input
                      type="text"
                      value={editedQuestion.answer}
                      onChange={(e) => handleEditChange('answer', e.target.value)}
                      className="question-review__edit-input"
                    />
                  </div>
                  <div className="question-review__edit-row">
                    <label className="question-review__edit-label">Options:</label>
                    <div className="question-review__edit-options">
                      {editedQuestion.options.map((option, index) => (
                        <input
                          key={index}
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className="question-review__edit-option-input"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="question-review__edit-row">
                    <label className="question-review__edit-label">Category:</label>
                    <Select
                        value={availableCategories.filter(cat => cat !== "Any").find(cat => cat === editedQuestion.category) ? { value: editedQuestion.category, label: editedQuestion.category } : null}
                        name="category"
                        options={availableCategories.filter(cat => cat !== "Any").map(cat => ({ value: cat, label: cat }))}
                        onChange={(selectedOption) => handleEditChange('category', selectedOption ? selectedOption.value : '')}
                        className="question-review__edit-select"
                        classNamePrefix="select"
                        placeholder="Select category..."
                    />
                  </div>
                  <div className="question-review__edit-row">
                    <label className="question-review__edit-label">Difficulty:</label>
                    <Select
                        value={difficulties.filter(diff => diff !== "Any").find(diff => diff === editedQuestion.difficulty) ? { value: editedQuestion.difficulty, label: editedQuestion.difficulty } : null}
                        name="difficulty"
                        options={difficulties.filter(diff => diff !== "Any").map(diff => ({ value: diff, label: diff }))}
                        onChange={(selectedOption) => handleEditChange('difficulty', selectedOption ? selectedOption.value : '')}
                        className="question-review__edit-select"
                        classNamePrefix="select"
                        placeholder="Select difficulty..."
                    />
                  </div>
                </>
              )}

              {!editMode && selectedQuestion.review_status === 'pending' && (
                <div className="question-review__review-actions">
                  <button
                    onClick={() => handleReviewAction('approved')}
                    className="question-review__review-button question-review__review-button--approve"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReviewAction('rejected')}
                    className="question-review__review-button question-review__review-button--reject"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionReview;