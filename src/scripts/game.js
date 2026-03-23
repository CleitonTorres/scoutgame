import { Player } from "./entities/Player.js";
import { Tree } from "./entities/Tree.js";
import { Wall } from "./entities/Wall.js";
import { layers } from "./settings/layers.js";
import { UIManager } from "./settings/UIManager.js";
import { SpatialHashGrid } from "./engine/SpatialHashGrid.js";
import { shooter } from "./engine/Shooter.js";
import { CharacterController } from "./engine/CharacterController.js";
import { NPC } from "./entities/NPC.js";
import { Inventory } from "./engine/Inventory.js";
import { PickupItem } from "./engine/Item/PickupItem.js";
import { ItemData } from "./engine/Item/ItemData.js";
import { tags } from "./settings/tags.js";
import { shapes } from "./settings/shapes.js";
import { QuestData } from "./engine/Quest/QuestData.js";
import { itemsTypes } from "./settings/itemsTypes.js";
import { Game } from "./settings/Game.js";
import { EventBus } from "./settings/EventBus.js";
import { assetManager } from "./settings/AssetsManager.js";
import { updateWorld } from "./engine/UpdateSpatialGrid.js";
import { InputManager } from "./settings/InputManager.js";

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 64;

//gerenciador de entradas
const inputManager = new InputManager();

//instancia o grid virtual para colisões.
const grid = new SpatialHashGrid(2);

//sistema de listeners
const eventBus = new EventBus

//sistema de gerenciamento do UI/UX/HUD
const ui = new UIManager(eventBus);

//mostra a mensagem de "carregando..."
ui.showWarning("Carregando jogo...", 0);
await assetManager.loadAll();

//estados das teclas.
// const inputState = {
//     kp: {},
//     gp: {},
//     up:false,
//     down:false,
//     left:false,
//     right:false,
//     shift:false,
//     dialog: false,
//     shootHeld: false,
//     shootPressed: false,
//     inventory: false,
//     quest: false
// };

//points para simulação de caminhada de NPC.
const patrolPoints = [
    { x: 2, y: 10 },
    { x: 10, y: 5 },
    { x: 10, y: 8 },
    { x: 5, y: 8 }
];

//INSTANCIAS===============
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
    controller: new CharacterController(inputManager.state),
    inventory: new Inventory(20),
    position:{x: 1, y: 2},
    sortLayer: layers.player,
    state: "idle",
    animation: assetManager.getAnimation("player.lipe"),
    canvas,
    gridSize,
});

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
        quest: new QuestData({
            id: "collect_apples",
            name: "Coletar Maçãs",
            description: "Colete 3 maçãs",
            objectives: [
                { type: "collect", itemId: "apple", amount: 3 }
            ],
            rewards: [
                { 
                    type: "item", 
                    amount: 1, 
                    item: new ItemData({
                        id: "axe",
                        description: "uma machadinha para cortar lenha",
                        maxStack: 1,
                        name: "Machadinha",
                        stackable: false,
                        type: itemsTypes.TOOL,
                        icon: "src/assets/objects/forest-pack-sprites/axe.png",
                        onUse(){}
                    })
                }
            ],
            dialogs: {
                start: "Pode coletar 3 maçãs pra mim?",
                progress: "Ainda faltam maçãs...",
                complete: "Obrigado pelas maçãs!"
            }
        }),
        sortLayer: layers.underFloor,
        state: "idle",
        animation: assetManager.getAnimation("npc.baloo-f"),
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
        animation: assetManager.getAnimation("npc.bp"),
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
        animation: assetManager.getAnimation("obj.tree01"),
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
        animation: assetManager.getAnimation("obj.tree07"),
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
        animation: assetManager.getAnimation("obj.tree01"),
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
        animation: assetManager.getAnimation("obj.tree07"),
        gridSize,
        canvas: canvas,        
    }),
];

