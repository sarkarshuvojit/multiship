import { useState } from "react"
import GameGrid from "./game-grid"
import OpponentSlider from "./opponent-slider"

function getTheGrid(): number[][] {
  return Array(10).fill(Array(10).fill(null));
}

export default function BattleshipGame() {
  const [currentOpponent, setCurrentOpponent] = useState(0)

  // Sample data for demonstration
  const playerBoard = Array(10).fill(Array(10).fill(null))
  const opponentBoards = [Array(10).fill(Array(10).fill(null)), Array(10).fill(Array(10).fill(null))]

  const opponents = ["Opponent 1", "Opponent 2"]

  return (
    <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 items-center justify-center">
      {/* Left side - Opponent slider */}
      <div className="w-full md:w-1/2 flex flex-col items-center">
        <OpponentSlider
          opponents={opponents}
          currentOpponent={currentOpponent}
          setCurrentOpponent={setCurrentOpponent}
          opponentBoards={opponentBoards}
        />
      </div>

      {/* Right side - Player's board */}
      <div className="w-full md:w-1/2 flex flex-col items-center">
        <div className="w-full max-w-md aspect-square">
          <GameGrid board={playerBoard} isPlayer={true} />
        </div>
        <p className="mt-4 text-lg font-medium text-center">You</p>
      </div>
    </div>
  )
}

enum CellState {
  EMPTY = "EMPTY",
  SHIP_PLACED = "SHIP_PLACED",
  BOMB_FAILED = "BOMB_FAILED",
  BOMB_SUCCEEDED = "BOMB_SUCCEEDED",
  NEIBOUGHER_BOMBE = "NEIBOUGHER_BOMBED"
}

const CELL_STATE_COLORS: { [key in CellState]: string[] } = {
  EMPTY: ["bg-white"],
  SHIP_PLACED: ["bg-gray-700"], 
  BOMB_FAILED: ["bg-blue-300"],  // "animate-pulse"
  BOMB_SUCCEEDED: ["bg-red-600"], // "animate-ping"
  NEIBOUGHER_BOMBED: ["bg-gray-500"], 
};


function getRandomEnumValue<T extends object>(enumObj: T): T[keyof T] {
  const values = Object.values(enumObj) as T[keyof T][];
  const randomIndex = Math.floor(Math.random() * values.length);
  return values[randomIndex];
}

interface CellProps { 
  row: number; col: number; 
  cellState?: CellState;

  onClick: () => void; 
}

function getCellColorClassByState(state: CellState): string{
  return " " + CELL_STATE_COLORS[state].join(" ") + " ";
}

export function Cell({row, col, onClick, cellState = CellState.EMPTY}: CellProps) {

  return <div 
    className={"w-6 h-6 rounded border border-gray-300 cursor-pointer transition-colors" + getCellColorClassByState(cellState)}
    onClick={() => {
      console.log(`Clicked on ${row} x ${col}`);
      onClick();
    }}></div>
}

export interface BattleshipGridProps {
  grid: number[][];
  playerName: string;
  editable: boolean;
}

export function BattleshipGrid(props: BattleshipGridProps) {
  return (
  <div className="flex flex-col items-center">
    <div className="grid grid-cols-10 grid-rows-10 gap-0.5 bg-gray-300 p-1 rounded-lg shadow">
      {props.grid.flatMap((val, row, _arr) => {
        return val.flatMap((_val2, col, _arr2) => {
          return <Cell 
            row={row} 
            col={col} 
            cellState={getRandomEnumValue(CellState)}
            onClick={() => {
            console.log(`I am parent, i know when ${row} and ${col} are clicked`);
          }}/>
        });
      })}
    </div>
    <div className="mt-4 text-lg font-semibold text-gray-700 text-center">{props.playerName}</div>
  </div>
  );
}

export function GameScreen() {
  return (
    <div className="flex w-full max-w-5xl h-[540px] bg-white rounded-lg shadow-lg overflow-hidden">
    <div className="flex flex-col items-center justify-center w-1/2 bg-gray-50 relative">
      <button id="prevBtn" className="absolute top-1/2 left-2 -translate-y-1/2 bg-gray-200 hover:bg-gray-300 rounded-full p-2 shadow" aria-label="Previous">
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button id="nextBtn" className="absolute top-1/2 right-2 -translate-y-1/2 bg-gray-200 hover:bg-gray-300 rounded-full p-2 shadow" aria-label="Next">
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <div className="w-full flex flex-col items-center">
        <div id="opponentGrids">
          <BattleshipGrid 
            grid={getTheGrid()} 
            playerName={"Opps"} 
            editable={true} />
        </div>
        <div className="flex mt-4 space-x-2">
          <span id="dot0" className="w-3 h-3 rounded-full bg-gray-400"></span>
          <span id="dot1" className="w-3 h-3 rounded-full bg-gray-200"></span>
        </div>
      </div>
    </div>
    <div className="flex flex-col items-center justify-center w-1/2">
      <BattleshipGrid 
        grid={getTheGrid()} 
        playerName={"Dass you bitch"} 
        editable={true} />
    </div>
  </div>
  );
}
