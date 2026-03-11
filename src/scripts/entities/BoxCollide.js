export class Collide{
    constructor({entity, showBoxCollide, offSetBoxCollide, anchorBoxCollide}={}){
        this.showBoxCollide = showBoxCollide || false;
        this.offSetBoxCollide = offSetBoxCollide || {x: 0, y: 0};
        this.anchorBoxCollide = anchorBoxCollide || {x: 0, y:0};
        this.entity = entity || null;
        this.ctx = this.entity?.canvas.getContext("2d") || null;
    }

    getBoxCollide(){
        const scaledWidth = (this.entity.width * this.entity.gridSize) * this.entity.scale;
        const scaledHeight = (this.entity.height * this.entity.gridSize) * this.entity.scale;

        return {
            x: (this.entity.nextPosX * this.entity.gridSize) + this.anchorBoxCollide.x + this.offSetBoxCollide.x,
            y: this.entity.nextPosY * this.entity.gridSize + this.anchorBoxCollide.y + this.offSetBoxCollide.y,
            width: scaledWidth - (this.offSetBoxCollide.x * 2),
            height: scaledHeight - (this.offSetBoxCollide.y * 2)
        };
    }

    // Desenha o hitbox do jogador, se a opção estiver ativada
    draw() {
        const boxCollide = this.getBoxCollide();

        if (this.showBoxCollide && this.ctx) {
            this.ctx.strokeStyle = 'blue';
            this.ctx.strokeRect(boxCollide.x, boxCollide.y, boxCollide.width, boxCollide.height);
        }
    }
}