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
     * @param {boolean} autoPatrol - Se true, o NPC muda de direção aleatoriamente quando não tiver pontos fixos
     */
    constructor(entity, points = [], speed = 1, autoPatrol = false) {
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

        this.autoPatrol = autoPatrol || false; // se true, o NPC muda de direção aleatoriamente quando não tiver pontos fixos
        this.changeDirTimer = 0;
        this.isBlocked = false;
        this.blockTimer = 0;
    }

    update() {
        if (!this.points.length) return;

        // 2. Opcional: Mudar de direção aleatoriamente de tempos em tempos (apenas se não tiver pontos de patrulha fixos)
        if (this.points.length === 0) {
            this.changeDirTimer++;
            if (this.changeDirTimer > 200) {
                this.changeDirection();
                this.changeDirTimer = 0;
            }
            return;
        }

        // 3. Lógica de Patrulha por Pontos
        const target = this.points[this.currentPoint];

        const dx = target.x - this.entity.x;
        const dy = target.y - this.entity.y;

        const distance = Math.hypot(dx, dy);

        // Chegou no ponto?
        if (distance < this.arrivalThreshold) {
            this.currentPoint++;
            if (this.currentPoint >= this.points.length) {
                this.currentPoint = 0; // loop
            }
            return;
        }

        // Normaliza direção para o alvo
        const length = distance || 1;
        this.inputX = dx / length;
        this.inputY = dy / length;

        // Atualiza direção do sprite (facing)
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

    /**
     * Método chamado pelo NPC quando uma colisão real é detectada no motor de física.
     */
    onCollision() {
        if (!this.isBlocked) {
            console.log(`${this.name} bloqueado fisicamente!, mudando de direção.`);
            this.isBlocked = true;
            this.changeDirection();
        }
    }

    /**
     * Lógica de Patrulhamento: Escolhe uma nova direção ou pula para o próximo ponto
     */
    changeDirection() {
        if (this.points.length > 0) {
            console.log(`${this.entity.name} colidiu! Indo para próximo ponto de patrulha.`);
            // Se tem pontos de patrulha, pula para o próximo ponto ao colidir
            this.currentPoint = (this.currentPoint + 1) % this.points.length;
        } else {
            // Se é movimento aleatório, escolhe uma nova direção
            const directions = [
                { x: 1, y: 0 }, { x: -1, y: 0 },
                { x: 0, y: 1 }, { x: 0, y: -1 }
            ];
            const newDir = directions[Math.floor(Math.random() * directions.length)];
            this.inputX = newDir.x;
            this.inputY = newDir.y;
        }
    }    
}