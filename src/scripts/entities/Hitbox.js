import { getCollider } from "../engine/GetColliders.js";
import { getAnchor } from "../mathh/GetAnchor.js";
import Canvas from "../settings/Canvas.js";
import { shapes } from "../settings/shapes.js";

/**
 * Classe para detectar sobreposições.
 */
export class HitBox{
    /**
     * Classe para detectar colisões
     * @param {import("../types/types.js").HitBoxType} options 
     */
    constructor({owner, showHitbox, offSetHitbox, anchorHitBox, shape, collision, color}={}){
        this.showHitbox = showHitbox || false;
        this.offSetHitbox = offSetHitbox || {x: 0, y: 0};
        this.anchorHitBox = anchorHitBox || {x: 0, y:0};
        this.owner = owner || null;
        this.sortLayer = this.owner?.sortLayer || 1;
        this.shape = shape || shapes.BOX;
        this.collision = collision ?? false; // Indica se a colisão está ativa ou não, pode ser controlada externamente para ativar/desativar a detecção de colisão.
        this.color = color || 'red'; // Cor para desenhar o hitbox, útil para depuração.

        /**
         * @type {import("../types/types.js").GameObjectInstance[] | import("../types/types.js").PickupItemInstance[] }
        */
        this.hit = [];//GameObjects Colididos
    }

    /**
    * retorna valores em tiles. Faço o calculo em pixel depois retorno para tile para evitar
    * erro na multiplicação da escala por valores pequenos (0,001).
    * @returns 
    */
    getHit(){
        //para o circle
        const radius = (this.owner.width * this.owner.scale) / 2;
        const center = getAnchor(this.owner, "middle");

        //para o box
        const scaledWidth = this.owner.width * this.owner.scale;
        const scaledHeight = this.owner.height * this.owner.scale;

        //offSetHit e anchorHit vem em pixel e precisa ser convertido para tile.
        const anchorTileX = this.anchorHitBox.x / Canvas.getGridsize();
        const anchorTileY = this.anchorHitBox.y / Canvas.getGridsize();
        const offSetX = this.offSetHitbox.x / Canvas.getGridsize();
        const offSetY = this.offSetHitbox.y / Canvas.getGridsize();

        if(this.shape === "circle"){
            return {
                x: center.x + anchorTileX + offSetX,
                y: center.y + anchorTileY + offSetY,
                radius: radius - (offSetX * 2),
            };
        } else {
            return {
                x: this.owner.nextPosX + anchorTileX + offSetX,
                y: this.owner.nextPosY + anchorTileY + offSetY,
                width: scaledWidth - (offSetX * 2),
                height: scaledHeight - (offSetY * 2)
            };
        }
    }

    update(otherCollides){
        if(!this.collision) return;
        
        this.hit = getCollider(this, this.owner, otherCollides, "hitbox") ?? null;
    }

    // Desenha o hitbox do jogador, se a opção estiver ativada
    draw() {
        const hitbox = this.getHit();

        if (this.showHitbox) {
            if(this.shape === "circle"){
                Canvas.getContext().strokeStyle = this.color ?? 'red';
                Canvas.getContext().beginPath();
                Canvas.getContext().arc(
                    hitbox.x * Canvas.getGridsize(), 
                    hitbox.y * Canvas.getGridsize(), 
                    hitbox.radius * Canvas.getGridsize(), 
                    0, 
                    2 * Math.PI,
                );
                Canvas.getContext().stroke();
            }else{
                Canvas.getContext().strokeStyle = this.color ?? 'red';
                Canvas.getContext().strokeRect(
                    (hitbox.x * Canvas.getGridsize()), 
                    (hitbox.y * Canvas.getGridsize()), 
                    (hitbox.width * Canvas.getGridsize()), 
                    (hitbox.height * Canvas.getGridsize())
                );
            }
        }
    }
}