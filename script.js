// Timing
var gameTime = 0; // Incremental counter of seconds of game time passed
var gameRate = 1; // How many game second pass per real second (can be changed by user)

// Board layout
const GRID_SIZE = 100;
const CELL_SIZE = 16;
var grid = [];
var canvas;
var ctx;

// Building types
const VACANT = 0;
const HOUSE = 1;
const GENERATOR = 2;
const SUBSTATION = 3;

const BUILDING_NAMES = ["Empty lot", "House", "Power generator", "Power substation"];
const BUILDING_COLORS = ["#80340b", "lime", "gray", "aqua"];

// Random generation
const MAX_SPREAD_DISTANCE = 10;

// Interaction
var placingPole = false;

var grid = {
	cells: [],
	init: () => {
		for (var y = 0; y < GRID_SIZE; y++) {
			grid.cells[y] = []
			for (var x = 0; x < GRID_SIZE; x++) {
				grid.cells[y][x] = {type: VACANT};
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
	
	grid.setCellType(GRID_SIZE/2, GRID_SIZE/2, HOUSE);
	drawGrid();
	prevTick = Date.now();
    tick();
});

function statusMsg(msg) {
	document.getElementById("status").innerText = msg;
}

function clickCell(x, y) {
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
			drawGrid();
		}
	}
	else if (type == VACANT) {
		grid.cells[y][x].poles = [];
		drawGrid();
	}
	showBuildingInfo(x, y, type);
}

function showBuildingInfo(x, y, type) {
	var output = "Building type: " + BUILDING_NAMES[type];
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
	if (type == GENERATOR) {
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
	var start = Date.now();
	for (var y = 0; y < GRID_SIZE; y++) {
		for (var x = 0; x < GRID_SIZE; x++) {
			drawSquare(x, y, BUILDING_COLORS[grid.getCellType(x, y)]);
		}
	}
	for (var y = 0; y < GRID_SIZE; y++) {
		for (var x = 0; x < GRID_SIZE; x++) {
			if("poles" in grid.cells[y][x]){
				for(var i=0; i < grid.cells[y][x].poles.length; i++){
				
				ctx.beginPath();
				ctx.lineWidth = "5";
				ctx.strokeStyle = "green";
				ctx.moveTo(((CELL_SIZE*x)+(CELL_SIZE/2)), ((CELL_SIZE*y)+(CELL_SIZE/2)));
				ctx.lineTo(((CELL_SIZE*grid.cells[y][x].poles[i][0])+(CELL_SIZE/2)), ((CELL_SIZE*grid.cells[y][x].poles[i][1])+(CELL_SIZE/2)));
				ctx.stroke();
				}
			}
		}
	}
	console.log("Draw took " + (Date.now()-start) + "ms");
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
	if (Math.random() > .8) spreadHouses();
	setTimeout(tick, (1000-(Date.now()-tickStart))*gameRate);
}

function spreadHouses() {
	grid.forEachCell((cell, x, y) => {
		if (cell.type == HOUSE && Math.random() > .9) {
			var newX = x + Math.round(Math.pow((Math.random()-0.5)*2, 5)*MAX_SPREAD_DISTANCE);
			var newY = y + Math.round(Math.pow((Math.random()-0.5)*2, 5)*MAX_SPREAD_DISTANCE);
			//console.log(newY, newX);
			if (newX >= 0 && newY >= 0 && newX < GRID_SIZE && newY < GRID_SIZE && grid.getCellType(newX, newY) == VACANT) {
				grid.setCellType(newX, newY, HOUSE);
			}
		}
	});
	drawGrid();
}