import { getCollider } from "../engine/GetColliders.js";

export class Collide{
    constructor({owner, showBoxCollide, offSetBoxCollide, anchorBoxCollide, shape}={}){
        this.showBoxCollide = showBoxCollide || false;
        this.offSetBoxCollide = offSetBoxCollide || {x: 0, y: 0};
        this.anchorBoxCollide = anchorBoxCollide || {x: 0, y:0};
        this.owner = owner || null;
        this.ctx = this.owner?.canvas.getContext("2d") || null;
        this.sortLayer = this.owner?.sortLayer || 1;
        this.shape = shape || "box";
        this.hit = null;
        this.collision = this.owner?.collision || false;
    }

    /**
    * retorna valores em tiles.
    * @returns 
    */
    getHit(){
        const scaledWidth = this.owner.width * this.owner.scale;
        const scaledHeight = this.owner.height * this.owner.scale;

        //offSetHit e anchorHit vem em pixel e precisa ser convertido para tile.
        const anchorTileX = this.anchorBoxCollide.x / this.owner.gridSize;
        const anchorTileY = this.anchorBoxCollide.y / this.owner.gridSize;
        const offSetX = this.offSetBoxCollide.x / this.owner.gridSize;
        const offSetY = this.offSetBoxCollide.y / this.owner.gridSize;
        
        return {
            x: this.owner.nextPosX + anchorTileX + offSetX,
            y: this.owner.nextPosY + anchorTileY + offSetY,
            width: scaledWidth - (offSetX * 2),
            height: scaledHeight - (offSetY * 2)
        };
    }

    update(otherCollides){
        this.hit = getCollider(this, this.owner, otherCollides, "collide");
    }
    
    // Desenha o hitbox do jogador, se a opção estiver ativada
    draw() {
        const boxCollide = this.getHit();

        if (this.showBoxCollide && this.ctx) {
            this.ctx.strokeStyle = 'blue';
            this.ctx.strokeRect(
                (boxCollide.x * this.owner.gridSize), 
                (boxCollide.y * this.owner.gridSize), 
                (boxCollide.width * this.owner.gridSize), 
                (boxCollide.height * this.owner.gridSize)
            );
        }
    }
}