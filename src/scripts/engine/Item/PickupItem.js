import { ItemEntity } from "./ItemEntity.js";

export class PickupItem extends ItemEntity {
    constructor(options = {}) {
        super(options);

        this.autoPickup = true;
    }

    tryCollect(target){
        if(!target.inventory) return false;

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