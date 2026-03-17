import { getCollider } from "../engine/GetColliders.js";
import { getAnchor } from "../mathh/GetAnchor.js";
import { shapes } from "../settings/shapes.js";

/**
 * Classe para detectar sobreposições.
 */
export class HitBox{
    /**
     * Classe para detectar colisões
     * @param {{
     * owner: GameObject
     * showHitbox: boolean, 
     * offSetHitbox: {x: number, y: number}, 
     * anchorHitBox: {x: number, y: number}, 
     * shape: shapes
     * }} options 
     */
    constructor({owner, showHitbox, offSetHitbox, anchorHitBox, shape}={}){
        this.showHitbox = showHitbox || false;
        this.offSetHitbox = offSetHitbox || {x: 0, y: 0};
        this.anchorHitBox = anchorHitBox || {x: 0, y:0};
        this.owner = owner || null;
        this.ctx = this.owner?.canvas.getContext("2d") || null;
        this.sortLayer = this.owner?.sortLayer || 1;
        this.shape = shape || shapes.BOX;
        /**
         * Importação feita nesse modelo para evitar erro de referencia circular.
         * @typedef {import("../engine/GameObject.js").GameObject} GameObject
         * @typedef {import("../engine/Item/PickupItem.js").PickupItem} PickupItem
        */

        /**
         * @type {GameObject | PickupItem | null}
        */
        this.hit = null;//GameObjects Colididos
        this.collision = this.owner?.collision || false;
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
        const anchorTileX = this.anchorHitBox.x / this.owner.gridSize;
        const anchorTileY = this.anchorHitBox.y / this.owner.gridSize;
        const offSetX = this.offSetHitbox.x / this.owner.gridSize;
        const offSetY = this.offSetHitbox.y / this.owner.gridSize;

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

        if (this.showHitbox && this.ctx) {
            if(this.shape === "circle"){
                this.ctx.strokeStyle = 'red';
                this.ctx.beginPath();
                this.ctx.arc(
                    hitbox.x * this.owner.gridSize, 
                    hitbox.y * this.owner.gridSize, 
                    hitbox.radius * this.owner.gridSize, 
                    0, 
                    2 * Math.PI,
                );
                this.ctx.stroke();
            }else{
                this.ctx.strokeStyle = 'red';
                this.ctx.strokeRect(
                    (hitbox.x * this.owner.gridSize), 
                    (hitbox.y * this.owner.gridSize), 
                    (hitbox.width * this.owner.gridSize), 
                    (hitbox.height * this.owner.gridSize)
                );
            }
        }
    }
}