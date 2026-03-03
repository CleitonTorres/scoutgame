import { Player, Wall, Tree } from './entities.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 64;

const player = new Player({
    name: 'Player1',
    inicialX: 1,
    inicialY: 1,
    speed: 2,
    showHitbox: true,
    offSetHitbox: 10,
    offSetBoxCollide: 0,
    smooth: 6,
    tag: 'Player',
    behavior: 'dynamic',
    mass: 2,
    collision: true,
    gridSize: gridSize,
    canvas: canvas
});

const npcs = [
    new Player({        
        name: 'Player2',
        x: 10,
        y: 1,
        speed: 2,
        showHitbox: true,
        offSetHitbox: 10,
        offSetBoxCollide: 0,
        smooth: 6,
        tag: 'NPC',
        behavior: 'dynamic',
        mass: 0,
        collision: true,
        gridSize: gridSize,
        canvas: canvas,    
    }),
];

const walls = [
    new Wall({
        name: 'Wall1',
        x: 4,
        y: 4,
        gridSize: gridSize,
        canvas: canvas,
        showHitbox: true
    }),
    new Wall({
        name: 'Wall2',
        x: 5,
        y: 4,
        gridSize: gridSize,
        canvas: canvas,
        showHitbox: true
    }),
    new Wall({
        name: 'Wall3',
        x: 6,
        y: 4,
        gridSize: gridSize,
        canvas: canvas,
        showHitbox: true
    }),
];

const trees = [
    new Tree({
        name: 'Tree1',
        x: 8,
        y: 6,
        gridSize: gridSize,
        canvas: canvas,
        showHitbox: true,
        collision: true,
        offSetHitbox: 10,
        offSetBoxCollide: 10
    }),
    new Tree({
        name: 'Tree2',
        x: 2,
        y: 7,
        gridSize: gridSize,
        canvas: canvas,
        showHitbox: true,
        collision: true,
        offSetHitbox: 10,
        offSetBoxCollide: 10
    }),
];

const worldObjects = [...npcs, ...walls, ...trees];

const keysPressed = {
    up: false,
    down: false,
    left: false,
    right: false,
};

// Atualiza o estado das teclas pressionadas com base no evento de teclado
function updateInputState(key, isPressed) {
    switch (key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            keysPressed.up = isPressed;
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            keysPressed.down = isPressed;
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            keysPressed.left = isPressed;
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            keysPressed.right = isPressed;
            break;
    }
}

// Converte o estado das teclas pressionadas em um vetor de entrada para o movimento do jogador
function getInputVector() {
    const inputX = (keysPressed.right ? 1 : 0) - (keysPressed.left ? 1 : 0);
    const inputY = (keysPressed.down ? 1 : 0) - (keysPressed.up ? 1 : 0);
    return { inputX, inputY };
}

function update() {
    const { inputX, inputY } = getInputVector();
    player.update(inputX, inputY, worldObjects);
}

function draw() {
    // Limpa o canvas antes de desenhar a próxima frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const wall of walls) wall.draw();
    for (const tree of trees) tree.draw();

    for (const npc of npcs) npc.draw();
    player.draw();
}

function gameLoop() {
    update();
    draw();

    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (event) => {
    updateInputState(event.key, true);
});

document.addEventListener('keyup', (event) => {
    updateInputState(event.key, false);
});

gameLoop();
