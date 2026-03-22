import { objectivesQuest } from "../../settings/objectivesQuest.js";
import { rewardTypes } from "../../settings/rewardTypes.js";
import { typesProgQuest } from "../../settings/typesProgressQuest.js";
import { QuestData } from "./QuestData.js";
import { QuestInstance } from "./QuestInstance.js";

/**
 * Sistema gerenciador de quests.
 */
export class QuestSystem {
    /**
     * @typedef {import("../../entities/Player").Player} Player
     * @typedef {import("./QuestInstance").QuestInstance} QuestInstance
     * @typedef {import("../../settings/EventBus.js").EventBus} EventBus
     * @param {{player: Player, eventBus: EventBus}} options 
     */
    constructor({player, eventBus}) {
        this.player = player;
        this.eventBus = eventBus;

        /**
         * @type {QuestInstance[]}
         */
        this.quests = [];

        //ouvinte de coleta de itens.
        this.eventBus.on({
            event: "itemCollected", 
            callback: (data) => {
                this.updateProgress(objectivesQuest.COLLECT, data);
            }
        });
    }

    /**
     * 
     * @param {QuestData} questData 
     * @returns 
     */
    startQuest(questData) {
        const exists = this.quests.find(q => q.data.id === questData.id);
        if (exists) return exists;

        const quest = new QuestInstance(questData);
        quest.status = typesProgQuest.IN_PROGRESS;

        this.quests.push(quest);
        return quest;
    }

    /**
     * 
     * @param {QuestInstance} quest 
     */
    completeQuest(quest) {
        quest.status = typesProgQuest.COMPLETED;

        // dar recompensa
        quest.data.rewards.forEach(r => {
            if (r.type === rewardTypes.GOLD) {
                this.player.gold += r.amount;
            }else if(r.item){
                this.player.inventory.addItem(r.item, r.amount);
            }
        });
    } 

    /**
     * 
     * @param {import("../../settings/EventBus.js").EventType} type 
     * @param {import("../../settings/EventBus.js").Payload} payload 
     */
    updateProgress(type, payload) {
        this.quests.forEach(quest => {
            //atualiza o progresso da quest.
            quest.progress.forEach(p => {
                if (p.type === type) {
                    if (type === objectivesQuest.COLLECT && payload.itemId === p.itemId) {
                        p.current += payload.qtdItem || 1;

                        // dispara evento para ouvintes.
                        this.eventBus.emit({
                            event: "updateQuest",
                            payload: {
                                playerId: this.player.id,
                                itemId: quest.data.id,
                                qtdItem: p.current,
                                quests: this.quests,
                            }
                        });
                    }
                }
            });
        });
    }

    /**
     * 
     * @param {string} questid 
     * @returns {typesProgQuest}
     */
    getQuestState(questId) {
        const quest = this.quests.find(q=> q.id === questId);

        if (!quest) return typesProgQuest.NOT_STARTED;
        if (quest.isCompleted()) return typesProgQuest.COMPLETED;

        return quest.status;
    }

    /**
     * 
     * @param {string} questid 
     * @returns {QuestInstance}
     */
    getQuest(questId){
        return this.quests.find(q=> q.data.id === questId);
    }
}