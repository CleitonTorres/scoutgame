import { Player, Wall, Tree } from './entities.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 64;

let characterSelected = 'leo';

//carregamento de imagens das animações do player.
const pathCharacters = "./src/assets/characters/";
const availablePlayers = {
    lipe: "lipe",
    maria: "maria",
    leo: "leo",
    helen: "helen-f",
    marco: "amarco",
    ru: "ru"
};
const pathAnimations = {
    idle: [
        `${pathCharacters}${availablePlayers[characterSelected]}/idle/down/0.png`,
        `${pathCharacters}${availablePlayers[characterSelected]}/idle/down/1.png`,
        `${pathCharacters}${availablePlayers[characterSelected]}/idle/down/2.png`,
        `${pathCharacters}${availablePlayers[characterSelected]}/idle/down/3.png`,
    ], 
    walkUp: [
        `${pathCharacters}${availablePlayers[characterSelected]}/walk/up/0.png`,
        `${pathCharacters}${availablePlayers[characterSelected]}/walk/up/1.png`,
        `${pathCharacters}${availablePlayers[characterSelected]}/walk/up/2.png`,
        `${pathCharacters}${availablePlayers[characterSelected]}/walk/up/3.png`,
    ], 
    walkDown: [
        `${pathCharacters}${availablePlayers[characterSelected]}/walk/down/0.png`,
        `${pathCharacters}${availablePlayers[characterSelected]}/walk/down/1.png`,
        `${pathCharacters}${availablePlayers[characterSelected]}/walk/down/2.png`,
        `${pathCharacters}${availablePlayers[characterSelected]}/walk/down/3.png`,
    ], 
    walkLeft: [
        `${pathCharacters}${availablePlayers[characterSelected]}/walk/left/0.png`,
        `${pathCharacters}${availablePlayers[characterSelected]}/walk/left/1.png`,
        `${pathCharacters}${availablePlayers[characterSelected]}/walk/left/2.png`,
        `${pathCharacters}${availablePlayers[characterSelected]}/walk/left/3.png`,
    ], 
    walkRight: [
        `${pathCharacters}${availablePlayers[characterSelected]}/walk/right/0.png`,
        `${pathCharacters}${availablePlayers[characterSelected]}/walk/right/1.png`,
        `${pathCharacters}${availablePlayers[characterSelected]}/walk/right/2.png`,
        `${pathCharacters}${availablePlayers[characterSelected]}/walk/right/3.png`,
    ]
}
const playerAnimations = await loadCharacterAnimations(pathAnimations);
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Falha ao carregar: ${src}`));
        img.src = src;
    });
}

async function loadCharacterAnimations(pathToAnimations) {
  const loadFrames = async (paths = []) =>
    Promise.all(paths.map(loadImage));

  const animations = {};

  for (const key in pathToAnimations) {
    animations[key] = {
        frames: await loadFrames(pathToAnimations[key]),
        fps: 6,
        loop: true
    };
  }

  return animations;
}
// -------------------------------------------------

//carregamento de animações dos npcs.
const availableNPCs = {
    bp: "bp",
    baloo: "baloo-f",
    npc01: "npc01",
    npc02: "npc02"
}
const npcsAnimations = {};
for (const [key, npc] of Object.entries(availableNPCs)) {

    const paths = {
        idle: [
            `${pathCharacters}${npc}/idle/down/0.png`,
            `${pathCharacters}${npc}/idle/down/1.png`,
            `${pathCharacters}${npc}/idle/down/2.png`,
            `${pathCharacters}${npc}/idle/down/3.png`,
        ],
        walkUp: [
            `${pathCharacters}${npc}/walk/up/0.png`,
            `${pathCharacters}${npc}/walk/up/1.png`,
            `${pathCharacters}${npc}/walk/up/2.png`,
            `${pathCharacters}${npc}/walk/up/3.png`,
        ],
        walkDown: [
            `${pathCharacters}${npc}/walk/down/0.png`,
            `${pathCharacters}${npc}/walk/down/1.png`,
            `${pathCharacters}${npc}/walk/down/2.png`,
            `${pathCharacters}${npc}/walk/down/3.png`,
        ],
        walkLeft: [
            `${pathCharacters}${npc}/walk/left/0.png`,
            `${pathCharacters}${npc}/walk/left/1.png`,
            `${pathCharacters}${npc}/walk/left/2.png`,
            `${pathCharacters}${npc}/walk/left/3.png`,
        ],
        walkRight: [
            `${pathCharacters}${npc}/walk/right/0.png`,
            `${pathCharacters}${npc}/walk/right/1.png`,
            `${pathCharacters}${npc}/walk/right/2.png`,
            `${pathCharacters}${npc}/walk/right/3.png`,
        ]
    };

    npcsAnimations[key] = await loadCharacterAnimations(paths);
}
//----------------------------------

const player = new Player({
    name: "Cleitinho",
    tag: "Player",
    physical:{
        behavior: "dynamic",
        collision: true,
        mass: 10,
        smooth: 6,
        speed: 3
    },
    position:{x: 1, y: 1},
    offSetBoxCollide: 10,
    offSetHitbox: 10,
    showHitbox: false,
    animation: playerAnimations,
    canvas,
    gridSize
});

const npcs = [
    new Player({
    name: "Jão",
    tag: "NPC",
    physical:{
        behavior: "dynamic",
        collision: true,
        mass: 7,
        smooth: 6,
        speed: 3
    },
    position:{x: 10, y: 1},
    offSetBoxCollide: 0,
    offSetHitbox: 0,
    showHitbox: false,
    animation: npcsAnimations.baloo,
    canvas,
    gridSize
}),
];

const walls = [
    new Wall({
        name: 'Wall1',
        tag: "Wall",
        position: {x: 4, y: 4},
        showHitbox: true,
        offSetBoxCollide: 0,
        offSetHitbox: 0,
        animation: {},
        physical:{
            behavior: 'static',
            collision: true,
            mass: Infinity
        },
        gridSize,
        canvas,        
    }),
    new Wall({
        name: 'Wall2',
        tag: "Wall",
        position: {x: 5, y: 4},
        showHitbox: true,
        offSetBoxCollide: 0,
        offSetHitbox: 0,
        animation: {},
        physical:{
            behavior: 'static',
            collision: true,
            mass: Infinity
        },
        gridSize,
        canvas,        
    }),
    new Wall({
        name: 'Wall3',
        tag: "Wall",
        position: {x: 6, y: 4},
        showHitbox: true,
        offSetBoxCollide: 0,
        offSetHitbox: 0,
        animation: {},
        physical:{
            behavior: 'static',
            collision: true,
            mass: Infinity
        },
        gridSize,
        canvas,        
    }),
];

const trees = [
    new Tree({
        name: 'Tree1',
        tag: 'Tree',
        physical:{
            behavior: 'static',
            collision: true
        },
        animation: {},
        position: {x: 8, y: 6},
        showHitbox: true,
        collision: true,
        offSetHitbox: 10,
        offSetBoxCollide: 10,
        gridSize: gridSize,
        canvas: canvas,        
    }),
    new Tree({
        name: 'Tree2',
        tag: 'Tree',
        physical:{
            behavior: 'static',
            collision: false
        },
        animation: {},
        position: {x: 8, y: 8},
        showHitbox: true,
        collision: true,
        offSetHitbox: 10,
        offSetBoxCollide: 10,
        gridSize: gridSize,
        canvas: canvas,        
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
