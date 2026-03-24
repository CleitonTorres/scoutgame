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
import Canvas from "./settings/Canvas.js";
import AssetManager from "./settings/AssetsManager.js";
import { InitialScene } from "./scenes/initial.js";

//sistema de listeners
const eventBus = new EventBus

//sistema de gerenciamento do UI/UX/HUD
const ui = new UIManager(eventBus);

//mostra a mensagem de "carregando..."
ui.showWarning("Carregando jogo...", 0);
const isLoaded = await AssetManager.loadAll();

const canvas = Canvas.getCanvas();
const ctx = Canvas.getContext();
const gridSize = Canvas.getGridsize();

//gerenciador de entradas
const inputManager = new InputManager();

//instancia o grid virtual para colisões.
const grid = new SpatialHashGrid(2);

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
    position:{x: 14, y: 8},
    sortLayer: layers.player,
    state: "idle",
    animation: AssetManager.getAnimation("player.lipe"),
    canvas,
    gridSize,
});

//==========================

//objetos em cena.
const initialScene = new InitialScene();
const objects = initialScene.getObjects();
const worldObjects = [...objects, player];

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
            game.addObject(
                shooter(player, assetManager.getAnimation("obj.bexiga"), 
                canvas, 
                gridSize,
                game.worldTransform
            ));
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

gameLoop();