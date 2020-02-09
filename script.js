// Timing
var gameTime = 0; // Incremental counter of seconds of game time passed
var gameRate = 1; // How many real second pass per game second

// Board layout
const GRID_SIZE = 60;
const CELL_SIZE = 24;
var grid = [];
var canvas;
var ctx;

// Building types
const VACANT = 0;
const HOUSE = 1;
const GENERATOR = 2;
const SUBSTATION = 3;

// Building type data
const BUILDING_NAMES = ["Empty lot", "House", "Power generator", "Power substation"];
const BUILDING_COLORS = ["#80340b", "lime", "gray", "aqua"];
const BUILDING_EMOJIS = ["", "🏠", "🏭", "⚡"];
const BUILDING_COST = [0, 0, 50, 10];
const POWER_CAPS = [0, 120, 50000, 4000];
const LINE_RESISTANCE = [1, .02, 1, .1];
const LINE_COST = [0, 1, .2, 0]; // thousand dollars per tile
const LINE_COLOR = ["black", "black", "yellow", "orange"];
const LINE_SIZE = [1, 1, 7, 5];

// Random generation
const MAX_SPREAD_DISTANCE = 10;

// Interaction
var placingPole = false;
var curX = Math.floor(GRID_SIZE/2), curY = Math.floor(GRID_SIZE/2); // Last clicked cell

// Score
var cost = 0;
var totalPowerSent = 0, totalPowerReceived = 0; // For efficiency

var grid = {
	cells: [],
	init: () => {
		for (var y = 0; y < GRID_SIZE; y++) {
			grid.cells[y] = []
			for (var x = 0; x < GRID_SIZE; x++) {
				grid.cells[y][x] = {type: VACANT, powerLevel: 0};
			}
		}
	},
	getCellType: (x, y) => grid.cells[y][x].type,
	setCellType: (x, y, val) => { grid.cells[y][x].type = val; },
	forEachCell: callback => {
		for (var y = 0; y < GRID_SIZE; y++) {
			for (var x = 0; x < GRID_SIZE; x++) {
				callback(grid.cells[y][x], x, y);
			}
		}
	},
	getPowerPercent: (x, y) => grid.cells[y][x].powerLevel/POWER_CAPS[grid.getCellType(x, y)],
};

window.addEventListener("DOMContentLoaded", (event) => {
	grid.init();
	canvas = document.getElementById("board");
	ctx = canvas.getContext("2d");
	
	// Make the canvas not look ugly
	var pixelRatio = window.devicePixelRatio;
	canvas.width = GRID_SIZE*CELL_SIZE;
	canvas.height = GRID_SIZE*CELL_SIZE;
	canvas.style.width = GRID_SIZE*CELL_SIZE/pixelRatio + "px";
	canvas.style.height = GRID_SIZE*CELL_SIZE/pixelRatio + "px";
	//ctx.scale(1, 1);
	
	canvas.addEventListener("click", (event) => {
		var x = Math.floor(pixelRatio*event.offsetX/CELL_SIZE);
		var y = Math.floor(pixelRatio*event.offsetY/CELL_SIZE);
		clickCell(x, y);	
	});
	
	// Add first house
	grid.setCellType(Math.floor(GRID_SIZE/2), Math.floor(GRID_SIZE/2), HOUSE);
	
	drawGrid();
	prevTick = Date.now();
    tick();
	
	// Testing - auto place buildings
	/*placeBuilding(0, 0, GENERATOR);
	placeBuilding(2, 2, SUBSTATION);
	placeBuilding(50, 30, HOUSE);
	startPole(0, 0);
	clickCell(2, 2);
	startPole(2, 2);
	clickCell(50, 30);*/
});

function statusMsg(msg) {
	document.getElementById("status").innerText = msg;
}

function clickCell(x, y) {
	curX = x;
	curY = y;
	var type = grid.getCellType(x, y);
	if (placingPole !== false) {
		if (grid.cells[y][x].type == VACANT) {
			statusMsg("Power pole cannot connect to vacant cell.");
		}
		else if (x == placingPole[0] && y == placingPole[1]) {
			statusMsg("Power pole cannot connect building to itself!");
		}
		else if (type == GENERATOR) {
			statusMsg("Power poles cannot end at a generator (but they can start there).");
		}
		else {
			grid.cells[placingPole[1]][placingPole[0]].poles.push([x, y]);
			placingPole = false;
			statusMsg("Power pole placed");
		}
	}
	else if (type == VACANT) {
		grid.cells[y][x].poles = [];
	}
	showBuildingInfo(x, y, type);
	drawGrid();
}

