import { useState } from 'react';

interface ShipTypeConfig {
  id?: number;
  type: string;
  direction: string;
  length: number
  count: number
  remaining: number
  x?: number
  y?: number
}


const BattleshipGenerator = () => {
  const [grid, setGrid] = useState(() => Array(10).fill(null).map(() => Array(10).fill(null)));
  const [selectedShip, setSelectedShip] = useState({ type: 'battleship', length: 4 });
  const [ships, setShips] = useState<ShipTypeConfig[]>([]);
  const [_isPlacing, setIsPlacing] = useState(false);
  const [_placementStart, setPlacementStart] = useState(null);
  const [placementPreview, setPlacementPreview] = useState<{x: number, y:number}[]>([]);
  const [placementDirection, setPlacementDirection] = useState('horizontal');
  
  const shipTypes = [
    { type: 'battleship', length: 4, count: 1, remaining: 1, color: 'bg-red-500' },
    { type: 'cruiser', length: 3, count: 2, remaining: 2, color: 'bg-blue-500' },
    { type: 'destroyer', length: 2, count: 3, remaining: 3, color: 'bg-green-500' },
    { type: 'submarine', length: 1, count: 4, remaining: 4, color: 'bg-yellow-500' }
  ];

  const [remainingShips, setRemainingShips] = useState<any>({
    battleship: 1,
    cruiser: 2,
    destroyer: 3,
    submarine: 4
  });

  const resetGrid = () => {
    setGrid(Array(10).fill(null).map(() => Array(10).fill(null)));
    setShips([]);
    setRemainingShips({
      battleship: 1,
      cruiser: 2,
      destroyer: 3,
      submarine: 4
    });
    setIsPlacing(false);
    setPlacementStart(null);
    setPlacementDirection('horizontal');
  };

  const placeShip = (startX: number, startY: number, direction: string) => {
    const newGrid = grid.map(row => [...row]);
    const shipId = ships.length;
    
    // Place ship on grid - allow placement even if it goes outside bounds or overlaps
    if (direction === 'horizontal') {
      for (let x = startX; x < startX + selectedShip.length; x++) {
        if (x < 10) { // Only place if within grid bounds
          newGrid[startY][x] = { shipId, type: selectedShip.type };
        }
      }
    } else {
      for (let y = startY; y < startY + selectedShip.length; y++) {
        if (y < 10) { // Only place if within grid bounds
          newGrid[y][startX] = { shipId, type: selectedShip.type };
        }
      }
    }
    
    setGrid(newGrid);
    // @ts-ignore
    setShips([...ships, {
      id: shipId,
      type: selectedShip.type,
      x: startX,
      y: startY,
      direction: direction === 'horizontal' ? 'Horizontal' : 'Vertical',
      length: selectedShip.length
    }]);
    
    // Always decrement but allow going below 0 for negative test cases
    setRemainingShips((prev: { [x: string]: number; }) => ({
      ...prev,
      // @ts-ignore
      [selectedShip.type]: prev[selectedShip.type] - 1
    }));
    
    return true;
  };

  const handleCellClick = (x: number, y: number) => {
    // Always allow placement for test case generation
    placeShip(x, y, placementDirection);
  };

  const updatePreview = (x: number, y: number) => {
    // Always show preview for test case generation
    const preview = [];
    if (placementDirection === 'horizontal') {
      for (let i = 0; i < selectedShip.length; i++) {
        // Show preview even if it goes outside bounds
        preview.push({ x: x + i, y });
      }
    } else {
      for (let i = 0; i < selectedShip.length; i++) {
        // Show preview even if it goes outside bounds
        preview.push({ x, y: y + i });
      }
    }
    
    setPlacementPreview(preview);
  };

  const clearPreview = () => {
    setPlacementPreview([]);
  };

  const getCellClass = (x: number, y: number) => {
    const cell = grid[y][x];
    let classes = 'w-8 h-8 border border-gray-400 cursor-pointer ';
    
    if (cell) {
      const shipType = shipTypes.find(s => s.type === cell.type);
      if (shipType == undefined) {
        console.error("Hema mataji")
      } else {
        classes += shipType.color + ' ';
      }
    } else {
      classes += 'bg-blue-100 hover:bg-blue-200 ';
    }
    
    // Check if this cell is in preview
    const isPreview = placementPreview.some(p => p.x === x && p.y === y);
    if (isPreview) {
      // Always show green for test case generator (no validation)
      classes += 'ring-2 ring-green-400 ';
    }
    
    return classes;
  };

  const generateConfig = () => {
    if (ships.length === 0) return 'Place ships on the grid to generate configuration...';
    
    const shipsByType = {
      battleship: ships.filter(ship => ship.type === 'battleship'),
      cruiser: ships.filter(ship => ship.type === 'cruiser'),
      destroyer: ships.filter(ship => ship.type === 'destroyer'),
      submarine: ships.filter(ship => ship.type === 'submarine')
    };
    
    let config = '[]ShipState{\n';
    
    // Add battleships (length 4)
    if (shipsByType.battleship.length > 0) {
      config += `\t\t\t\t// ${shipsByType.battleship.length}x Length 4${shipsByType.battleship.length !== 1 ? ' (Expected: 1)' : ''}\n`;
      shipsByType.battleship.forEach(ship => {
        config += `\t\t\t\t{X: ${ship.x}, Y: ${ship.y}, Dir: ${ship.direction}, Len: ${ship.length}},\n`;
      });
    }
    
    // Add cruisers (length 3)
    if (shipsByType.cruiser.length > 0) {
      config += `\t\t\t\t// ${shipsByType.cruiser.length}x Length 3${shipsByType.cruiser.length !== 2 ? ' (Expected: 2)' : ''}\n`;
      shipsByType.cruiser.forEach(ship => {
        config += `\t\t\t\t{X: ${ship.x}, Y: ${ship.y}, Dir: ${ship.direction}, Len: ${ship.length}},\n`;
      });
    }
    
    // Add destroyers (length 2)
    if (shipsByType.destroyer.length > 0) {
      config += `\t\t\t\t// ${shipsByType.destroyer.length}x Length 2${shipsByType.destroyer.length !== 3 ? ' (Expected: 3)' : ''}\n`;
      shipsByType.destroyer.forEach(ship => {
        config += `\t\t\t\t{X: ${ship.x}, Y: ${ship.y}, Dir: ${ship.direction}, Len: ${ship.length}},\n`;
      });
    }
    
    // Add submarines (length 1)
    if (shipsByType.submarine.length > 0) {
      config += `\t\t\t\t// ${shipsByType.submarine.length}x Length 1${shipsByType.submarine.length !== 4 ? ' (Expected: 4)' : ''}\n`;
      shipsByType.submarine.forEach(ship => {
        config += `\t\t\t\t{X: ${ship.x}, Y: ${ship.y}, Dir: ${ship.direction}, Len: ${ship.length}},\n`;
      });
    }
    
    config += '\t\t\t},';
    
    return config;
  };

  const totalShipsPlaced = ships.length;
  const totalShipsNeeded = 10;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Battleship Test Case Generator</h1>
      
      <div className="flex gap-8">
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-4">Game Grid (10x10)</h2>
          <div className="inline-block border-2 border-gray-600">
            <div className="grid grid-cols-10 gap-0">
              {grid.map((row, y) =>
                row.map((_, x) => (
                  <div
                    key={`${x}-${y}`}
                    className={getCellClass(x, y)}
                    onClick={() => handleCellClick(x, y)}
                    onMouseEnter={() => updatePreview(x, y)}
                    onMouseLeave={clearPreview}
                    title={`(${x}, ${y})`}
                  />
                ))
              )}
            </div>
          </div>
        </div>
        
        <div className="w-64">
          <h2 className="text-xl font-semibold mb-4">Ship Selection</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Direction:</label>
            <div className="flex gap-2">
              <button
                className={`px-3 py-1 rounded text-sm ${
                  placementDirection === 'horizontal' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
                onClick={() => setPlacementDirection('horizontal')}
              >
                Horizontal
              </button>
              <button
                className={`px-3 py-1 rounded text-sm ${
                  placementDirection === 'vertical' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
                onClick={() => setPlacementDirection('vertical')}
              >
                Vertical
              </button>
            </div>
          </div>
          
          <div className="space-y-2 mb-6">
            {shipTypes.map(ship => (
              <div
                key={ship.type}
                className={`p-3 border rounded cursor-pointer ${
                  selectedShip.type === ship.type ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                } ${remainingShips[ship.type] < 0 ? 'bg-red-50 border-red-300' : remainingShips[ship.type] === 0 ? 'bg-yellow-50 border-yellow-300' : ''}`}
                onClick={() => setSelectedShip({ type: ship.type, length: ship.length })}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium capitalize">{ship.type}</span>
                  <span className="text-sm">Length: {ship.length}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Remaining: {remainingShips[ship.type]} / {ship.count}
                  {remainingShips[ship.type] < 0 && (
                    <span className="text-red-600 font-semibold"> (Extra: {Math.abs(remainingShips[ship.type] ?? "?")})</span>
                  )}
                </div>
                <div className={`w-full h-2 ${ship.color} mt-1 rounded`}></div>
              </div>
            ))}
          </div>
          
          <div className="mb-4">
            <div className="text-sm text-gray-600">
              Ships Placed: {totalShipsPlaced} / {totalShipsNeeded}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(totalShipsPlaced / totalShipsNeeded) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={resetGrid}
              className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Reset Grid
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Generated Configuration</h2>
          <button
            onClick={() => navigator.clipboard.writeText(generateConfig())}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            disabled={totalShipsPlaced === 0}
          >
            Copy Config
          </button>
        </div>
        <pre className="bg-gray-100 p-4 rounded border overflow-x-auto text-sm">
          {totalShipsPlaced > 0 ? generateConfig() : 'Place ships on the grid to generate configuration...'}
        </pre>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Instructions:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li>Select a ship type from the right panel</li>
          <li>Choose horizontal or vertical direction</li>
          <li>Click on the grid to place ships (hover to preview)</li>
          <li><strong>Test case mode:</strong> Ships can overlap and extend beyond grid boundaries</li>
          <li><strong>Negative test cases:</strong> Place more/fewer ships than normal to test invalid configurations</li>
          <li>Generate any configuration needed for comprehensive testing</li>
        </ul>
      </div>
    </div>
  );
};

export default BattleshipGenerator;
