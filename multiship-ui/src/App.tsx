import { HashRouter, Route, Routes } from 'react-router-dom';
import './App.css'
import AuthScreen from './components/auth.screen';
import BattleshipGenerator from './components/battleship-testcase-generator';

function App() {
  return (
    <>
      <HashRouter>
        <Routes>
          <Route path="/" element={<AuthScreen />} />
          <Route path="/debugging/tcgen" element={<BattleshipGenerator />} />
        </Routes>
      </HashRouter>
    </>
  )
}

export default App;
