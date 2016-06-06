
# svgGearMotion

A simple, lightweight jQuery plugin for interactive animation of svg gears.

## Installation

Include script *after* the jQuery library (unless you are packaging scripts somehow else):

```html
<script src="/path/to/jquery.svgGearsMotion.min.js"></script>
```

**Do not include the script directly from GitHub (http://raw.github.com/...).** The file is being served as text/plain and as such being blocked
in Internet Explorer on Windows 7 for instance (because of the wrong MIME type). Bottom line: GitHub is not a CDN.


## Usage

Your svg must have and ID attribute. Gears graphic elements must be grouped in one SVG element (group, symbol...) with ID made of the same ID prefix followed by number starting from 1.

```html
<svg id="myGears" ...>
	<g id="gear1" >...</g>
	<g id="gear2" >...</g>
	<g id="gear3" >...</g>
	<g id="gear..." >...</g>
</svg>
```

Then call the plugin like this :

```javascript
$("#myGears").svgGearsMotion({
				gearsTeethNumbers: [16, -16, 8, -16, 8, -16, 8, -16, 16],
				gearsIdPrefix: "gear",
			});
```
The teeth number being the number of teeth for each gear in order of their ID. Positive numbers rotate in one direction, negative number in the opposite direction.

## Options

### gearsTeethNumbers

    array of numbers default [+8,-8,+8,-8,+8....]

The number of teeth for each gears, positive or negative set the rotation direction.

### gearsIdPrefix

    string default "gear"

Id prefix for each gear, gears should have ids gear1, gear2...


### speedBase

    number default 0.3

The initial rotation speed in deg/ms (then divided by number of teeth for each gear)


### speedDampenFactor

    number default 0.05

Speed dampen factor, rate at which gears rotation speed gets back to normal speed (set by speedBase) after the user has played with them.

### mouseInfluenceFactor

    number default 0.005

Strength of mouse influence, set it to very low number. 0 (no influence) to 1 (complete) factor

## Authors

[Sébastien Caunes]


