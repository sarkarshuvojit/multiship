import { HashRouter, Route, Routes } from 'react-router-dom';
import './App.css'
import MultishipGame from './components/multiship-game';
import BattleshipGenerator from './components/battleship-testcase-generator';

function App() {
  return (
    <>
      <HashRouter>
        <Routes>
          <Route path="/" element={<MultishipGame />} />
          <Route path="/debugging/tcgen" element={<BattleshipGenerator />} />
        </Routes>
      </HashRouter>
    </>
  )
}

export default App;
