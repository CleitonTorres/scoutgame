import { Player } from "./entities/Player.js";
import { Ballon } from "./entities/Ballon.js";
import { Tree } from "./entities/Tree.js";
import { Wall } from "./entities/Wall.js";
import { layers } from "./settings/layers.js";
import { UIManager } from "./settings/UIManager.js";
import { getRadiusToSpaw } from "./Math/GetRadiusToSpaw.js";
import { loadAnimations } from "./engine/Animation.js";
import { SpatialHashGrid } from "./engine/SpatialHashGrid.js";

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 64;
const ui = new UIManager();

let characterSelected = 'leo';

//carregamento de imagens das animações do player.
const pathCharacters = "./src/assets/characters/";
const patchObjects = "./src/assets/objects/";

const availablePlayers = {
    lipe: "lipe",
    maria: "maria",
    leo: "leo",
    helen: "helen-f",
    marco: "amarco",
    ru: "ru"
};
// manifesto com os caminhos dos sprites para animação do player.
const pathAnimationsPlayers = {
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

//manifesto com os caminhos dos sprites do ballon.
const pathBallonSprites = {
    move:[
        `${patchObjects}bexiga/move/0.png`,
        `${patchObjects}bexiga/move/1.png`,
        `${patchObjects}bexiga/move/2.png`,
        `${patchObjects}bexiga/move/3.png`,
    ],
    hit:[
        `${patchObjects}bexiga/hit/0.png`,
        `${patchObjects}bexiga/hit/1.png`,
        `${patchObjects}bexiga/hit/2.png`,
        `${patchObjects}bexiga/hit/3.png`,
        `${patchObjects}bexiga/hit/4.png`,
    ],
}

//mostra a mensagem de "carregando..."
ui.showWarning("Carregando jogo...", 0);

//objeto contendo as animaçoes possiveis do player.
const playerAnimations = await loadAnimations(pathAnimationsPlayers, 6, true);

//carregamento de animações dos npcs.
const availableNPCs = {
    bp: "bp",
    baloo: "baloo-f",
    npc01: "npc01",
    npc02: "npc02"
}

//carrega as animações de cada NPC disponível.
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

    npcsAnimations[key] = await loadAnimations(paths, 4, true);
}
//----------------------------------

//carrega animações de objetos.
const ballonAnimation = await loadAnimations(pathBallonSprites, 6, true);
if (ballonAnimation.hit) {
    ballonAnimation.hit.loop = false;
}
//-----------------------------

//carrega animações das árvores.
const treesAnimations = {}; //await loadAnimations(pathTreesSprites, 6, true);
const avaliableTrees = {
    tree01:'tree01'
};
for (const [key, tree] of Object.entries(avaliableTrees)) {

    const paths = {
        move: [
            `${patchObjects}arvores/${tree}/move/0.png`,
            `${patchObjects}arvores/${tree}/move/1.png`,
            `${patchObjects}arvores/${tree}/move/2.png`,
            `${patchObjects}arvores/${tree}/move/3.png`,
            `${patchObjects}arvores/${tree}/move/4.png`,
            `${patchObjects}arvores/${tree}/move/5.png`,
        ],
    };

    treesAnimations[key] = await loadAnimations(paths, 6, true);
}
//-----------------------------

//instancia o grid virtual para colisões.
const grid = new SpatialHashGrid(2);

//esconde a mensagem de "carregando ..."
ui.hideWarning();

//----------------------
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
    position:{x: 1, y: 2},
    sortLayer: layers.player,
    offSetBoxCollide: {x: 15, y: 0},
    offSetHitbox: {x: 15, y: 0},
    showHitbox: false,
    animation: playerAnimations,
    canvas,
    gridSize,
});

const npcs = [
    new Player({
    name: "Baloo",
    tag: "NPC",
    physical:{
        behavior: "dynamic",
        collision: true,
        mass: 7,
        smooth: 6,
        speed: 3
    },
    position:{x: 10, y: 1},
    offSetBoxCollide: {x: 20, y: 30},
    offSetHitbox: {x: 20, y: 10},
    sortLayer: layers.ground,
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
        sortLayer: layers.ground,
        position: {x: 4, y: 4},
        offSetBoxCollide: {x: 0, y: 0},
        offSetHitbox: {x: 0, y: 0},
        showHitbox: true,
        animation: {},
        physical:{
            behavior: 'static',
            collision: true,
            mass: Infinity,
        },
        transform:{
            height: 0.5,
        },
        gridSize,
        canvas,        
    }),
    new Wall({
        name: 'Wall2',
        tag: "Wall",
        sortLayer: layers.ground,
        position: {x: 5, y: 5},
        offSetBoxCollide: {x: 0, y: 0},
        offSetHitbox: {x: 0, y: 0},
        animation: {},
        physical:{
            behavior: 'static',
            collision: true,
            mass: Infinity
        },
        transform:{
            height: 0.5,
        },
        gridSize,
        canvas,        
    }),
    new Wall({
        name: 'Wall3',
        tag: "Wall",
        sortLayer: layers.ground,
        position: {x: 6, y: 4},
        offSetBoxCollide: {x: 0, y: 0},
        offSetHitbox: {x: 0, y: 0},
        animation: {},
        physical:{
            behavior: 'static',
            collision: true,
            mass: Infinity
        },
        transform:{
            height: 0.5,
        },
        gridSize,
        canvas,        
    }),
];

