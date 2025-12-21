import React from 'react';
import './model.css';

const ScoresModal = ({ isOpen, onClose, scores }) => {
    if (!isOpen) return null;

    const getTrophyIcon = (index) => {
        if (index === 0) return '🥇';
        if (index === 1) return '🥈';
        if (index === 2) return '🥉';
        return '';
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Close on ESC key
    React.useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    return (
        <div className='modal-overlay' onClick={handleOverlayClick}>
            <div className='modal-content' onClick={(e) => e.stopPropagation()}>
                <div className='modal-header'>
                    <h2>Current Scores</h2>
                    <button 
                        className='modal-close' 
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>
                
                <div className='modal-body'>
                    <ol className='scores-list'>
                        {scores && scores.length > 0 ? (
                            [...scores]
                                .sort((a, b) => b.score - a.score)
                                .map((s, index) => (
                                    <li key={s.name} className='score-item'>
                                        <span className='score-rank'>
                                            {getTrophyIcon(index)} #{index + 1}
                                        </span>
                                        <span className='score-name'>{s.name}</span>
                                        <span className='score-points'>
                                            {s.score} pts
                                        </span>
                                    </li>
                                ))
                        ) : (
                            <p className='no-scores'>No scores available yet</p>
                        )}
                    </ol>
                </div>
                
                <div className='modal-footer'>
                    <button className='modal-btn' onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScoresModal;