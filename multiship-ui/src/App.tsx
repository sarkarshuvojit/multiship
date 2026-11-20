import { HashRouter, Route, Routes } from 'react-router-dom';
import GameApp from './game/GameApp';
import BattleshipGenerator from './components/battleship-testcase-generator';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<GameApp />} />
        <Route path="/join/:code" element={<GameApp />} />
        <Route path="/debugging/tcgen" element={<BattleshipGenerator />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
