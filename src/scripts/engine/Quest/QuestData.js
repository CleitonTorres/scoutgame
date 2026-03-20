import { objectivesQuest } from "../../settings/objectivesQuest.js";
import { rewardTypes } from "../../settings/rewardTypes.js";
/**
 * tipos usads na quest.
 * @typedef {import("../Item/ItemData").ItemData} ItemData 
 * @typedef {{type: objectivesQuest, itemId: string, amount: number}} Objectives
 * @typedef {{type: rewardTypes, amount: number, item?: ItemData }} Reward
 */
export class QuestData {
    /**
     * Parametros da quest.
     * @param {{
     *  id: string,
     *  name: string,
     *  description: string,
     *  objectives: Objectives[],
     *  rewards: Reward[],
     *  dialogs: {
     *  start: string, 
     *  progress: string, 
     *  complete: string,
     * }
     * }} options 
     */
    constructor({
        id,
        name,
        description,
        objectives = [],
        rewards = [],
        dialogs = {}
    }) {
        this.id = id;
        this.name = name;
        this.description = description;

        this.objectives = objectives;
        this.rewards = rewards;

        this.dialogs = dialogs;
    }
}