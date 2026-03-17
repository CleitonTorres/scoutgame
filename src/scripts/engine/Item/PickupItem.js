import { Player } from "../../entities/Player.js";
import { ItemEntity } from "./ItemEntity.js";

/**
 * Classe de item coletável.
 */
export class PickupItem extends ItemEntity {
    constructor(options = {}) {
        super(options);

        this.autoPickup = true;
    }

    /**
     * 
     * @param {Player} target 
     * @returns {boolean}
     */
    tryCollect(target){
        if(!target.inventory) return false;
        if(this.destroyed) return false;
        
        const collected = target.inventory.addItem(
            this.itemData,
            this.quantity
        );

        if(collected){
            this.onCollected();
        }

        return collected;
    }

    onCollected(){
        this.destroyed = true;
    }

}