const trees = [
    new Tree({
        name: 'Tree1',
        tag: 'Tree',
        sortLayer: layers.ground,
        position: {x: 9, y: 5},
        showHitbox: false,
        physical: {
            collision: true,
        },
        animation: treesAnimations.tree01,
        offSetBoxCollide: {x: 30, y: 50},
        offSetHitbox: {x: 20, y: 10},
        canvas: canvas,        
    }),
    new Tree({
        name: 'Tree2',
        tag: 'Tree',
        sortLayer: layers.ground,
        position: {x: 8, y: 8},
        physical: {
            collision: true,
        },
        animation: treesAnimations.tree01,
        showHitbox: false,
        offSetBoxCollide: {x: 30, y: 50},
        offSetHitbox: {x: 20, y: 10},
        canvas: canvas,        
    }),
    new Tree({
        name: 'Tree2',
        tag: 'Tree',
        sortLayer: layers.ground,
        position: {x: 2, y: 8},
        physical: {
            collision: true,
        },
        animation: treesAnimations.tree01,
        showHitbox: false,
        offSetBoxCollide: {x: 30, y: 50},
        offSetHitbox: {x: 20, y: 10},
        canvas: canvas,        
    }),
    new Tree({
        name: 'Tree2',
        tag: 'Tree',
        sortLayer: layers.ground,
        position: {x: 14, y: 10},
        physical: {
            collision: true,
        },
        animation: treesAnimations.tree01,
        showHitbox: false,
        offSetBoxCollide: {x: 30, y: 50},
        offSetHitbox: {x: 20, y: 10},
        canvas: canvas,        
    }),
];

//objetos em cena.
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
    //atualiza dados dos NPCs e do Player.
    const { inputX, inputY } = getInputVector();

    const collidesGridPlayer = grid.query(player.x, player.y);
    player.update(inputX, inputY, collidesGridPlayer);
    
    //atual dados dos objetos de cena que precisam ser atualizados.
    for (let i = worldObjects.length - 1; i >= 0; i--) {
        const obj = worldObjects[i];
        if(obj.tag && ["Ballon", "NPC", "Tree"].includes(obj.tag)) {
            const collidesGridOthers = grid.query(obj.x, obj.y);
            obj.update(0, 0, [player, ...collidesGridOthers]);
            if(obj.destroyed) worldObjects.splice(i, 1);
        }
    }
    
    //atualiza dados do UI.
    ui.setPlayerInfo(player);
}

function draw() {
    // Limpa o canvas antes de desenhar a próxima frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //desenha cada elemento de acordo com sua layer (profundidade)
    const renderQueue = [...worldObjects, player];
    renderQueue.sort((a, b) => {
        // 1) layer base (menor primeiro, maior desenha por último = fica na frente)
        const layerDiff = (a.sortLayer ?? 0) - (b.sortLayer ?? 0);
        if (layerDiff !== 0) return layerDiff;

        // 2) desempate opcional por Y (bom para profundidade)
        return (a.y ?? 0) - (b.y ?? 0);
    });
    for (const obj of renderQueue) obj.draw();
}

function updateWorld(objects) {
    grid.clear();

    for (const obj of objects) {
        grid.insert(obj);
    }

}

function gameLoop() {
    updateWorld(worldObjects);
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (event) => {
    updateInputState(event.key, true);

    if (event.repeat) return;

    if (event.code === "Space") {
        event.preventDefault();
        
        //pegar a posição para spawnar o balão pelo centro do player.
        const {spawnX, spawnY} = getRadiusToSpaw(player, 10, gridSize);

        //insere a instância no array de objetos globais para ser desenhado.
        worldObjects.push(new Ballon({
            name: `Ballon-${Date.now()}`,
            tag: "Ballon",
            position: { x: spawnX, y: spawnY },
            direction: player.facingDirection,
            physical:{
                collision: true,
                mass: 1,
                speed: 5 
            },
            transform:{
                width: 0.35,
                height: 0.35,
            },
            animation: ballonAnimation,
            owner: player,
            sortLayer: layers.player,
            offSetBoxCollide: { x: 0, y: 0 },
            offSetHitbox: { x: 0, y: 0 },
            showHitbox: false,
            canvas,
            gridSize,
        }));
    }

    //ao teclar h simula um aviso na tela.
    if (event.key === 'h' || event.key === 'H') {
        ui.showWarning("Aviso: sistema de UI HTML ativo.");
    }

    //ao teclar j, simula um bação de diálogo na tela.
    if (event.key === 'j' || event.key === 'J') {
        ui.toggleDialog({
            speaker: "Guia",
            text: "Esta e uma base para seus futuros baloes de dialogo."
        });
    }

    //oculta os UI se teclar esc.
    if (event.key === 'Escape') {
        ui.hideDialog();
        ui.hideWarning();
    }
});

document.addEventListener('keyup', (event) => {
    updateInputState(event.key, false);
});

gameLoop();

