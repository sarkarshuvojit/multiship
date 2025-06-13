"use client"

interface GameGridProps {
  board: (string | null)[][]
  isPlayer?: boolean
  onCellClick?: (row: number, col: number) => void
}

export default function GameGrid({ board, isPlayer = false, onCellClick }: GameGridProps) {
  return (
    <div className="w-full h-full grid grid-cols-10 grid-rows-10 gap-1 p-1 bg-white rounded-lg shadow-md">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={`
              aspect-square w-full flex items-center justify-center 
              border border-gray-200 rounded-sm cursor-pointer
              transition-all duration-200 hover:bg-gray-50
              ${isPlayer ? "bg-gradient-to-br from-blue-50 to-blue-100" : "bg-gradient-to-br from-gray-50 to-gray-100"}
            `}
            onClick={() => onCellClick && onCellClick(rowIndex, colIndex)}
          >
            {cell}
          </div>
        )),
      )}
    </div>
  )
}
