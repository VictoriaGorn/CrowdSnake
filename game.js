const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const snakeSize = 10;

let snake = [
    { x: 200, y: 200 },
    { x: 190, y: 200 },
    { x: 180, y: 200 }
];

let direction = 'right';

let foods = [];

let score = 0;
let speed = 100;

document.addEventListener('keydown', function(e) {
    if (e.keyCode === 37 && direction !== 'right') direction = 'left';
    else if (e.keyCode === 38 && direction !== 'down') direction = 'up';
    else if (e.keyCode === 39 && direction !== 'left') direction = 'right';
    else if (e.keyCode === 40 && direction !== 'up') direction = 'down';
});

class Food {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.timer = 0;
    }

    update(snake) {
        // Default update, can be overridden by subclasses
    }
}

class NormalFood extends Food {
    constructor(x, y) {
        super(x, y, 'normal');
    }
}

class RunningFood extends Food {
    constructor(x, y) {
        super(x, y, 'running');
        this.direction = Math.floor(Math.random() * 8); // 0-7: 8 possible directions
        this.timer = Math.floor(Math.random() * 1000) + 1000; // 1-2 seconds
        this.isRunning = false;
    }

    update(snake) {
        const head = snake[0];
        const dx = head.x - this.x;
        const dy = head.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= 2 * snakeSize) {
            this.isRunning = true;
        }

        if (this.isRunning) {
            if (this.timer > 0) {
                let newX = this.x;
                let newY = this.y;
                switch (this.direction) {
                    case 0: // up
                        newY -= snakeSize;
                        break;
                    case 1: // up-right
                        newX += snakeSize;
                        newY -= snakeSize;
                        break;
                    case 2: // right
                        newX += snakeSize;
                        break;
                    case 3: // down-right
                        newX += snakeSize;
                        newY += snakeSize;
                        break;
                    case 4: // down
                        newY += snakeSize;
                        break;
                    case 5: // down-left
                        newX -= snakeSize;
                        newY += snakeSize;
                        break;
                    case 6: // left
                        newX -= snakeSize;
                        break;
                    case 7: // up-left
                        newX -= snakeSize;
                        newY -= snakeSize;
                        break;
                }

                // Check boundaries
                if (newX >= 0 && newX < canvas.width && newY >= 0 && newY < canvas.height) {
                    this.x = newX;
                    this.y = newY;
                } else {
                    // Reverse direction if it hits the boundary
                    this.direction = (this.direction + 4) % 8;
                    this.update(snake); // Recurse to move in the new direction
                }

                this.timer -= 100; // Assuming game loop runs every 100ms
            } else {
                this.type = 'normal'; // Turn into normal food after running time
                this.isRunning = false;
            }
        }
    }
}

class TeleportingFood extends Food {
    constructor(x, y) {
        super(x, y, 'teleporting');
        this.teleported = false;
    }

    update(snake) {
        const head = snake[0];
        const dx = head.x - this.x;
        const dy = head.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= 2 * snakeSize && !this.teleported) {
            // Teleport once to a new random position
            do {
                this.x = Math.floor(Math.random() * (canvas.width / snakeSize)) * snakeSize;
                this.y = Math.floor(Math.random() * (canvas.height / snakeSize)) * snakeSize;
            } while (snake.some(segment => segment.x === this.x && segment.y === this.y));
            this.teleported = true;
        }
    }
}

function generateFood() {
    const foodTypes = [NormalFood, RunningFood, TeleportingFood];
    const FoodClass = foodTypes[Math.floor(Math.random() * foodTypes.length)];
    const x = Math.floor(Math.random() * (canvas.width / snakeSize)) * snakeSize;
    const y = Math.floor(Math.random() * (canvas.height / snakeSize)) * snakeSize;
    return new FoodClass(x, y);
}

function updateSnake() {
    let head = { x: snake[0].x, y: snake[0].y };

    switch(direction) {
        case 'right':
            head.x += snakeSize;
            break;
        case 'left':
            head.x -= snakeSize;
            break;
        case 'up':
            head.y -= snakeSize;
            break;
        case 'down':
            head.y += snakeSize;
            break;
    }

    // Check boundaries
    if (head.x >= canvas.width || head.x < 0 || head.y >= canvas.height || head.y < 0) {
        alert('Проект отдали конкуренту! Проектов в работе: ' + score);
        resetGame();
        return;
    }

    // Check collision with itself
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            alert('Проект отдали конкуренту! Проектов в работе: ' + score);
            resetGame();
            return;
        }
    }

    snake.unshift(head);

    // Check if snake eats any food
    let eatenFoods = [];
    for (let i = 0; i < foods.length; i++) {
        const food = foods[i];
        if (head.x === food.x && head.y === food.y) {
            score++;
            eatenFoods.push(i);
        }
    }

    // Remove eaten foods
    for (let index of eatenFoods.reverse()) {
        foods.splice(index, 1);
    }

    // Generate new food if necessary
    if (eatenFoods.length > 0) {
        foods.push(generateFood());
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }

    // Update food states
    for (let food of foods) {
        food.update(snake);
    }

    speed = 100 - (score * 5); // decrease speed based on score
    if (speed < 50) speed = 50; // minimum speed
}

function resetGame() {
    snake = [
        { x: 200, y: 0 }, { x: 190, y: 0 }, { x: 180, y: 0 }
    ];
    direction = 'right';
    score = 0;
    speed = 100;
    foods = [generateFood()];
}

let foodImg = new Image();
foodImg.src = 'food.svg'; // Replace with your food SVG path

let logoImg = new Image();
logoImg.src = 'logo.svg'; // Replace with your logo SVG path
let logoX = 0;
let logoY = 0;

logoImg.onload = () => {
    // Ensure logo dimensions are available
    logoX = (canvas.width - logoImg.width) / 2;
    logoY = (canvas.height - logoImg.height) / 2;
    drawSnake();
};

function drawSnake() {
    ctx.fillStyle = '#3da287'; // Set background color
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Clear canvas with background color

    // Draw score
    ctx.fillStyle = 'white'; // Set score color to white
    ctx.font = '20px Arial';
    ctx.fillText('Проекты в работе: ' + score, 10, 20);

    // Draw logo
    ctx.drawImage(logoImg, logoX, logoY);

    // Draw foods
    for (let food of foods) {
        ctx.drawImage(foodImg, food.x, food.y, snakeSize, snakeSize);
    }

    // Draw snake
    snake.forEach(segment => {
        if (isCollidingWithSVG(segment)) {
            ctx.fillStyle = '#16bde3';
        } else {
            ctx.fillStyle = 'white';
        }
        ctx.fillRect(segment.x, segment.y, snakeSize, snakeSize);
    });
}

function isCollidingWithSVG(segment) {
    // Implement collision detection logic here
    // For simplicity, assume SVG covers the center of the canvas
    const svgX = logoX;
    const svgY = logoY;
    const svgWidth = logoImg.width;
    const svgHeight = logoImg.height;
    return (
        segment.x >= svgX && segment.x < svgX + svgWidth &&
        segment.y >= svgY && segment.y < svgY + svgHeight
    );
}

function gameLoop() {
    updateSnake();
    drawSnake();
    setTimeout(gameLoop, speed);
}

// Initialize foods
foods.push(generateFood());

gameLoop();
