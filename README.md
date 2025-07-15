# Tendril - Plant Growth Game

A web-based, turn-based strategy game where you grow a plant across a 2D cartesian landscape. The plant is modeled as a tree of branching line segments that can grow in any direction.

## Features

- **Cartesian Coordinate System**: Plants grow on a 2D plane with floating-point precision
- **Tree-like Plant Structure**: Plants are composed of connected line segments with branching
- **Turn-based Gameplay**: Strategic growth decisions with power allocation
- **Environment Zones**: Different areas affect plant growth (fertile, rocky, dry, etc.)
- **Power System**: Allocate points to Reach, Branching, Photosynthesis, and Resilience
- **Real-time Visualization**: Canvas-based rendering with interactive controls

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **State Management**: Zustand for game state
- **Rendering**: HTML5 Canvas for 2D graphics
- **Styling**: Tailwind CSS for responsive design

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tendril
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Play

### Basic Controls

1. **Start a New Game**: Click "New Game" to begin with a seedling at the center
2. **Select Growing Tip**: Choose which part of your plant to grow from
3. **Set Growth Direction**: Use the slider to choose growth angle (0-360°)
4. **Set Growth Distance**: Choose how far to grow (1-20 units)
5. **Allocate Powers**: Distribute points to enhance your plant's abilities
6. **Grow**: Click "Grow Plant" to extend your plant
7. **Next Turn**: Click "Next Turn" to continue and gain energy

### Plant Powers

- **Reach**: Increases maximum growth distance per turn
- **Branching**: Allows creating new growing tips from existing nodes
- **Photosynthesis**: Increases energy generation per turn
- **Resilience**: Helps survive in harsh environmental conditions

### Environment Zones

- **Fertile** (Green): Optimal growth conditions
- **Rocky** (Gray): Reduced growth, higher energy cost
- **Dry** (Yellow): Moderate growth penalty
- **Water** (Blue): Enhanced growth (future feature)
- **Shaded** (Slate): Reduced photosynthesis (future feature)

## Game Mechanics

### Plant Structure

Plants are represented as a tree of nodes connected by line segments:
- Each node has position (x, y), health, energy, and age
- Growing tips are active nodes that can extend
- Branches can be created from any node with branching power
- Plant thickness decreases as it grows further from the root

### Growth Rules

- Plants can only grow from growing tips
- Growth direction is specified in radians (0 = right, π/2 = up)
- Growth distance is limited by reach power
- New nodes inherit properties from their parent
- Environment affects growth efficiency and energy costs

### Turn Structure

1. Player selects growing tip
2. Player chooses growth direction and distance
3. Player allocates power points
4. Plant grows according to specifications
5. Energy is gained based on photosynthesis
6. Turn counter increments

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main game page
│   └── globals.css        # Global styles
├── components/
│   └── game/              # Game-specific components
│       ├── PlantCanvas.tsx    # Canvas rendering
│       └── GameControls.tsx   # Game controls UI
├── lib/
│   └── game-engine/       # Core game logic
│       ├── plant-growth.ts    # Plant growth engine
│       └── game-store.ts      # Zustand state management
└── types/
    └── game.ts            # TypeScript type definitions
```

## Development

### Key Components

- **PlantGrowthEngine**: Core logic for plant growth and branching
- **GameStore**: Zustand store for game state management
- **PlantCanvas**: Canvas component for rendering plant and environment
- **GameControls**: UI for player interactions

### Adding Features

The modular architecture makes it easy to add new features:

1. **New Powers**: Add to `GamePowers` interface and implement in engine
2. **Environment Types**: Extend `EnvironmentZone` types and rendering
3. **Game Mechanics**: Add new methods to `PlantGrowthEngine`
4. **UI Elements**: Create new components in `components/game/`

## Future Enhancements

- **Plant Reproduction**: Seeds and new plant colonies
- **Competition**: AI plants and resource competition
- **Weather System**: Dynamic environmental changes
- **Plant Varieties**: Different plant types with unique abilities
- **Multiplayer**: Competitive or cooperative play
- **Save/Load**: Persistent game state
- **Achievements**: Goals and progression system

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 