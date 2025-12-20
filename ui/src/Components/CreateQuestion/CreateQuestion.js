import React, { useState } from 'react';
import './styles.css';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { createQuestion } from '../../Services/Question.js';
import { useAxios } from '../../Providers/AxiosProvider.js';
import { useUserSession } from "../../Providers/UserProvider.js";
import { BackButton } from '../Decks/BackButton/BackButton.js';
import { toast } from 'react-toastify';

const CreateQuestion = () => {
  const { user } = useUserSession();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      question: '',
      correct_answer: '',
      distractor1: '',
      distractor2: '',
      distractor3: '',
      difficulty: '1',
      category: 'general',
      is_private: false
    },
  });

  const axios = useAxios();
  const navigate = useNavigate();

  const goBack = () => {
    navigate("/account");
  };

  const onSubmit = async (data) => {
    const questionData = {
      question: data.question,
      correct_answer: data.correct_answer,
      distractors: [data.distractor1, data.distractor2, data.distractor3],
      difficulty: parseInt(data.difficulty),
      category: data.category || 'general',
      is_private: data.is_private,
      created_by: user.id
    };

    try {
      const result = await createQuestion(axios, questionData);
      toast.success('Question created successfully!');
      reset();
    } catch (error) {
      console.error("Failed to create question:", error);
      toast.error('Failed to create question. Please try again.');
    }
  };

  return (
    <div className='background-color'>
      <BackButton onClick={goBack} />
      <div className='createpage'>
        <h1>Create a Question!</h1>

        <form className='create-question-form' onSubmit={handleSubmit(onSubmit)}>
          <div className='form-section'>
            <label>Question</label>
            <textarea 
              {...register('question', { required: 'Question text is required!' })}
              rows={3}
              placeholder="Enter your question here..."
            />
            {errors.question && <p className='error-message'>{errors.question.message}</p>}
          </div>

          <div className='form-section'>
            <label>Correct Answer</label>
            <input 
              {...register('correct_answer', { required: 'Correct answer is required!' })}
              placeholder="Enter the correct answer"
            />
            {errors.correct_answer && <p className='error-message'>{errors.correct_answer.message}</p>}
          </div>

          <div className='form-section'>
            <label>Distractor 1</label>
            <input 
              {...register('distractor1', { required: 'Distractor 1 is required!' })}
              placeholder="Enter first incorrect answer"
            />
            {errors.distractor1 && <p className='error-message'>{errors.distractor1.message}</p>}
          </div>

          <div className='form-section'>
            <label>Distractor 2</label>
            <input 
              {...register('distractor2', { required: 'Distractor 2 is required!' })}
              placeholder="Enter second incorrect answer"
            />
            {errors.distractor2 && <p className='error-message'>{errors.distractor2.message}</p>}
          </div>

          <div className='form-section'>
            <label>Distractor 3</label>
            <input 
              {...register('distractor3', { required: 'Distractor 3 is required!' })}
              placeholder="Enter third incorrect answer"
            />
            {errors.distractor3 && <p className='error-message'>{errors.distractor3.message}</p>}
          </div>

          <div className='form-row'>
            <div className='form-section-inline'>
              <label>Difficulty</label>
              <select {...register('difficulty')}>
                <option value="1">Easy</option>
                <option value="2">Medium</option>
                <option value="3">Hard</option>
              </select>
            </div>

            <div className='form-section-inline checkbox-section'>
              <label>Private Question</label>
              <input 
                type="checkbox" 
                {...register('is_private')}
              />
            </div>
          </div>

          <button type="submit" className="submit-question-button">
            Create Question
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateQuestion;
