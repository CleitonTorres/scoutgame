/**
 * @typedef {import("../../settings/typesProgressQuest").typesProgQuest} typesProgQuest
 * @typedef {import("./QuestData").QuestData} QuestData
 */

export class QuestInstance {
    /**
     * 
     * @param {QuestData} data
     */
    constructor(data) {
        this.data = data;

        /**
         * @type {typesProgQuest}
         */
        this.status = "not_started"; 
        this.progress = data.objectives.map(obj => ({
            ...obj,
            current: 0
        }));
    }

    isCompleted() {
        return this.progress.every(p => p.current >= p.amount);
    }
}