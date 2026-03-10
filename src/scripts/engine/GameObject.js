import { drawAnimation, normalizeAnimation } from "./Animation.js";
import { AnimationController } from "./AnimatorController.js";
import { getCollider } from "./GetColliders.js";

/**
 * GameObject
 * ----------
 * Classe base da engine Scout Game.
 * Responsável por:
 * - Renderização
 * - Movimento
 * - Colisão
 * - Animação
 * - Interação física
 * 
 * Outros objetos devem herdar dela.
 */
export class GameObject {
    constructor(options = {}) {
        const {
            name = '',
            tag = 'GameObject',
            sortLayer = 0,

            transform = {},
            position = {},
            physical = {},

            state= "idle",
            animator = null,
            animation = {},

            showHitbox = false,
            showBoxCollide = false,
            anchorHitBox = {x: 0, y: 0}, //distância do ponto inicial para desenar o box.
            anchorBoxCollide = {x: 0, y: 0}, //distância do ponto inicial para desenar o box.
            offSetHitbox = { x: 0, y: 0 },
            offSetBoxCollide = { x: 0, y: 0 },

            gridSize = 64,
            canvas
        } = options;

        const {
            width = 1,
            height = 1,
            scale = 1
        } = transform;

        const {
            x = 0, // em tiles
            y = 0 // em tiles
        } = position;

        const {
            behavior = 'static',
            speed = 2,
            mass = 0,
            collision = false,
            smooth = 6
        } = physical;
        
        // ------------------------
        // IDENTIFICAÇÃO
        // ------------------------
        this.name = name;
        this.tag = tag;
        this.sortLayer = sortLayer;
        this.currentSortLayer = 0;

        // ------------------------
        // TRANSFORMAÇÃO
        // ------------------------
        this.width = width;
        this.height = height;
        this.scale = scale;

        // ------------------------
        // POSIÇÃO LÓGICA (GRID)
        // ------------------------
        this.x = x;
        this.y = y;

        // ------------------------
        // PROPRIEDADES FÍSICAS
        // ------------------------
        this.behavior = behavior === 'dynamic' ? 'dynamic' : 'static';
        this.speed = speed;
        this.mass = mass;
        this.collision = collision;
        this.smooth = Math.max(1, smooth);

        // ------------------------
        // DEBUG E CONFIGURAÇÕES
        // ------------------------
        this.showHitbox = showHitbox;
        this.showBoxCollide = showBoxCollide;
        this.anchorHitBox = anchorHitBox;
        this.anchorBoxCollide = anchorBoxCollide;
        this.offSetHitbox = offSetHitbox;
        this.offSetBoxCollide = offSetBoxCollide;
        this.gridSize = gridSize;
        this.canvas = canvas;

        // ------------------------
        // VELOCIDADE SUAVIZADA
        // ------------------------
        // vx e vy guardam a velocidade atual interpolada.
        // Isso permite movimentos suaves (aceleração gradual).
        this.vx = 0;
        this.vy = 0;

        // ------------------------
        // SISTEMA DE ANIMAÇÃO
        // ------------------------
        this.state = state;
        if (animator instanceof AnimationController) {
            this.animator = animator;
            this.animator.entity = this;
        } else {
            this.animator = new AnimationController(this);
        }
        this.animation = normalizeAnimation(animation);
        this.currentAnimation = 'idle';
        this.animationFrame = 0;

        // Mantem estado inicial sincronizado com o controlador.
        this.animator.setState(state);
        this.animator.update(0);

        // ------------------------
        // HITBOX INICIAL
        // ------------------------
        // Representa a área real de colisão do objeto.
        this.hitbox = this.getHitBox(this.x, this.y);

        // Representa a área "sólida" do objeto.
        this.collide = this.getHitboxCollide(this.x, this.y);
    }

    // Atualiza o hitbox para a posição atual do jogador
    updateHitbox() {
        this.hitbox = this.getHitBox(this.x, this.y);
    }

    updateHitBoxCollide(){
        this.collide = this.getHitboxCollide(this.x, this.y);
    }

