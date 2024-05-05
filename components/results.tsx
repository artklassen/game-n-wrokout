import { useState, useEffect } from 'react';
import '@/styles/tailwindcss/components/results.scss';

interface Exercise {
    exerciseName: string;
    exerciseAmount: number;
}

interface Game {
    _id: string;
    user: string;
    game: string;
    exercises: Exercise[];
    date?: Date;
}

const Results: React.FC = () => {
    const [games, setGames] = useState<Game[]>([]);

    const normalizeDate = (date: Date | undefined) => {
        if (!date) return undefined;
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const aggregateGames = (incomingGames: Game[]) => {
        const aggregatedGames = incomingGames.reduce((acc, game) => {
            const normalizedDate = normalizeDate(game.date);
            const key = `${game.user}-${normalizedDate}`;
            if (acc[key]) {
                const existingExercise = acc[key].exercises.find(e => e.exerciseName === game.exerciseName);
                if (existingExercise) {
                    existingExercise.exerciseAmount += game.exerciseAmount;
                } else {
                    acc[key].exercises.push({ exerciseName: game.exerciseName, exerciseAmount: game.exerciseAmount });
                }
            } else {
                acc[key] = {
                    ...game,
                    exercises: [{ exerciseName: game.exerciseName, exerciseAmount: game.exerciseAmount }],
                    date: normalizedDate ? new Date(normalizedDate) : undefined
                };
            }
            return acc;
        }, {});

        return Object.values(aggregatedGames);
    };

    useEffect(() => {
        const eventSource = new EventSource('http://localhost:3002/events');
        eventSource.onmessage = (event) => {
            const newGames: Game[] = JSON.parse(event.data).map(game => ({
                ...game,
                exercises: [{ exerciseName: game.exerciseName, exerciseAmount: game.exerciseAmount }]
            }));
            const aggregatedGames = aggregateGames(newGames);
            setGames(aggregatedGames);
        };

        return () => eventSource.close();
    }, []);

    return (
        <div className='results-container'>
            {games.map((g, index) => (
                <div className='game-card' key={index}>
                    <p className='date'>Date: {g.date ? g.date.toISOString().split('T')[0] : 'No date provided'}</p>
                    <p>User: {g.user}</p>
                    <p>Game: {g.game}</p>
                    {g.exercises.length > 1 && <p>Exercises:</p>}  {/* Conditional rendering based on the number of exercises */}
                    {g.exercises.map((ex, exIndex) => (
                        <p key={exIndex}>{g.exercises.length > 1 ? `${ex.exerciseName} - ${ex.exerciseAmount}` : `Exercise: ${ex.exerciseName} - ${ex.exerciseAmount}`}</p>
                    ))}
                </div>
            ))}
        </div>

    );
};

export default Results;
