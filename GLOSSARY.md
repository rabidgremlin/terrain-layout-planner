# Terrain Layout Planning

The language used to describe wargame boards and their terrain arrangements.

## Language

**Board**:
The bounded playing surface on which a wargame takes place.
_Avoid_: Canvas

**Terrain layout**:
An arrangement of terrain pieces on a board that can be named, saved, and reopened as a whole.
_Avoid_: Terrain design

**Terrain piece**:
An individual terrain feature placed on a board.

**Terrain template**:
A reusable terrain design describing a footprint and its properties, available for placing pieces on a board.
_Avoid_: Layout template

**Terrain tag**:
A label attached to a terrain piece to describe a property such as cover, blocking, elevation, or danger. A piece may carry multiple tags simultaneously.

**Deployment zone**:
A region of the board designated for initial placement of a player's forces.

**Terrain footprint**:
The two-dimensional area occupied by a terrain piece when viewed from above.

**Terrain width**:
The side-to-side dimension of a terrain footprint on the playing surface, measured before rotation.

**Terrain depth**:
The front-to-back dimension of a terrain footprint on the playing surface, perpendicular to its width and measured before rotation.
_Avoid_: Terrain height (for footprint size)

**Terrain height**:
The vertical extent of physical terrain above the playing surface, distinct from its footprint dimensions.

**Terrain coverage**:
The proportion of the board occupied by at least one terrain footprint, with overlapping areas counted once and areas outside the board excluded.

**Tag coverage**:
Terrain coverage calculated using only pieces carrying a particular terrain tag. A shared area can contribute to several different tag coverage figures.

**Recommendation**:
Advisory guidance for a terrain layout; failing to meet it does not prevent editing or saving the layout.

**Visibility behaviour**:
How a terrain footprint affects top-down line of sight: clear, blocking, or dense. Dense terrain permits sight into or out of its footprint, but not through it to a target beyond.

**Maximum line of sight**:
The longest unobstructed straight sight line anywhere on the board under the planner's two-dimensional visibility rules.
