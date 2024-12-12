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


type FormValues = {
  deckname: String;
  deckdesc: String;
  rounds: {
    categories: string[];
    num_questions: string;
  }[]
};

const CreateDeck = () => {
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
      console.log(getValues('deckname'), getValues('deckdesc'), getValues('rounds'))

      try {
        const ds = await createDeck(axios, deckName, deckDesc, rounds);
        console.log('ds:', ds);
        navigate(`/decks/${ds.id}`, {state: {deckId:ds.id}});
        //const added = await addUserDeck(axios, deckName, deckDesc, ds.id);
      } catch (error) {
        console.error("Failed to create deck:", error);
      }

    };

    return (
        <div className='createpage'>
            <h1>Create a Deck!</h1>

            <form onSubmit={handleSubmit((data) => {
              console.log(data)
            })}>
              <div>
              <label className='deckname'>Enter Deck Name: </label>
              <input {...register('deckname', {required: 'Your deck needs a name!'})}/>
              <p>{errors.deckname?.message}</p>
              </div>
              <div>
              <label className='deckdesc'>Enter Deck Description: </label>
              <input {...register('deckdesc')}/>
              </div>
              <div>
              <label className='rounds'>Add Rounds: </label>
              <div>
                {fields.map((field, index) => {
                  return (
                    <div className="form-control" key={field.id}>
                      <label className='rounds_categories'>Choose categories: </label>
                      <Controller control={control} {...register(`rounds.${index}.categories` as const)} render={({ field: {value, onChange} }) => (
                        <Multiselect  options={category_options} isObject={false} showCheckbox={true} closeOnSelect={false} onSelect={onChange} onRemove={onChange} selectedValues={value}/>
                      )}/>
                      
                      <label className='rounds_questions'>Choose number of questions: </label>
                      <input type="number"  {...register(`rounds.${index}.num_questions` as const, { required: 'Please insert the number of questions'})}/>
                      {
                        (<button type="button" onClick={() => remove(index)}>Remove round</button>)
                      }
                    </div>
                  );
                })}
                  <button type="button" onClick={() => append({ categories: [], num_questions: '' })}>Add round</button>
              </div>
    
              </div>
            </form>
              
            <h3>Create the deck!</h3>
            <button type="button" className="create_button" onClick={() => createDeckFunc()}>Create</button>

        </div>
      );
    };
export default CreateDeck;