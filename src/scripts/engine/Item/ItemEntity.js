import { layers } from "../../settings/layers.js";
import { drawLabel } from "../../tools/DrawLabel.js";
import { GameObject } from "../GameObject.js";

export class ItemEntity extends GameObject {
    constructor(options = {}) {
        const {
            itemData, //dados que vem de ItemData, informado na instanciação.
            quantity = 1
        } = options;

        super({
            ...options,
            tag: "Item",
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
            sortLayer: layers.underFloor,
        });

        this.itemData = itemData;
        this.quantity = quantity;
    }

    draw(){
        drawLabel(this, this.canvas.getContext("2d"), "Item")
        super.draw()
    }
}