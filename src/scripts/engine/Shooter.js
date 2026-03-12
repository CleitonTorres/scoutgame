import { Ballon } from "../entities/Ballon.js";
import { getRadiusToSpaw } from "../mathh/GetRadiusToSpaw.js";
import { layers } from "../settings/layers.js";

export function shooter(player, ballonAnimation, canvas, gridSize){
    //pegar a posição para spawnar o balão pelo centro do player.
    const {x, y} = getRadiusToSpaw(player, 10, gridSize);
    const ballon = new Ballon({
        name: `Ballon-${Date.now()}`,
        tag: "Ballon",
        position: { x, y },
        direction: player.facingDirection,
        physical:{
            collision: true,
            mass: 1,
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
        animation: ballonAnimation,
        owner: player,
        sortLayer: layers.player,
        canvas,
        gridSize,
    });
    
    return ballon;   
}