    // Desenha o hitbox do jogador, se a opção estiver ativada
    drawHitbox(ctx) {
        if (this.showHitbox) {
            ctx.strokeStyle = 'red';
            ctx.strokeRect(this.hitbox.x, this.hitbox.y, this.hitbox.width, this.hitbox.height);
        }
    }

    // Desenha o hitbox do jogador, se a opção estiver ativada
    drawBoxCollide(ctx) {
        if (this.showBoxCollide) {
            ctx.strokeStyle = 'blue';
            ctx.strokeRect(this.collide.x, this.collide.y, this.collide.width, this.collide.height);
        }
    }

    // Retorna o hitbox para a posição de colisão, que pode ser diferente do hitbox de renderização
    getHitboxCollide(nextX, nextY) {
        const scaledWidth = (this.width * this.gridSize) * this.scale;
        const scaledHeight = (this.height * this.gridSize) * this.scale;

        return {
            x: (nextX * this.gridSize) + this.anchorBoxCollide.x + this.offSetBoxCollide.x,
            y: (nextY * this.gridSize) + this.anchorBoxCollide.y + this.offSetBoxCollide.y,
            width: scaledWidth - (this.offSetBoxCollide.x * 2),
            height: scaledHeight - (this.offSetBoxCollide.y * 2)
        };
    }

    getHitBox(nextX, nextY){
        const scaledWidth = (this.width * this.gridSize) * this.scale;
        const scaledHeight = (this.height * this.gridSize) * this.scale;

        return {
            x: (nextX * this.gridSize) + this.anchorHitBox.x + this.offSetHitbox.x,
            y: nextY * this.gridSize + this.anchorHitBox.y + this.offSetHitbox.y,
            width: scaledWidth - (this.offSetHitbox.x * 2),
            height: scaledHeight - (this.offSetHitbox.y * 2)
        };
    }

    isStatic() {
        return this.behavior === 'static';
    }

    isDynamic() {
        return this.behavior === 'dynamic' || this.behavior === 'dinamic';
    }

    /**
     * Garante que o objeto não saia dos limites do canvas
     * @param {*} nextX - posição X de destino 
     * @param {*} nextY - posição Y de destino.
     * @returns {} posX e posY garantidos que ele não vai sair da ela.
     */
    clampToCanvas(nextX, nextY) {
        const limitCanvasX = this.canvas.width / (this.width * this.gridSize) - 1;
        const limitCanvasY = this.canvas.height / (this.height * this.gridSize) - 1;

        return {
            x: Math.max(0, Math.min(limitCanvasX, nextX)),
            y: Math.max(0, Math.min(limitCanvasY, nextY)),
        };
    }

    // Verifica se o jogador pode ocupar a posição de destino, considerando os objetos colidíveis
    canOccupy(nextPosX, nextPosY, collidables = [], ignore = null) {
        const blocker = getCollider(
            nextPosX,
            nextPosY,
            collidables.filter((obj) => obj !== ignore), 
            "collide", 
            this
        );
        return !blocker;
    }

    /**
    * TENTA EMPURRAR UM OBJETO
    * --------------------------------------------------
    * Regras:
    * - O alvo deve ter colisão ativa
    * - O alvo deve ser dinâmico
    * - O alvo não pode ser estático
    * - A massa do objeto atual deve ser maior
    * - O destino do alvo deve estar livre
    * 
    * Se todas as regras forem satisfeitas,
    * o objeto é movido.
    */
    tryPush(target, deltaX, deltaY, collidables = []) {
        // Se não existe alvo ou ele não participa de colisão
        if (!target || !target.collision) return false;
        // Objetos estáticos nunca podem ser empurrados
        if (target.isStatic && target.isStatic()) return false;
        // Apenas objetos dinâmicos podem se mover
        if (!(target.isDynamic && target.isDynamic())) return false;
        // Verifica regra de massa (força)
        if (this.mass <= target.mass) return false;

        /**
        * Calcula nova posição desejada
        * Também respeita limites do canvas
        */
        const clamped = target.clampToCanvas
            ? target.clampToCanvas(target.x + deltaX, target.y + deltaY)
            : { x: target.x + deltaX, y: target.y + deltaY };

        /**
        * Verifica se o local para onde o alvo
        * será empurrado está livre
        */
        const canMove = target.canOccupy
            ? target.canOccupy(clamped.x, clamped.y, collidables, this)
            : true;

        if (!canMove) return false;

        // Move o objeto
        target.x = clamped.x;
        target.y = clamped.y;

        // Atualiza hitbox se existir
        if (target.updateHitbox) target.updateHitbox();
        return true;
    }