const itens = [
    new PickupItem({
        visible: false,
        itemData: new ItemData({
            id: "apple",
            name: "Maçã",
            stackable: true,
            maxStack: 10,
            type: "food",
            icon: "src/assets/objects/forest-pack-sprites/apple_01.png",
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
        sprite: "src/assets/objects/forest-pack-sprites/apple_01.png",
        canvas
    }),
    new PickupItem({
        visible: false,
        itemData: new ItemData({
            id: "apple",
            name: "Maçã",
            stackable: true,
            maxStack: 10,
            type: "food",
            icon: "src/assets/objects/forest-pack-sprites/apple_01.png",
            onUse(player){
                player.hp += 5
            }
        }),
        quantity: 2,
        position: {x: 7, y: 7},
        transform: {
            width: 0.5,
            height: 0.5
        },
        sortLayer: layers.ground,
        sprite: "src/assets/objects/forest-pack-sprites/apple_01.png",
        canvas
    }),
    new PickupItem({
        visible: false,
        itemData: new ItemData({
            id: "apple",
            name: "Maçã",
            stackable: true,
            maxStack: 10,
            type: "food",
            icon: "src/assets/objects/forest-pack-sprites/apple_01.png",
            onUse(player){
                player.hp += 5
            }
        }),
        quantity: 2,
        position: {x: 13, y: 2},
        transform: {
            width: 0.5,
            height: 0.5
        },
        sprite: "src/assets/objects/forest-pack-sprites/apple_01.png",
        canvas
    }),
]
//==========================

//objetos em cena.
const worldObjects = [...npcs, ...walls, ...trees, player, ...itens];

//esconde a mensagem de "carregando ..."
ui.hideWarning();

const game = new Game({
    canvas,
    ctx,
    grid,
    gridSize,
    eventBus,
    uiManager: ui,
    worldObjects
});

function gameLoop() {
    // 1. Atualiza o Gamepad (ele vai somar o estado dele ao que o teclado já marcou)
    inputManager.update();

    updateWorld(worldObjects, grid);
    game.update();
    game.draw();

    // 2. Lógica de Atirar (Espaço ou Gatilho do Controle)
    if (inputManager.state.shootPressed) {
        const isCollided = player.hitboxes?.find(hit => hit.hit.length > 0);
        if (!isCollided) {
            game.addObject(shooter(player, assetManager.getAnimation("obj.bexiga"), canvas, gridSize));
        }
    }

    // 3. Lógica de UI (Inventário, Quests, etc.)
    if (inputManager.state.inventory) {
        ui.toggleInventory();
    }
    if (inputManager.state.quest) {
        ui.toggleQuestUI();
    }

    // 4. Teclas Especiais (como o ESC)
    // Você pode adicionar 'escape' na sua classe InputManager se quiser centralizar tudo
    if (inputManager.state.escape) {
        ui.hideAll(); // Função hipotética para fechar tudo
    }

    // 3. Limpa os cliques únicos para o próximo frame
    inputManager.clearPresses(inputManager.state);

    requestAnimationFrame(gameLoop);
}

// document.addEventListener('keydown', (event) => {
//     event.preventDefault();
//     updateInputState(event.key, true, inputState);   

//     //dispara pelo teclado.
//     if (event.code === "Space") {
//         event.preventDefault();
        
//         const isCollided = player.hitboxes?.find(hit=> hit.hit.length > 0) ? true : false;

//         if(!isCollided){
//             //insere a instância no array de objetos globais para ser desenhado.
//             game.addObject(shooter(player, assetManager.getAnimation("obj.bexiga"), canvas, gridSize));
//         }
//     }
    
//     //ao teclar h simula um aviso na tela.
//     if (event.key === 'h' || event.key === 'H') {
//         game.uiManager.showWarning("Aviso: sistema de UI HTML ativo.");
//     }

//     if(["i", "I"].includes(event.key)){
//         game.uiManager.toggleInventory();
//     }

//     if(["q", "Q"].includes(event.key)){
//         game.uiManager.toggleQuestUI();
//     }

//     //oculta os UI se teclar esc.
//     if (event.key === 'Escape') {
//         game.uiManager.hideDialog();
//         game.uiManager.hideWarning();
//         game.uiManager.hideQuestUI();
//         game.uiManager.hideInventory();
//     }

//     if (event.repeat) return;
// });

// document.addEventListener('keyup', (event) => {
//     updateInputState(event.key, false, inputState);
// });

gameLoop();