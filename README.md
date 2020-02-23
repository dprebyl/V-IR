# V-IR
This is an electric grid city simulation game we built for HackKU 2020. It was built using vanilla JavaScript with an HTML5 Canvas. All commits were before the deadline, apart from improving this readme file.

# [Play the game!](https://dprebyl.github.io/V-IR/)

The goal of the game is to build an electric grid that is both efficient and low cost. The game starts with a single house in the middle, which spread over time to nearby cells.

In the "World" box in the left column you can control the speed of the game, as well as save/load the game state from local storage. The rate is the number of real seconds that pass per in-game second, therefore higher numbers make the game slower.

The "Building" box lets you see information about the currently highlighted building (with the red outline on the board). On empty cells you can build generators and substations. You can then connect them with power poles. The lines that connect generators to substations are more expensive than the ones that connect to houses, but also more efficient. To select a different cell, simply click on it on the game board.

| Structure                 | Cost      | Capacity | Losses   | Notes                                       |
|---------------------------|-----------|----------|----------|---------------------------------------------|
| Empty lot (brown)         |           |          |          | Can only build on empty cells               |
| House (🏠)                 |           | 120 V    |          | Spread automatically                        |
| Generator (🏭)             | $50k      | 50 kV    |          |                                             |
| Substation (⚡)            | $10k      | 4 kV     |          |                                             |
| Thick power line (yellow) | $1k/tile  |          | 2%/tile  | Built from generator to substation          |
| Thin power line (orange)  | $200/tile |          | 10%/tile | Built from generator or substation to house |

The "Status" box displays the information about user actions (when the user placed a building, if the placement of a power pole is invalid, etc.).

The "Score" box shows the total money spent as well as the overall grid efficiency. Electricity is distrubited by scanning from the top-left to the bottom right in order for generators. Each generator then sends power to the destination (substation or generator) that is has the lowest percent power level of its maximum. This repeats until all its destinations have are full or it is out of power. It then repeats this distribution at each of its substations. This calculation is performed once per game second, and it determines the efficiency of the grid.