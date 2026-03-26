import { Player } from "./entities/Player.js";
import { layers } from "./settings/layers.js";
import { UIManager } from "./settings/UIManager.js";
import { SpatialHashGrid } from "./engine/SpatialHashGrid.js";
import { shooter } from "./engine/Shooter.js";
import { CharacterController } from "./engine/CharacterController.js";
import { Inventory } from "./engine/Inventory.js";
import { tags } from "./settings/tags.js";
import { Game } from "./settings/Game.js";
import { EventBus } from "./settings/EventBus.js";
import { updateWorld } from "./engine/UpdateSpatialGrid.js";
import { InputManager } from "./settings/InputManager.js";
import AssetManager from "./settings/AssetsManager.js";
import { InitialScene } from "./scenes/initial.js";

//sistema de listeners
const eventBus = new EventBus

//sistema de gerenciamento do UI/UX/HUD
const ui = new UIManager(eventBus);

//mostra a mensagem de "carregando..."
ui.showWarning("Carregando jogo...", 0);
await AssetManager.loadAll();

//gerenciador de entradas
const inputManager = new InputManager();

//instancia o grid virtual para colisões.
const spatialGrid = new SpatialHashGrid(2);

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
    showShadow: true,
    controller: new CharacterController(inputManager.state),
    inventory: new Inventory(20),
    position:{x: 14, y: 8},
    sortLayer: layers.underFloor,
    state: "idle",
    animation: AssetManager.getAnimation("player.lipe"),
});

//==========================

//objetos em cena.
const initialScene = new InitialScene();
const objects = initialScene.getObjects();
const worldObjects = [...objects, player];

//esconde a mensagem de "carregando ..."
ui.hideWarning();

const game = new Game({
    spatialGrid,
    eventBus,
    uiManager: ui,
    inputManager,
    worldObjects
});

function gameLoop() {
    updateWorld(worldObjects, spatialGrid);

    game.update();
    game.draw();

    requestAnimationFrame(gameLoop);
}

gameLoop();