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

interface AggregatedGame extends Game {
    exercises: { exerciseName: string; exerciseAmount: number }[];
}

interface AggregatedGames {
    [key: string]: AggregatedGame;
}

const Results: React.FC = () => {
    const [games, setGames] = useState<Game[]>([]);

    const normalizeDate = (date: Date | undefined) => {
        if (!date) return undefined;
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const aggregateGames = (incomingGames: Game[]) => {
        const aggregatedGames = incomingGames.reduce<AggregatedGames>((acc, game) => {
            const normalizedDate = normalizeDate(game.date);
            const key = `${game.user}-${normalizedDate}`;

            if (!acc[key]) {
                acc[key] = {
                    ...game,
                    date: normalizedDate ? new Date(normalizedDate) : undefined,
                    exercises: [...game.exercises]
                };
            }

            // Loop over each exercise in the incoming game
            game.exercises.forEach(incomingExercise => {
                const existingExercise = acc[key].exercises.find(e => e.exerciseName === incomingExercise.exerciseName);
                if (existingExercise) {
                    // Add the exercise amount if the exercise already exists
                    existingExercise.exerciseAmount += incomingExercise.exerciseAmount;
                } else {
                    // Otherwise, add the new exercise to the list
                    acc[key].exercises.push({
                        exerciseName: incomingExercise.exerciseName,
                        exerciseAmount: incomingExercise.exerciseAmount
                    });
                }
            });

            return acc;
        }, {});

        return Object.values(aggregatedGames);
    };

    useEffect(() => {
        const eventSource = new EventSource('http://localhost:3002/events');
        eventSource.onmessage = (event) => {
            const incomingGames = JSON.parse(event.data);
            const newGames = incomingGames.map((game: { exerciseName: any; exerciseAmount: any; }) => ({
                ...game,
                // Construct the exercises array using the exerciseName and exerciseAmount, if they exist
                exercises: game.exerciseName && game.exerciseAmount ? [{
                    exerciseName: game.exerciseName,
                    exerciseAmount: game.exerciseAmount
                }] : []
            }));
            const aggregatedGames = aggregateGames(newGames);
            setGames(aggregatedGames);
        };

        return () => eventSource.close();
    }, []);


    return (
        <div className='results-container'>
            {games.map((g, index) => {
                console.log('Rendering game:', g); // Log each game being rendered
                return (
                    <div className='game-card' key={index}>
                        <p className='date'>Date: {g.date ? g.date.toISOString().split('T')[0] : 'No date provided'}</p>
                        <p>User: {g.user}</p>
                        <p>Game: {g.game}</p>
                        <p>Exercise count: {g.exercises.length}</p>
                        {g.exercises.length > 0 && <p>Exercises:</p>} {/* Updated condition */}
                        {g.exercises.map((ex, exIndex) => (
                            <p key={exIndex}>{ex.exerciseName} - {ex.exerciseAmount}</p>
                        ))}
                    </div>
                );
            })}

        </div>

    );
};

export default Results;
