import { useNavigate } from "react-router-dom";

const ScorePage = () => {
    const navigate = useNavigate();
    return (
        <div>
            Scores
            <button
                className="button-52"
                onClick={navigate('/')}>
                Home
            </button>
        </div>
    );

}

export default ScorePage;