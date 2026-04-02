/**
 * Importação feita nesse modelo para evitar erro de referencia circular.
 * @typedef {import("../entities/NPC.js").NPC} NPC
*/

import { getAnchor } from "../mathh/GetAnchor.js";

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

        // --- IA de Inimigo ---
        this.detectionRange = 4; // Distância em tiles para detectar o player
        this.attackRange = 0.4;    // Distância em tiles para atacar
        this.isChasing = false;
        this.isAttacking = false;
        this.target = null;      // Referência ao player
    }

    /**
     * 
     * @param {import("../settings/Game.js").Game} game 
     * @returns 
     */
    update(game) {
        // 1. Se for um inimigo, tenta detectar o player
        if (this.entity.tag === "enemy" && game?.getActivePlayer()) {
            this._updateEnemyAI(game.getActivePlayer());
            
            // Se estiver atacando, não se move
            if (this.isAttacking) {
                this.inputX = 0;
                this.inputY = 0;
                return;
            }

            // Se estiver perseguindo, a lógica de patrulha é ignorada
            if (this.isChasing) return;
        }

        // 2. Se não for inimigo ou não detectou o player, segue a lógica normal de patrulha
        if (!this.points.length && !this.autoPatrol) return;

        // 2. Opcional: Mudar de direção aleatoriamente de tempos em tempos (apenas se não tiver pontos de patrulha fixos)
        if (this.autoPatrol && !this.points.length) {
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

    /**
     * Lógica interna para comportamento de inimigo
     * @param {import("../types/types.js").PlayerInstance} player
     */
    _updateEnemyAI(player) {
        const hitboxEntity = this.entity.collides[0]?.getHit(true);
        const hitboxPlayer = player.collides[0]?.getHit(true);
        if (!hitboxEntity || !hitboxPlayer) return; // Se não tiver hitbox, não faz nada

        // Calcula o centro de ambos os hitboxes para uma detecção mais precisa
        const centerEntity = getAnchor(hitboxEntity, "center");        
        const centerPlayer = getAnchor(hitboxPlayer, "center");
        
        // Calcula a distância entre o NPC e o player
        const dx = centerPlayer.x - centerEntity.x;
        const dy = centerPlayer.y - centerEntity.y;
        const distance = Math.hypot(dx, dy); // distância em tiles (assumindo que 1 tile = 1 unidade de distância)

        // Reset de estados
        this.isAttacking = false;

        // 1. Checa se deve atacar (muito perto)
        if (distance <= this.attackRange) {
            this.isAttacking = player.x >= this.entity.x ? 'attackRight' : 'attackLeft'; // Ataca para a direção do player
            this.isChasing = false;
            return;
        }

        // 2. Checa se deve perseguir (dentro do campo de visão)
        if (distance <= this.detectionRange) {
            this.isChasing = true;
            
            // Move em direção ao player
            const length = distance || 1;
            this.inputX = dx / length;
            this.inputY = dy / length;

            // Olha para o player
            if (Math.abs(this.inputX) > 0.01) {
                this.entity.facing = this.inputX > 0 ? 1 : -1;
            }
        } else {
            // Perdeu o player de vista
            this.isChasing = false;
        }
    }

    getMovement() {
        return {
            inputX: this.inputX,
            inputY: this.inputY
        };
    }

    getState() {
        if (this.isAttacking) {
            if(this.inputX >= 0) return this.isAttacking;
        };

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
            console.log(`${this.entity.name} bloqueado fisicamente!, mudando de direção.`);
            this.isBlocked = true;
            this.changeDirection();
        }
    }

    /**
     * Lógica de Patrulhamento: Escolhe uma nova direção ou pula para o próximo ponto
     */
    changeDirection() {
        if (this.points.length > 0) {
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

            // Atualiza direção do sprite (facing)
            if (Math.abs(this.inputX) > 0.01) {
                this.entity.facing = this.inputX > 0 ? 1 : -1;
            }
        }
    }    
}