import { useState, useEffect } from 'react';

interface Game {
    _id: string;
    game: string;
    exerciseName: string;
    exerciseAmount: number;
    date?: Date;
}

const Results: React.FC = () => {
    // Define the state with the type Game[]
    const [games, setGames] = useState<Game[]>([]);

    useEffect(() => {
        const eventSource = new EventSource('http://localhost:3002/events');
        eventSource.onmessage = (event) => {
            const games: Game[] = JSON.parse(event.data); // Ensure the parsed data matches the Game[] type
            setGames(games);
        };

        return () => eventSource.close();
    }, []);

    return (
        <div>
            <h2>Games List</h2>
            {games.map((g, index) => (
                <div key={index}>
                    <p>Game: {g.game}</p>
                    <p>Exercise: {g.exerciseName} - {g.exerciseAmount}</p>
                </div>
            ))}
        </div>
    );
};

export default Results;
