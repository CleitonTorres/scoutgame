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
 * @typedef {import("../engine/Item/PickupItem.js").PickupItem} PickupItem 
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
     * @param {{width: number, height: number}} worldTransform
     */
    update(grid, game, worldTransform) {        
        //se tiver um controller setado pega os valores dos inputs, se não retorna sempre o.
        const { inputX, inputY } = this.controller?.getMovement() || {x: 0, y: 0};

        //se tiver um controller setado pegar o estado atual da animação, se não, retorna idle por padrão.
        this.state = this.controller?.getState(inputX, inputY, this.facingDirection) || "idle";

        //atualiza o facingDirection para ser usado no disparo.
        setFacingDirection(this, inputX, inputY); 

        //atualiza dados dos NPCs e do Player.
        const collidables = grid?.query(this.x, this.y);

        // Chama o movimento base (que já atualiza todos os hitboxes internamente)
        super.update(inputX, inputY, collidables, worldTransform);

        // Busca automaticamente se algum hitbox detectou colisão
        const collidedHitbox = [...this.hitboxes, ...this.collides].find(box => box.hit.length > 0);

        //sistema de coleta de itens.
        this.getCollides(game)
        
        if(collidedHitbox){
            collidedHitbox.hit.forEach(hit=>{
                // O sortLayer agora recebe o objeto colidido (box.hit)
                sortLayer(this, hit, this.gridSize);
            })
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
            box.hit.forEach(hit=>{
                if(hit.tag === tags.ITEM){
                    /**
                    * @type {PickupItem | null}
                    */
                    const collect = this.tryCollect(hit, game.uiManager)
                    
                    //se coletou informa ao questSystem.
                    if(collect){
                        // dispara o evento para os ouvintes relacionados a coleta de itens
                        // em especial para cumprir quests.
                        game.eventBus.emit({
                            event: "itemCollected",
                            payload: {
                                playerId: this.id,
                                itemId: collect.itemData.id,
                                qtdItem: collect.quantity
                            }
                        });
                    }
                }

                if(hit.tag === tags.NPC_quest && game.uiManager && hit.quest &&
                    !game.uiManager.isDialogOpen && this.controller.isDialog()
                ){  
                    /**
                     * pega a quest que está no NPC.
                     * @type {import("../engine/Quest/QuestData.js").QuestData}
                     */
                    const questData = hit.quest;
                    const quest = game.questSystem.getQuest(questData.id);

                    // 🟡 QUEST AINDA NÃO ACEITA
                    if (!quest) {
                        console.log("ainda n tem quest")
                        game.uiManager.showDialog({
                            speaker: hit.name,
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

                                    const objects = game.getAllWorldObjects();
                                    const apples = objects.filter(o=> o.name === "Maçã");

                                    for(const apple of apples){
                                        if(apple){
                                            apple.visible = true;
                                            game.updateObject(apple);
                                        }
                                    }

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
                    if (quest.isCompleted() && quest.status !== typesProgQuest.COMPLETED) {
                        game.questSystem.completeQuest(quest);

                        const reward = quest.data.rewards.map(rw=> {
                            if(rw.item){
                                return `${rw.amount} ${rw.type} ${rw.item.name || ''}.`
                            }else{
                                return `${rw.amount} ${rw.type}.`;
                            }
                        });
                        const hasItem = quest.data.rewards.filter(rw=> rw.item);
                        
                        game.uiManager.showDialog({
                            speaker: hit.name,
                            text: `${quest.data.dialogs.complete} Você recebeu ${reward.join(", ")}`
                        });

                        // dispara evento para ouvintes.
                        game.eventBus.emit({
                            event: "updateQuest",
                            payload: {
                                playerId: this.id,
                                itemId: quest.data.id,
                                quests: game.questSystem.quests,
                            }
                        }); 

                        //add listeners for eatch reward that conteins items.
                        for(const rw of hasItem){
                           game.eventBus.emit({
                                event: "itemCollected",
                                payload: {
                                    playerId: this.id,
                                    itemId: rw.item.id,
                                    qtdItem: rw.amount,
                                    inventory: this.inventory
                                }
                            });
                        }

                        return;
                    }

                    // 🔵 EM PROGRESSO
                    else if (quest.status === typesProgQuest.IN_PROGRESS) {
                        console.log("quest em andamento")
                        game.uiManager.showDialog({
                            speaker: hit.name,
                            text: quest.data.dialogs.progress
                        });

                        return;
                    } 
                    
                    // missão já completa.
                    else {
                        game.uiManager.showDialog({
                            speaker: hit.name,
                            text: `Você já concluiu esse missão!`
                        });
                    }

                }
            })
        });

        if(this.hitboxes.every(box=> box.hit?.every(hit=> hit.tag !== tags.NPC_quest))){
            game.uiManager.hideDialog();
        }
    }

    /**
     * Auxiliary function for collecting items.
     * @param {PickupItem} item 
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
