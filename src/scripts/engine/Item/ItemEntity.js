import { layers } from "../../settings/layers.js";
import { tags } from "../../settings/tags.js";
import { drawLabel } from "../../tools/DrawLabel.js";
import { GameObject } from "../GameObject.js";

/**
 * Classe de objeto do tipo item. Se for um item coletável precisa ser instanciado pelo PickupItem. 
 */
export class ItemEntity extends GameObject {
    constructor(options = {}) {
        const {
            itemData, //dados que vem de ItemData, informado na instanciação.
            quantity = 1,
            sortLayer
        } = options;

        super({
            ...options,
            tag: tags.ITEM,
            name: options?.itemData?.name || '',
            physical: {
                behavior: "static",
                collision: false
            },
            hitboxes: [
                {
                    offSetHitbox: {x:0, y: 0},
                    anchorHitBox: {x:0, y:0},
                    showHitbox: false
                }
            ],
            sortLayer: sortLayer || layers.underFloor,
        });

        this.itemData = itemData;
        this.quantity = quantity;
    }

    draw(){
        drawLabel(this, this.canvas.getContext("2d"), this.name)
        super.draw()
    }
}