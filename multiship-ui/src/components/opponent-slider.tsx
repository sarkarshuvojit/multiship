import { ChevronLeft, ChevronRight } from "lucide-react"
import GameGrid from "./game-grid"

interface OpponentSliderProps {
  opponents: string[]
  currentOpponent: number
  setCurrentOpponent: (index: number) => void
  opponentBoards: (string | null)[][][]
}

export default function OpponentSlider({
  opponents,
  currentOpponent,
  setCurrentOpponent,
  opponentBoards,
}: OpponentSliderProps) {
  const nextOpponent = () => {
    setCurrentOpponent((currentOpponent + 1) % opponents.length)
  }

  const prevOpponent = () => {
    setCurrentOpponent((currentOpponent - 1 + opponents.length) % opponents.length)
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent text-center">
          {opponents[currentOpponent]}
        </h2>
      </div>

      <div className="relative w-full max-w-md">
        {/* Navigation buttons */}
        <button
          onClick={prevOpponent}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
          aria-label="Previous opponent"
        >
          <ChevronLeft className="h-6 w-6 text-gray-600" />
        </button>

        <div className="w-full aspect-square">
          <GameGrid board={opponentBoards[currentOpponent]} />
        </div>

        <button
          onClick={nextOpponent}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
          aria-label="Next opponent"
        >
          <ChevronRight className="h-6 w-6 text-gray-600" />
        </button>
      </div>

      {/* Slider indicators */}
      <div className="flex gap-2 mt-4">
        {opponents.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentOpponent(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentOpponent
                ? "w-6 bg-gradient-to-r from-purple-500 to-pink-500"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
            aria-label={`View ${opponents[index]}`}
          />
        ))}
      </div>
    </div>
  )
}
