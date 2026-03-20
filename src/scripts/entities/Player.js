import { CharacterController } from "../engine/CharacterController.js";
import { setFacingDirection } from "../engine/FacingDirectio.js";
import { GameObject } from "../engine/GameObject.js";
import { sortLayer } from "../engine/SortLayer.js";
import { SpatialHashGrid } from "../engine/SpatialHashGrid.js";
import { layers } from "../settings/layers.js";
import { tags } from "../settings/tags.js";
import { typesProgQuest } from "../settings/typesProgressQuest.js";
import { UIManager } from "../settings/UIManager.js";
import { drawLabel } from "../tools/DrawLabel.js";

/**
 * @typedef {import("../settings/Game.js").Game} Game
 * @typedef {import("../engine/Inventory.js").Inventory} Inventory
 */
export class Player extends GameObject {
    /**
    * @param {{
    *   hud?: UIManager,
    *   inventory?: Inventory,
    *   controller?: CharacterController
    * }} options
    */
    constructor(options= {}) {        
        super({...options});
        this.inventory = options?.inventory || null;
        this.controller = options?.controller || null;
        this.hp = 100; //vida do personagem.
        this.facingDirection = { x: 0, y: 1 };
        this.gold = 0;
    }

    /**
     * Atualização do Player
     * Aqui poderíamos futuramente:
     * - Adicionar sistema de vida
     * - Energia
     * - Inventário
     * - Ataque
     * @param {SpatialHashGrid} grid
     * @param {Game} game
     */
    update(grid, game) {        
        //se tiver um controller setado pega os valores dos inputs, se não retorna sempre o.
        const { inputX, inputY } = this.controller?.getMovement() || {x: 0, y: 0};

        //se tiver um controller setado pegar o estado atual da animação, se não, retorna idle por padrão.
        this.state = this.controller?.getState(inputX, inputY, this.facingDirection) || "idle";

        //atualiza o facingDirection para ser usado no disparo.
        setFacingDirection(this, inputX, inputY); 

        //atualiza dados dos NPCs e do Player.
        const collidables = grid?.query(this.x, this.y);

        // Chama o movimento base (que já atualiza todos os hitboxes internamente)
        super.update(inputX, inputY, collidables);

        // Busca automaticamente se algum hitbox detectou colisão
        const collidedHitbox = [...this.hitboxes, ...this.collides].find(box => box.hit);

        //sistema de coleta de itens.
        this.getCollides(game)

        if(collidedHitbox){
            // O sortLayer agora recebe o objeto colidido (box.hit)
            sortLayer(this, collidedHitbox.hit, this.gridSize); 
        } else {
            this.sortLayer = layers.player;
        }
    }

    draw(){
        if (!this.canvas) return;
        const ctx = this.canvas.getContext("2d");
        super.draw();
        drawLabel(this, ctx, this.name); //desenha o rótulo do personagem.
    }

    /**
     * 
     * @param {Game} game 
     */
    getCollides(game){
        this.hitboxes.forEach(box => {
            if(box.hit?.tag === tags.ITEM){
                /**
                 * @type {import("../engine/Item/PickupItem.js").PickupItem | null}
                 */
                const collect = this.tryCollect(box.hit, game.uiManager)
                
                //se coletou informa ao questSystem.
                if(collect){
                    game.eventBus.emit({
                        event: "itemCollected",
                        payload: {
                            playerId: this.id,
                            itemId: box.hit.itemData.id,
                            qtdItem: collect.quantity
                        }
                    });
                }
            }
            
            if(box.hit?.tag === tags.NPC_quest && game.uiManager && box.hit.quest &&
                !game.uiManager.isDialogOpen && this.controller.isDialog()
            ){  
                /**
                 * pega a quest que está no NPC.
                 * @type {import("../engine/Quest/QuestData.js").QuestData}
                 */
                const questData = box.hit.quest;
                const quest = game.questSystem.getQuest(questData.id);

                // 🟡 QUEST AINDA NÃO ACEITA
                if (!quest) {
                    console.log("ainda n tem quest")
                    game.uiManager.showDialog({
                        speaker: box.hit.name,
                        text: questData.dialogs.start,
                        buttons: {
                            cancelar: () => {
                                game.uiManager.hideDialog();
                            },
                            ok: () => {
                                game.questSystem.startQuest(questData);

                                game.uiManager.showWarning("Missão aceita!", 2000);
                                game.uiManager.hideDialog();
                                game.uiManager.showQuestUI();

                                //avisa aos ouvinter que aceitou a quest.
                                game.eventBus.emit({
                                    event: "questAccept",
                                    payload: {
                                        playerId: this.id,
                                        itemId: questData.id,
                                        quests: game.questSystem.quests,
                                    }
                                });
                            }
                        }
                    });

                    return;
                }

                // 🟢 COMPLETA
                if (quest.isCompleted()) {
                    console.log("completa")
                    game.questSystem.completeQuest(quest);

                    game.uiManager.showDialog({
                        speaker: box.hit.name,
                        text: quest.data.dialogs.complete
                    });

                    return;
                }

                // 🔵 EM PROGRESSO
                if (quest.status === typesProgQuest.IN_PROGRESS) {
                    console.log("quest em andamento")
                    game.uiManager.showDialog({
                        speaker: box.hit.name,
                        text: quest.data.dialogs.progress
                    });

                    return;
                }               

            }
        });

        if(this.hitboxes.every(b=> b.hit?.tag !== tags.NPC_quest)){
            game.uiManager.hideDialog();
        }
    }

    /**
     * 
     * @param {import("../engine/Item/PickupItem.js").PickupItem} item 
     * @param {import("../settings/UIManager.js").UIManager} hud
     */
    tryCollect(item, hud){
        const colected = item.tryCollect(this);
        if(colected){
            hud.renderInventory(this.inventory);
            return item;
        }
        return null;
    }
}
