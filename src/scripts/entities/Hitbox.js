/**
 * Classe para detectar sobreposições.
 */
export class HitBox{
    constructor({entity, showHitbox, offSetHitbox, anchorHitBox}={}){
        this.showHitbox = showHitbox || false;
        this.offSetHitbox = offSetHitbox || {x: 0, y: 0};
        this.anchorHitBox = anchorHitBox || {x: 0, y:0};
        this.entity = entity || null;
        this.ctx = this.entity?.canvas.getContext("2d") || null;
    }

    getHitBox(){
        const scaledWidth = (this.entity.width * this.entity.gridSize) * this.entity.scale;
        const scaledHeight = (this.entity.height * this.entity.gridSize) * this.entity.scale;

        return {
            x: (this.entity.nextPosX * this.entity.gridSize) + this.anchorHitBox.x + this.offSetHitbox.x,
            y: this.entity.nextPosY * this.entity.gridSize + this.anchorHitBox.y + this.offSetHitbox.y,
            width: scaledWidth - (this.offSetHitbox.x * 2),
            height: scaledHeight - (this.offSetHitbox.y * 2)
        };
    }

    // Desenha o hitbox do jogador, se a opção estiver ativada
    draw() {
        const hitbox = this.getHitBox();

        if (this.showHitbox && this.ctx) {
            this.ctx.strokeStyle = 'red';
            this.ctx.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
        }
    }
}