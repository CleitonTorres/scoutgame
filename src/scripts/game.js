import { Player } from "./entities/Player.js";
import { Tree } from "./entities/Tree.js";
import { Wall } from "./entities/Wall.js";
import { layers } from "./settings/layers.js";
import { UIManager } from "./settings/UIManager.js";
import { loadAnimations } from "./engine/Animation.js";
import { SpatialHashGrid } from "./engine/SpatialHashGrid.js";
import { shooter } from "./engine/Shooter.js";
import { CharacterController } from "./engine/CharacterController.js";
import { NPC } from "./entities/NPC.js";
import { Inventory } from "./engine/Inventory.js";
import { PickupItem } from "./engine/Item/PickupItem.js";
import { ItemData } from "./engine/Item/ItemData.js";
import { tags } from "./settings/tags.js";
import { shapes } from "./settings/shapes.js";

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
    ],
    push:[
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

//carrega animações da bexiga d'água.
const ballonAnimation = await loadAnimations(pathBallonSprites, 6, true);
if (ballonAnimation.hit) {
    ballonAnimation.hit.loop = false;
}
//-----------------------------

//carrega animações das árvores.
const treesAnimations = {}; //await loadAnimations(pathTreesSprites, 6, true);
const avaliableTrees = {
    tree01:'tree01',
    tree07: 'tree07'
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

    const randomFps = Math.random() * 3 + 1;
    treesAnimations[key] = await loadAnimations(paths, randomFps, true);
}
//-----------------------------

//instancia o grid virtual para colisões.
const grid = new SpatialHashGrid(2);

//carregar objetos coletáveis.
const itensAnimatios = {};
const avaliableItens= {
    maca: "apple_01"
}
for (const [key, item] of Object.entries(avaliableItens)) {
    const paths = {
        idle: [
            `${patchObjects}forest-pack-sprites/${item}.png`,
        ],
    };

    const randomFps = Math.random() * 3 + 1;
    itensAnimatios[key] = await loadAnimations(paths, randomFps, false);
}
const item01 = new PickupItem({
    itemData: new ItemData({
        id: "apple",
        name: "Maçã",
        stackable: true,
        maxStack: 10,
        type: "food",
        icon: itensAnimatios.maca.idle?.frames?.[0]?.src || "src/assets/objects/forest-pack-sprites/spider.png",
        onUse(player){
            player.hp += 5
        }
    }),
    quantity: 2,
    position: {x: 4, y: 9},
    transform: {
        width: 0.5,
        height: 0.5
    },
    animation: itensAnimatios.maca,
    canvas
});
const itens = [
    item01
]
//---------------------------

//esconde a mensagem de "carregando ..."
ui.hideWarning();

//estados das teclas.
const inputState = {
    up:false,
    down:false,
    left:false,
    right:false,
    shift:false
};

//----------------------
const player = new Player({
    name: "Cleitinho",
    tag: tags.PLAYER,
    physical:{
        behavior: "dynamic",
        collision: true,
        mass: 10,
        smooth: 6,
        speed: 3
    },
    hitboxes: [
        {
            offSetHitbox: {x:10, y:-5},
            anchorHitBox: {x:0, y:0},
            showHitbox:false
        }
    ],
    collides:[
        {
            offSetBoxCollide: {x: 15, y: 20},
            anchorBoxCollide: {x: 0, y: 20},
            showBoxCollide:false
        }
    ],
    controller: new CharacterController(inputState),
    inventory: new Inventory(20),
    position:{x: 1, y: 2},
    sortLayer: layers.player,
    state: "idle",
    animation: playerAnimations,
    hud: ui,
    canvas,
    gridSize,
});

//points para simulação de caminhada.
const patrolPoints = [
    { x: 2, y: 10 },
    { x: 10, y: 5 },
    { x: 10, y: 8 },
    { x: 5, y: 8 }
];

const npcs = [
    new NPC({
        name: "Baloo",
        tag: tags.NPC_quest,
        physical:{
            behavior: "dynamic",
            collision: false,
            mass: 7,
            smooth: 6,
            speed: 3
        },
        position:{x: 10, y: 1},
        hitboxes: [
            {
                offSetHitbox: {x: 15, y: 10},
                anchorHitBox: {x:0, y:0},
                showHitbox:false
            }
        ],
        collides:[
            {
                offSetBoxCollide: {x: 15, y: 20},
                anchorBoxCollide: {x: 0, y: 20},
                showBoxCollide: false
            }
        ],
        sortLayer: layers.underFloor,
        state: "idle",
        animation: npcsAnimations.baloo,
        canvas,
        gridSize
    }),
    new NPC({
        name: "BP",
        tag: "NPC",
        physical:{
            behavior: "dynamic",
            collision: true,
            mass: 7,
            smooth: 6,
            speed: 0.5
        },
        patrolPoints,
        position:{x: 2, y: 10},
        hitboxes: [
            {
                offSetHitbox: {x: 10, y: 10},
                anchorHitBox: {x:0, y:0},
                showHitbox:false
            }
        ],
        collides:[
            {
                offSetBoxCollide: {x: 15, y: 20},
                anchorBoxCollide: {x: 0, y: 20},
                showBoxCollide: false
            }
        ],
        sortLayer: layers.underFloor,
        state: "idle",
        animation: npcsAnimations.bp,
        canvas,
        gridSize
    }),
];

const walls = [
    new Wall({
        name: 'Wall1',
        tag: tags.WALL,
        sortLayer: layers.ground,
        position: {x: 4, y: 4},
        animation: {},
        physical:{
            behavior: 'static',
            collision: true,
            mass: Infinity,
        },
        transform:{
            height: 0.5,
        },
        hitboxes: [
            {
                offSetHitbox: {x:0, y:0},
                anchorHitBox: {x:0, y:0},
                showHitbox:false
            }
        ],
        collides:[
            {
                offSetBoxCollide: {x: 0, y: 0},
                anchorBoxCollide: {x: 0, y: 0},
                showBoxCollide: false
            }
        ],
        gridSize,
        canvas,        
    }),
    new Wall({
        name: 'Wall2',
        tag: tags.WALL,
        sortLayer: layers.ground,
        position: {x: 5, y: 5},
        animation: {},
        physical:{
            behavior: 'static',
            collision: true,
            mass: Infinity
        },
        transform:{
            height: 0.5,
        },
        hitboxes: [
            {
                offSetHitbox: {x:0, y:0},
                anchorHitBox: {x:0, y:0},
                showHitbox:true
            }
        ],
        collides:[
            {
                offSetBoxCollide: {x: 0, y: 0},
                anchorBoxCollide: {x: 0, y: 0},
                showBoxCollide: true
            }
        ],
        gridSize,
        canvas,        
    }),
    new Wall({
        name: 'Wall3',
        tag: tags.WALL,
        sortLayer: layers.ground,
        position: {x: 6, y: 4},
        animation: {},
        physical:{
            behavior: 'static',
            collision: true,
            mass: Infinity
        },
        transform:{
            height: 0.5,
        },
        hitboxes: [
            {
                offSetHitbox: {x:0, y:0},
                anchorHitBox: {x:0, y:0},
                showHitbox:true
            }
        ],
        collides:[
            {
                offSetBoxCollide: {x: 0, y: 0},
                anchorBoxCollide: {x: 0, y: 0},
                showBoxCollide: true
            }
        ],
        gridSize,
        canvas,        
    }),
];

const trees = [
    new Tree({
        name: 'Tree1',
        tag: tags.TREE,
        sortLayer: layers.underFloor,
        position: {x: 9, y: 5},        
        physical: {
            collision: true,
        },
        hitboxes: [
            {
                offSetHitbox: {x: 20, y: 10},
                anchorHitBox: {x:0, y:0},
                showHitbox:false
            }
        ],
        collides:[
            {
                offSetBoxCollide: {x: 25, y: 25},
                anchorBoxCollide: {x: 0, y: 25},
                showBoxCollide: false
            }
        ],
        state: "move",
        animation: treesAnimations.tree01,
        canvas: canvas,        
    }),
    new Tree({
        name: 'Tree2',
        tag: tags.TREE,
        sortLayer: layers.underFloor,
        position: {x: 6, y: 7.5},
        physical: {
            collision: true,
        },
        transform:{
            width: 2,
            height: 2,
            scale: 1,
        },
        hitboxes: [
            {
                offSetHitbox: {x: 50, y: 25},
                anchorHitBox: {x: 8, y: 25},
                showHitbox:false
            },
            {
                shape: shapes.CIRCLE,
                offSetHitbox:  {x: 15, y: 15}, 
                anchorHitBox:  {x: -15, y: -33},
                showHitbox: false, 
            }
        ],
        collides:[
            {
                offSetBoxCollide: {x: 50, y: 60},
                anchorBoxCollide: {x: 10, y: 60},
                showBoxCollide: false
            }
        ],
        state: "move",
        animation: treesAnimations.tree07,
        gridSize,       
        canvas: canvas,        
    }),
    new Tree({
        name: 'Tree2',
        tag: tags.TREE,
        sortLayer: layers.underFloor,
        position: {x: 2, y: 8},
        physical: {
            collision: true,
        },
        hitboxes: [
            {
                offSetHitbox: {x: 20, y: 10},
                anchorHitBox: {x: 0, y: 0},
                showHitbox:false
            }
        ],
        collides:[
            {
                offSetBoxCollide: {x: 25, y: 25},
                anchorBoxCollide: {x: 0, y: 25},
                showBoxCollide: false
            }
        ],
        state: "move",
        animation: treesAnimations.tree01,
        showBoxCollide: false,
        gridSize,
        canvas: canvas,        
    }),
    new Tree({
        name: 'Tree2',
        tag: tags.TREE,
        sortLayer: layers.underFloor,
        position: {x: 14, y: 10},
        physical: {
            collision: true,
        },
        hitboxes: [
            {
                offSetHitbox: {x: 20, y: 10},
                anchorHitBox: {x: 0, y: 0},
                showHitbox:false
            }
        ],
        collides:[
            {
                offSetBoxCollide: {x: 25, y: 25},
                anchorBoxCollide: {x: 0, y: 25},
                showBoxCollide: false
            }
        ],
        state: "move",
        animation: treesAnimations.tree07,
        gridSize,
        canvas: canvas,        
    }),
];

//objetos em cena.
const worldObjects = [...npcs, ...walls, ...trees, player, ...itens];

// Atualiza o estado das teclas pressionadas com base no evento de teclado
function updateInputState(key, isPressed) {
    switch (key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            inputState.up = isPressed;
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            inputState.down = isPressed;
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            inputState.left = isPressed;
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            inputState.right = isPressed;
            break;
        case 'ShiftLeft':
        case 'Shift':
            inputState.shift = isPressed;
            break;
    }
}

function update() {    
    //atual dados dos objetos de cena que precisam ser atualizados.
    const resolve = worldObjects.filter(Boolean);
    for (let i = resolve.length - 1; i >= 0; i--) {
        const obj = resolve[i];
        if(!obj || !obj.tag) return;

        if(["Wall", "Tree"].includes(obj.tag)) {
            obj.update(grid);
        }else if(["NPC", "Player", "Ballon"].includes(obj.tag)){
            obj.update(grid);
        }

        if(obj.destroyed) worldObjects.splice(i, 1);
    }
    
    //atualiza dados do UI.
    ui.setPlayerInfo(player);
}

function draw() {
    // Limpa o canvas antes de desenhar a próxima frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //desenha cada elemento de acordo com sua layer (profundidade)
    const renderQueue = [...worldObjects, player].filter(Boolean);
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
    event.preventDefault();
    updateInputState(event.key, true);

    if (event.repeat) return;

    if (event.code === "Space") {
        event.preventDefault();
        
        const isCollided = player.hitboxes?.find(hit=> hit.hits) ? true : false;

        if(!isCollided){
            //insere a instância no array de objetos globais para ser desenhado.
            worldObjects.push(shooter(player, ballonAnimation, canvas, gridSize));
        }
    }
    
    //ao teclar h simula um aviso na tela.
    if (event.key === 'h' || event.key === 'H') {
        ui.showWarning("Aviso: sistema de UI HTML ativo.");
    }

    if(["i", "I"].includes(event.key)){
        player.hud.toggleInventory();
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

