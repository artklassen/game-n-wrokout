'use client'
import React, { useState, useEffect } from 'react';
import getDataFromPostgres from '@/utils/getDataFromPostgress';

const GamesList = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGames = async () => {
            try {
                // Assume the username is provided somehow, e.g., from user state
                const username = 'exampleUser';
                const component = await getDataFromPostgres({ user: username });
                setGames(component.props.children);  // Assuming component is structured to return the data in props.children
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch games:', error);
                setLoading(false);
            }
        };

        fetchGames();
    }, []);  // The empty array ensures this effect runs only once after the component mounts

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {games.length > 0 ? games : <div>No games found.</div>}
        </div>
    );
};

export default GamesList;