    /**
     * Tenta resolver o movimento para a posição de destino, considerando se há bloqueios ou objeto que podem ser empurados.
     * @param {*} nextX - posX de destino.
     * @param {*} nextY - posY de destino.
     * @param {*} deltaX - direção X.
     * @param {*} deltaY - direção Y.
     * @param {*} collidables - objetos globais.
     * @returns {boolean} - se puder seguir adiante retorna true, se não, false.
     */
    resolveAxis(nextX, nextY, deltaX, deltaY, collidables = []) {
        // Verifica se há um bloqueio na posição de destino
        const blocker = getCollider(nextX, nextY, collidables, "collide", this);

        // Se não houver bloqueio, move o jogador para a posição de destino
        if (!blocker) {
            this.x = nextX;
            this.y = nextY;
            return true;
        }

        // Se houver um bloqueio, tenta empurrar o objeto bloqueador para a posição de destino
        if (this.state === "push" && blocker) {
            const pushed = this.tryPush(blocker, deltaX, deltaY, collidables);
            if (pushed && !getCollider(nextX, nextY, collidables, "collide", this)) {
                this.x = nextX;
                this.y = nextY;
                return true;
            }
        }
        return false;
    }

    // Movimento suavizado usando interpolação linear.
    // Isso cria efeito de aceleração e desaceleração,
    // evitando movimento "seco" e instantâneo.
    update(inputX, inputY, collidables = []) {
        const maxStep = this.speed / 60;
        const smoothFactor = 1 / this.smooth;

        const length = Math.hypot(inputX, inputY) || 1;
        const targetVX = (inputX / length) * maxStep;
        const targetVY = (inputY / length) * maxStep;

        // Isso é uma interpolação gradual até a velocidade alvo.
        this.vx += (targetVX - this.vx) * smoothFactor;
        this.vy += (targetVY - this.vy) * smoothFactor;

        // Primeiro resolve o eixo X
        // Depois resolve o eixo Y
        // Isso evita bugs de colisão diagonal
        //this.x + thisvx calcula o nextPosX.
        const nextPosX = this.clampToCanvas(this.x + this.vx, this.y);
        const movedX = this.resolveAxis(nextPosX.x, this.y, this.vx, 0, collidables);
        if (!movedX) this.vx = 0;

        // Depois de resolver o movimento no eixo X, tenta resolver o movimento no eixo Y
        const nextPosY = this.clampToCanvas(this.x, this.y + this.vy);
        const movedY = this.resolveAxis(this.x, nextPosY.y, 0, this.vy, collidables);
        if (!movedY) this.vy = 0;

        // Atualiza o hitbox para a nova posição do jogador
        // Nesse momento posição x e y do player já está resulvida.
        this.updateHitbox();
        this.updateHitBoxCollide();

        // Atualiza animação pelo controlador centralizado.
        this.animator?.setState(this.state);
        this.animator?.update(1 / 60);
    }

    // Desenha animação se existir.
    // Caso contrário, desenha um retângulo azul padrão.
    // Útil para debug quando sprite ainda não foi definido.
    draw() {
        const ctx = this.canvas.getContext('2d');

        //se não foi fornecido uma animação, desenha um retangulo azul.
        const drawn = drawAnimation(this, ctx);
        if (!drawn) {
            ctx.fillStyle = 'blue';
            ctx.fillRect(
                this.x * this.gridSize,
                this.y * this.gridSize,
                this.gridSize * (this.width ?? 1) * (this.scale ?? 1),
                this.gridSize * (this.height ?? 1) * (this.scale ?? 1)
            );
        }

        this.drawHitbox(ctx);
        this.drawBoxCollide(ctx);
    }    
}
