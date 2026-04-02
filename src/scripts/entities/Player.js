import { setFacingDirection } from "../engine/FacingDirectio.js";
import { GameObject } from "../engine/GameObject.js";
import { SpatialHashGrid } from "../engine/SpatialHashGrid.js";
import { tags } from "../settings/tags.js";
import { typesProgQuest } from "../settings/typesProgressQuest.js";
import { FloatingLabel } from "../tools/DrawLabel.js";
import Canvas from "../settings/Canvas.js";

/**
* Classe que representa o jogador controlado pelo usuário.
* Ela herda de GameObject, então tem todas as propriedades e métodos básicos de um objeto do jogo.
* O Player tem um inventário, pontos de vida (hp), direção que está enfrentando, quantidade de ouro e um rótulo flutuante com seu nome.
*/
export class Player extends GameObject {
    /**
    * @param {import("../types/types.js").PlayerType} options
    */
    constructor(options= {}) {        
        super({...options});
        
        this.inventory = options?.inventory ?? null;        
        this.facingDirection = { x: 0, y: 1 };
        this.gold = 0;
        this.floatingLabel = new FloatingLabel({text: this.name});

        this.hp = 100; //vida do personagem.
        this.invulnerable = false;
        this.invulnerableTimer = 0;
        this.invulnerableDuration = 60; // 1 segundo de proteção
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
        this.controller?.update(game.inputManager); // Atualiza o estado dos inputs a cada frame

        // ESTA É A LÓGICA QUE DECREMENTA O TIMER DE INVULNERABILIDADE E RESETA O ESTADO DE INVULNERÁVEL QUANDO O TIMER CHEGA A 0.:
        if (this.invulnerable) {
            this.invulnerableTimer--;
            if (this.invulnerableTimer <= 0) {
                this.invulnerable = false;
            }
        }

        // Se o HP chegar a 0, o player "morre"
        if (this.hp <= 0) {
            this.state = "death";
        }
        
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

        //sistema de coleta de itens.
        this.getCollides(game)

        this.floatingLabel.update();
    }

    draw(){
        const ctx = Canvas.getContext();
        super.draw();
        this.floatingLabel.draw(ctx, this)
    }

    /**
     * 
     * @param {import("../types/types.js").GameInstance} game 
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

                if (hit.tag === tags.ENEMY) {
                    // Verifica se o inimigo que encostou no player tem um hitbox ativo (frames 8-9)
                    const enemyHitbox = hit.hitboxes[0].collision && hit.hitboxes[0].hit.some(h => h === this);
                    if (enemyHitbox) {
                        this.takeDamage(10, game.uiManager); // Aplica o dano
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

    /**
     * Aplica dano ao player, considerando invulnerabilidade temporária após ser atingido.
     * @param {number} amount 
     * @param {import("../types/types.js").UIManagerInstance} uiManager 
     * @returns 
     */
    takeDamage(amount, uiManager) {
        if (this.hp <= 0 || this.invulnerable) return;
        
        this.hp -= amount;
        this.invulnerable = true;
        this.invulnerableTimer = this.invulnerableDuration;
        
        if (uiManager) {
            uiManager.showWarning(`Dano recebido! HP: ${this.hp}`, 1000);
        }
    }

}
