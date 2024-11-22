import React from 'react'
import './styles.css'

const QuestionPage =  () => {

    return (
        <div>
            <div className='center'>
                <br />
                <h1 className='question-text'>Question</h1>
                <br/>
                <div className='grid-container'>
                    <div className='grid-item'>
                        <button>A: {}</button>
                    </div>
                    <div className='grid-item'>
                        <button>B: {}</button>
                    </div>
                    <div className='grid-item'>
                        <button>C: {}</button>
                    </div>
                    <div className='grid-item'>
                        <button>D: {}</button>
                    </div>
                </div>
                Current Answer: <br/>
                hello world
            </div>
            <hr/>
            <div className='margin-left'>
                <h3>Team Score: </h3>
            </div>
        </div>
    );
};
export default QuestionPage;