// pages/index.tsx
'use client'
import Results from '@/components/results';
import GameInputs from '@/components/gameInputs';
import '@/styles/tailwindcss/components/home.scss';


const Home: React.FC = () => {
  return (
      <div>
      <GameInputs/>
      <Results/>
      </div>
  );
};

export default Home;
