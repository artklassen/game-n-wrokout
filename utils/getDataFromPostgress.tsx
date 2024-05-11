import { sql } from '@vercel/postgres';

interface Game {
    id: number;
    quantity: number;
}

interface Params {
    user: string;
}

export default async function getDataFromPostgres(params: Params): Promise<JSX.Element> {
    // Corrected to use `params.user` assuming that's what you mean to filter by
    const { rows } = await sql<Game[]>`SELECT * FROM games WHERE user_id = ${params.user}`;

    return (
        <div>
            {rows.map((row) => (
                <div key={row.id}>
                    {row.id} - {row.quantity}
                </div>
            ))}
        </div>
    );
}
