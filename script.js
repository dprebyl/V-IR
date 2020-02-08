// Timing
var gameTime = 0; // Incremental counter of seconds of game time passed
var gameRate = 1; // How many game second pass per real second (can be changed by user)

// Board layout
const GRID_SIZE = 100;
const CELL_SIZE = 10;
var grid = [];
var canvas;
var ctx;

// Building types
const VACANT = 0;
const HOUSE = 1;

// Random generation
const MAX_SPREAD_DISTANCE = 10;

window.addEventListener("DOMContentLoaded", (event) => {
	canvas = document.getElementById("board");
	ctx = canvas.getContext("2d");
	for (var y = 0; y < GRID_SIZE; y++) {
		grid[y] = [];
		for (var x = 0; x < GRID_SIZE; x++) {
			grid[y][x] = VACANT;
		}
	}
	grid[GRID_SIZE/2][GRID_SIZE/2] = HOUSE;
	drawGrid();
	prevTick = Date.now();
    tick();
});

function forEachCell(callback) {
	for (var y = 0; y < GRID_SIZE; y++) {
		for (var x = 0; x < GRID_SIZE; x++) {
			callback(grid[y][x], x, y);
		}
	}
}

function drawGrid() {
	canvas.width = GRID_SIZE*CELL_SIZE;
	canvas.height = GRID_SIZE*CELL_SIZE;
	for (var y = 0; y < GRID_SIZE; y++) {
		for (var x = 0; x < GRID_SIZE; x++) {
			if (grid[y][x] == VACANT) drawSquare(x, y, "brown");
			else if (grid[y][x] == HOUSE) drawSquare(x, y, "lime");
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
	forEachCell((cell, x, y) => {
		if (cell == HOUSE && Math.random() > .8) {
			var newX = x + Math.round(Math.pow((Math.random()-0.5)*2, 5)*MAX_SPREAD_DISTANCE);
			var newY = y + Math.round(Math.pow((Math.random()-0.5)*2, 5)*MAX_SPREAD_DISTANCE);
			//console.log(newY, newX);
			if (newX >= 0 && newY >= 0 && newX < GRID_SIZE && newY < GRID_SIZE && grid[newY][newX] == VACANT) {
				grid[newY][newX] = HOUSE;
				//drawSquare(newX, newY, "lime");
			}
		}
	});
	drawGrid();
}