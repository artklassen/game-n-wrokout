'use client'
import { useState, useEffect } from 'react';
import '@/styles/tailwindcss/components/results.scss';
import getDataFromPostgress from "@/utils/getDataFromPostgress";

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
                console.log('Creating new game entry:', game);
                acc[key] = {
                    ...game,
                    date: normalizedDate ? new Date(normalizedDate) : undefined,
                    exercises: []
                };
            }

            // Track seen exercises for this key
            const seenExercises = new Set(acc[key].exercises.map(e => e.exerciseName));

            game.exercises.forEach(incomingExercise => {
                // Check if the exercise has been seen in any prior games
                if (seenExercises.has(incomingExercise.exerciseName)) {
                    // Find existing exercise in the current game aggregation
                    const existingExercise = acc[key].exercises.find(e => e.exerciseName === incomingExercise.exerciseName);
                    if (existingExercise) {
                        console.log(`Adding amount ${incomingExercise.exerciseAmount} to existing exercise ${existingExercise.exerciseName}`);
                        existingExercise.exerciseAmount += incomingExercise.exerciseAmount;
                    }
                } else {
                    // It's the first occurrence in the incoming data
                    console.log(`Adding new exercise entry: ${incomingExercise.exerciseName}`);
                    acc[key].exercises.push({
                        exerciseName: incomingExercise.exerciseName,
                        exerciseAmount: incomingExercise.exerciseAmount
                    });
                    // Mark this exercise as seen
                    seenExercises.add(incomingExercise.exerciseName);
                }
            });

            return acc;
        }, {});

        return Object.values(aggregatedGames);
    };




    useEffect(() => {
        const eventSource = new EventSource('http://localhost:3002/events');
        eventSource.onmessage = (event) => {
            console.log("Incoming data:", event.data);
            const incomingGames = JSON.parse(event.data);
            const newGames = incomingGames.map((game: { exercise_name: any; exercise_amount: any; }) => ({
                ...game,
                // Construct the exercises array using the exerciseName and exerciseAmount, if they exist
                exercises: game.exercise_name && game.exercise_amount ? [{
                    exerciseName: game.exercise_name,
                    exerciseAmount: game.exercise_amount
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
                return (
                    <div className='game-card' key={index}>
                        <p className='date'>Date: {g.date ? g.date.toISOString().split('T')[0] : 'No date provided'}</p>
                        <p>User: {g.username}</p>
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
