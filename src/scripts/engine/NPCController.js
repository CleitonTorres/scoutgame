/**
 * Importação feita nesse modelo para evitar erro de referencia circular.
 * @typedef {import("../entities/NPC.js").NPC} NPC
*/

export class NPCController {
    /**
     * Controlador de movimento e estado do NPC.
     * @param {NPC} entity 
     * @param {{x: number, y: number}[]} points 
     * @param {number} speed 
     */
    constructor(entity, points = [], speed = 1) {
        this.entity = entity;

        // lista de pontos de destino
        this.points = points;

        // índice do ponto atual
        this.currentPoint = 0;

        // distância mínima para considerar que chegou
        this.arrivalThreshold = 0.05;

        // velocidade de decisão (não é a física)
        this.speed = speed;

        // estado atual
        this.inputX = 0;
        this.inputY = 0;
    }

    update() {
        if (!this.points.length) return;

        //se colidir com o player muda para animação parado.
        if(this.entity.hitboxes.some(box=> box.hit.some(obj=> obj?.tag === "Player"))){
            this.inputX = 0;
            this.inputY = 0;
            return;
        }

        const target = this.points[this.currentPoint];

        const dx = target.x - this.entity.x;
        const dy = target.y - this.entity.y;

        const distance = Math.hypot(dx, dy);

        // chegou no ponto
        if (distance < this.arrivalThreshold) {
            this.currentPoint++;

            if (this.currentPoint >= this.points.length) {
                this.currentPoint = 0; // loop
            }

            return;
        }

        // normaliza direção
        const length = distance || 1;

        this.inputX = dx / length;
        this.inputY = dy / length;

        // atualiza direção do sprite
        if (Math.abs(this.inputX) > 0.01) {
            this.entity.facing = this.inputX > 0 ? 1 : -1;
        }
    }

    getMovement() {
        return {
            inputX: this.inputX,
            inputY: this.inputY
        };
    }

    getState() {
        const moving =
            Math.abs(this.inputX) > 0.01 ||
            Math.abs(this.inputY) > 0.01;

        if (!moving) return "idle";

        if (Math.abs(this.inputY) >= Math.abs(this.inputX)) {
            return this.inputY < 0 ? "walkUp" : "walkDown";
        }

        return this.inputX < 0 ? "walkLeft" : "walkRight";
    }

}