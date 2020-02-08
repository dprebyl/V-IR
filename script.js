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

// Random generation
const MAX_SPREAD_DISTANCE = 10;

var grid = {
	array: [],
	init: () => {
		for (var y = 0; y < GRID_SIZE; y++) {
			grid.array[y] = []
			for (var x = 0; x < GRID_SIZE; x++) {
				grid.array[y][x] = {type: VACANT};
			}
		}
		
	},
	getCellType: (x, y) => grid.array[y][x].type,
	setCellType: (x, y, val) => { grid.array[y][x].type = val; },
	forEachCell: callback => {
		for (var y = 0; y < GRID_SIZE; y++) {
			for (var x = 0; x < GRID_SIZE; x++) {
				callback(grid.array[y][x], x, y);
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
		var x = Math.floor(pixelRatio*event.offsetX/16);
		var y = Math.floor(pixelRatio*event.offsetY/16);
		grid.setCellType(x,y,GENERATOR);
		drawGrid();
	
	});
	
	grid.setCellType(GRID_SIZE/2, GRID_SIZE/2, HOUSE);
	drawGrid();
	prevTick = Date.now();
    tick();
});

function drawGrid() {
	for (var y = 0; y < GRID_SIZE; y++) {
		for (var x = 0; x < GRID_SIZE; x++) {
			if (grid.getCellType(x, y) == VACANT) drawSquare(x, y, "#80340b");
			else if (grid.getCellType(x, y) == HOUSE) drawSquare(x, y, "lime");
			else drawSquare(x, y, "red"); // Error
		}
	}
}

function drawSquare(x, y, color) {
	ctx.fillStyle = color;
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