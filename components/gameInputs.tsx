// components/gameInputs.tsx
'use client'
import { useState, FormEvent } from 'react';
import '@/styles/tailwindcss/components/home.scss';
import axios from 'axios';

const Home: React.FC = () => {
    const [game, setGame] = useState<string>('');
    const [exerciseName, setExerciseName] = useState<string>('');
    const [exerciseAmount, setExerciseAmount] = useState<number | ''>('');

    // Inside your handleSubmit function
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await axios.post('//localhost:3002/api/form', { game, exerciseName, exerciseAmount });
            console.log(response.data); // Log response from the server
            // Clear form fields
            setGame('');
            setExerciseName('');
            setExerciseAmount('');
        } catch (error) {
            console.error('Error submitting form:', error);
            // Handle error
        }
    };

    return (
        <div>
            <h1>Save Data</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        What are you playing?:
                        <input type="text" value={game} onChange={(e) => setGame(e.target.value)} />
                    </label>
                </div>
                <div>
                    <label>
                        Exercise name:
                        <input type="text" value={exerciseName} onChange={(e) => setExerciseName(e.target.value)} />
                    </label>
                </div>
                <div>
                    <label>
                        Exercise amount:
                        <input
                            type="number"
                            value={exerciseAmount}
                            onChange={(e) => setExerciseAmount(e.target.value === '' ? '' : parseInt(e.target.value))}
                        />
                    </label>
                </div>
                <button type="submit">Save</button>
            </form>
        </div>
    );
};

export default Home;
