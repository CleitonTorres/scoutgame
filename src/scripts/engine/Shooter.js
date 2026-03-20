import { Ballon } from "../entities/Ballon.js";
import { getRadiusToSpaw } from "../mathh/GetRadiusToSpaw.js";
import { layers } from "../settings/layers.js";
import { tags } from "../settings/tags.js";

/**
 * 
 * @param {import("../entities/Player.js").Player} player 
 * @param {import("./Animation.js").AnimationType} ballonAnimation 
 * @param {HTMLCanvasElement} canvas 
 * @param {number} gridSize 
 * @returns 
 */
export function shooter(player, ballonAnimation, canvas, gridSize){
    //pegar a posição para spawnar o balão pelo centro do player.
    const {x, y} = getRadiusToSpaw(player, 10, gridSize);
    const ballon = new Ballon({
        name: `Ballon-${Date.now()}`,
        tag: tags.BALLON,
        position: { x, y },
        direction: player.facingDirection,
        physical:{
            collision: true,
            mass: 8,
            speed: 6 
        },
        transform:{
            width: 0.35,
            height: 0.35,
        },
        hitboxes: [
            {
                offSetHitbox: {x:0, y:0},
                anchorHitBox: {x:0, y:0},
                showHitbox:false
            }
        ],
        state: "move",
        animation: {...ballonAnimation, hit: {...ballonAnimation.hit, loop: false}},
        owner: player,
        sortLayer: layers.player,
        canvas,
        gridSize,
    });
    
    return ballon;   
}