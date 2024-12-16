import React from 'react'
import './styles.css'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react';
import { createDeck } from '../../Services/Decks.js';
import { useAxios } from '../../Providers/AxiosProvider.js';
import { addUserDeck } from '../../Services/User.js';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import Select from 'react-select';
import { Multiselect } from "multiselect-react-dropdown";
import { useUserSession } from "../../Providers/UserProvider.js";




type FormValues = {
  deckname: String;
  deckdesc: String;
  rounds: {
    categories: string[];
    num_questions: string;
  }[]
};

const CreateDeck = () => {
  const { user } = useUserSession();
    const {register, 
          control,
          handleSubmit, 
          watch,
          getValues,
          formState: {errors}} = useForm({
            defaultValues: {
              deckname: '',
              deckdesc: '',
              rounds: [{ categories: [], num_questions: '' }]
            },
          });
      
    const axios = useAxios(); 
    const navigate = useNavigate();

    const {fields, append, remove} = useFieldArray({
      name: 'rounds',
      control
    });

    const category_options  = [
      'brain teasers',
      'entertainment',
      'world',
      'history',
      'pop culture',
      'stem',
      'kids',
      'religion',
      'newest',
      'sports',
      'tv',
      'general',
      'humanities',
    ];
    console.log(errors)
    console.log(watch())



    const deckName = watch('deckname')
    const deckDesc = watch('deckdesc')
    const rounds = watch('rounds')
    console.log(rounds)


    const createDeckFunc = async () => {
      //console.log(getValues('deckname'), getValues('deckdesc'), getValues('rounds'))

      createDeck(axios, deckName, deckDesc, rounds).then((ds) => {
        console.log('deck created:', ds);
        console.log(user.id, ds.id);
        addUserDeck(axios, user.id, ds.id).then((ud)=>{
           console.log('added to userDecks:', ud)
        }).catch((error)=>{
          console.error(error);
        });
        navigate(`/decks/${ds.id}`, {state: {deckId:ds.id, filter:true}});
      }).catch((error) => {
        console.error("Failed to create deck:", error);
      })

    };

    return (
        <div className='createpage'>
            <h1>Create a Deck!</h1>

            <form className='create-deck-form' onSubmit={handleSubmit((data) => {
              console.log(data)
            })}>
              <div>
              <label className='deckname'>Deck Name</label>
              <input {...register('deckname', {required: 'Your deck needs a name!'})}/>
              <p>{errors.deckname?.message}</p>
              </div>
              <div>
              <label className='deckdesc'>Description</label>
              <input {...register('deckdesc')}/>
              </div>
              <div className='rounds-form'>
                {fields.map((field, index) => {
                  return (
                    <>
                      <div className='deck-round-header'>
                      <h3>Round {index + 1}</h3>
                      {index > 0 && <button type="button" onClick={() => remove(index)}>Remove round</button>}
                    </div>
                    <div className="form-control" key={field.id}>
                      <label className='rounds_categories'>Categories</label>
                      <Controller control={control} {...register(`rounds.${index}.categories` as const)} render={({ field: {value, onChange} }) => (
                        <Multiselect  options={category_options} isObject={false} showCheckbox={true} closeOnSelect={false} onSelect={onChange} onRemove={onChange} selectedValues={value}/>
                      )}/>
                      
                      <label className='rounds_questions'>Number of questions</label>
                      <input type="number" min={1} max={100}  {...register(`rounds.${index}.num_questions` as const, { required: 'Please insert the number of questions'})}/>
                      </div>
                      </>
                  );
                })}
                  <button className='add-round-btn' type="button" onClick={() => append({ categories: [], num_questions: '' })}>+</button>
              </div>
            </form>
            <button type="button" className="submit-deck-button" onClick={() => createDeckFunc()}>Create</button>

        </div>
      );
    };
export default CreateDeck;