function showBuildingInfo(x, y, type) {
	var output = "Building type: " + BUILDING_NAMES[type];
	output += "<br>Power level: " + Math.round(grid.cells[y][x].powerLevel) + "/" + POWER_CAPS[type] + " V";
	if (type == VACANT) {
		output += "<br><input type='button' value='Add generator' onclick='placeBuilding("+x+", "+y+", "+GENERATOR+")'>";
		output += "<br><input type='button' value='Add substation' onclick='placeBuilding("+x+", "+y+", "+SUBSTATION+")'>";
	}
	else if (type == GENERATOR || type == SUBSTATION) {
		output += "<br><input type='button' value='Add power pole' onclick='startPole("+x+", "+y+")'>";
	}
	document.getElementById("buidingInfo").innerHTML = output;
}

function placeBuilding(x, y, type) {
	grid.setCellType(x, y, type);
	if (type == GENERATOR || type == SUBSTATION) {
		grid.cells[y][x].poles = [];
	}
	showBuildingInfo(x, y, type);
	statusMsg("Placed " + BUILDING_NAMES[type]);
	drawGrid();
}

function startPole(x, y) {
	if (placingPole === false) {
		placingPole = [x, y];
		statusMsg("Select endpoint of power pole");
	}
	else {
		placingPole = false;
		statusMsg("Pole placement canceled");
	}
}

