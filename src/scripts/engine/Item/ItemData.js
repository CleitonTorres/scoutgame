import { itemsTypes } from "../../settings/itemsTypes.js";
/**
 * Importação feita nesse modelo para evitar erro de referencia circular.
 * @typedef {import("../../entities/Player.js").Player} Player
*/

/**
 * Estrutura de dados de item.
 */
export class ItemData {
    /**
     * Estrutura de dados de item.
     * @param {{
     * id: number,
     * name: string,
     * description: string,
     * stackable: boolean,
     * maxStack: number,
     * type: itemsTypes,
     * icon: string,
     * onUse: (player: Player)=>void
     * }} options
     */
    constructor({
        id,
        name,
        description = "",
        stackable = false,
        maxStack = 1,
        type = itemsTypes.GENERIC,
        icon = null,
        onUse = null
    }) {
        this.id = id;
        this.name = name;
        this.description = description;

        this.stackable = stackable;
        this.maxStack = maxStack;

        this.type = type;
        this.icon = icon;

        this.onUse = onUse; //função executada na coleta.
    }
}