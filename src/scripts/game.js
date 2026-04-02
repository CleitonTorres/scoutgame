import { UIManager } from "./settings/UIManager.js";
import { SpatialHashGrid } from "./engine/SpatialHashGrid.js";
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

//objetos em cena.
const initialScene = new InitialScene();
const objects = await initialScene.getObjects();
const worldObjects = objects;

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
    // Pega apenas os objetos que ainda estão ativos no jogo
    const activeObjects = game.getAllWorldObjects();
    
    updateWorld(activeObjects, spatialGrid);

    game.update();
    game.draw();

    requestAnimationFrame(gameLoop);
}

gameLoop();