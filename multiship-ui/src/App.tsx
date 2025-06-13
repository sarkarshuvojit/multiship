import './App.css'
import { GameScreen } from './components/battleship-game'

function App() {

  return (
    <>
      <div className="bg-gray-100 flex items-center justify-center min-h-screen">
        <GameScreen />
      </div>
    </>
  )
}

export default App;