function drawGrid() {
	ctx.font = "20px Arial";
	grid.forEachCell((cell, x, y) => {
		drawSquare(x, y, BUILDING_COLORS[cell.type]);
		ctx.fillText(BUILDING_EMOJIS[cell.type], x*CELL_SIZE, (y+1)*CELL_SIZE-5);
	});
	grid.forEachCell((cell, x, y) => {
		if ("poles" in cell){
			for(var i = 0; i < cell.poles.length; i++){
				ctx.beginPath();
				ctx.lineWidth = LINE_SIZE[grid.getCellType(x, y)];
				ctx.strokeStyle = LINE_COLOR[grid.getCellType(x, y)];
				ctx.moveTo(((CELL_SIZE*x)+(CELL_SIZE/2)), ((CELL_SIZE*y)+(CELL_SIZE/2)));
				ctx.lineTo(((CELL_SIZE*cell.poles[i][0])+(CELL_SIZE/2)), ((CELL_SIZE*cell.poles[i][1])+(CELL_SIZE/2)));
				ctx.stroke();
			}
		}
	});
	ctx.strokeStyle = "red";
	ctx.lineWidth = "3";
	ctx.strokeRect(curX*CELL_SIZE, curY*CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

function drawSquare(x, y, color) {
	ctx.fillStyle = color;
	ctx.strokeStyle = "black";
	ctx.lineWidth = "1";
	ctx.fillRect(x*CELL_SIZE, y*CELL_SIZE, CELL_SIZE, CELL_SIZE);
	ctx.strokeRect(x*CELL_SIZE, y*CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

function tick() {
	var tickStart = Date.now();
	gameTime++;
	document.querySelector("#gameTime").innerText = gameTime;
	if (Math.random() > .2) spreadHouses();
	
	totalPowerSent = 0;
	totalPowerReceived = 0;
	cost = 0;
	
	// Consume power
	grid.forEachCell((cell, x, y) => {
		if (cell.type == HOUSE) {
			grid.cells[y][x].powerLevel = 0; // Can differ this by time of day
		}
		cost += BUILDING_COST[grid.getCellType(x, y)];
	});
	
	// Generate and distribute power
	grid.forEachCell((cell, x, y) => {
		if (cell.type == GENERATOR) {
			grid.cells[y][x].powerLevel = POWER_CAPS[GENERATOR];
			distributeElectricity(x, y);
		}
	});
	
	// Update displays
	showBuildingInfo(curX, curY, grid.getCellType(curX, curY));
	document.getElementById("cost").innerText = Math.round(cost);
	document.getElementById("efficiency").innerText = Math.round(totalPowerReceived/totalPowerSent*100);
	
	// Delay until time for next tick
	gameRate = parseFloat(document.getElementById("timeScale").value);
	setTimeout(tick, (1000-(Date.now()-tickStart))*gameRate);
}

function distance(x1, y1, x2, y2){
	return Math.sqrt(Math.pow((x1-x2),2) + Math.pow((y1-y2),2));
}

function resistance(dist, x2, y2){
	return dist*LINE_RESISTANCE[grid.getCellType(x2, y2)];
}

function distributeElectricity(x, y) {
	// Follow each line from the generator and distribute to buildings most in need by % of cap
	// Calculate resistance during distribution, recurse at substations
	
	var powerLeft = grid.cells[y][x].powerLevel;
	
	var lineEnds = grid.cells[y][x].poles;
	// Sort lineEnds by power percent of each building
	lineEnds.sort((coords1, coords2) => {
		grid.getPowerPercent(coords1[0], coords1[1]) - grid.getPowerPercent(coords2[0], coords2[1]);
	});
	
	for (var end = 1; end < lineEnds.length+1; end++) {
		// The percent of power the next node in the list has (or 100% if at end of list)
		var nextEndPower = (end == lineEnds.length ? 1 : grid.getPowerPercent(lineEnds[end][0], lineEnds[end][1]));
		
		for (var i = 0; i < end; i++) {
			var dist = distance(x, y, lineEnds[i][0], lineEnds[i][1]);
			cost += dist*LINE_COST[grid.getCellType(lineEnds[i][0], lineEnds[i][1])];
			
			// Calculate resistance and give the amount of power required to make powerLevel of i == powerLevel of i+1
			var lineResistance = resistance(dist, lineEnds[i][0], lineEnds[i][1]);
			//if (lineResistance >= 1) lineResistance = .999999;
			
			// The power cap of the building at the end of the current line
			var cap = POWER_CAPS[grid.getCellType(lineEnds[i][0], lineEnds[i][1])];
			
			// The difference in power level percent between this node and the next node
			var powerPercentDelta = nextEndPower - grid.getPowerPercent(lineEnds[i][0], lineEnds[i][1]);
			
			// The amount of powerLevel required to increase the percent of the current node to that of the next (including resistance)
			var powerRequired = powerPercentDelta*cap*(1 + lineResistance);
			
			// Send as much power as we need, up to the max amount we can
			var powerToSend = Math.min(powerRequired, powerLeft);
			if (powerToSend < 0) powerToSend = 0;
			
			// Actually send the power
			powerLeft -= powerToSend;
			var powerToReceive =(powerToSend - powerToSend*(lineResistance/(1+lineResistance)));
			grid.cells[lineEnds[i][1]][lineEnds[i][0]].powerLevel += powerToReceive;
			
			// Record totals
			totalPowerSent += powerToSend;
			totalPowerReceived += powerToReceive;
			console.log(lineResistance, powerRequired);
		}
	}
	
	grid.cells[y][x].powerLevel = powerLeft;
	
	// Recursively run this function on substations
	for (var i = 0; i < lineEnds.length; i++) {
		if (grid.getCellType(lineEnds[i][0], lineEnds[i][1]) == SUBSTATION) {
			distributeElectricity(lineEnds[i][0], lineEnds[i][1]);
		}
	}
}

function spreadHouses() {
	var NUM_ATTEMPTS = Math.max(400-gameTime, 10); // Spread more at the beginning
	for (var i = 0; i < NUM_ATTEMPTS; i++) {
		var x = Math.floor(Math.random()*GRID_SIZE);
		var y = Math.floor(Math.random()*GRID_SIZE);

		if (grid.getCellType(x, y) == HOUSE && Math.random() > .6) {
			var newX = x + Math.round(Math.pow((Math.random()-0.5)*2, 5)*MAX_SPREAD_DISTANCE);
			var newY = y + Math.round(Math.pow((Math.random()-0.5)*2, 5)*MAX_SPREAD_DISTANCE);
			//console.log(newY, newX);
			if (newX >= 0 && newY >= 0 && newX < GRID_SIZE && newY < GRID_SIZE && grid.getCellType(newX, newY) == VACANT) {
				grid.setCellType(newX, newY, HOUSE);
				break; // Only spread at most once per game second
			}
		}
	}
	drawGrid();
}

function saveBoard() {
	localStorage.setItem("cells", JSON.stringify(grid.cells));
	localStorage.setItem("time", gameTime);
}

function loadBoard() {
	grid.cells = JSON.parse(localStorage.getItem("cells"));
	gameTime = localStorage.getItem("time");
	drawGrid();
}