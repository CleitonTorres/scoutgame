import { drawAnimation, normalizeAnimation } from "./Animation.js";
import { AnimationController } from "./AnimatorController.js";
import { getCollider } from "./GetColliders.js";
import { HitBox } from "../entities/Hitbox.js";
import { Collide } from "../entities/BoxCollide.js";

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

            hitboxes = [],
            collides = [],

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
        this.nextPosX = x;
        this.nextPosY = y;

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
        this.hitboxes = (hitboxes || []).map(config =>
            new HitBox({
                ...config,
                entity: this
            })
        );

        // Representa a área "sólida" do objeto.
        this.collides = (collides || []).map(config =>
            new Collide({
                ...config,
                entity: this
            })
        );
    }

    isStatic() {
        return this.behavior === 'static';
    }

    isDynamic() {
        return this.behavior === 'dynamic';
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
        // if (target.updateHitbox) target.updateHitbox();
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
            
            if (pushed) {

                const stillBlocked = getCollider(nextX, nextY, collidables, "collide", this);

                if (!stillBlocked) {
                    this.x = nextX;
                    this.y = nextY;
                    return true;
                }

            }
        }

        // bloqueado → cancela movimento
        return false;
    }

    // Movimento suavizado usando interpolação linear.
    // Isso cria efeito de aceleração e desaceleração,
    // evitando movimento "seco" e instantâneo.
    update(inputX, inputY, collidables = []) {
        const maxStep = this.speed / 60;
        const smoothFactor = 1 / this.smooth;

        const length = Math.hypot(inputX, inputY);
        const targetVX = length ? (inputX / length) * maxStep : 0;
        const targetVY = length  ? (inputY / length) * maxStep : 0;

        // Isso é uma interpolação gradual até a velocidade alvo.
        this.vx += (targetVX - this.vx) * smoothFactor;
        this.vy += (targetVY - this.vy) * smoothFactor;

        // fricção natural
        if (length === 0) {
            this.vx *= 0.6;
            this.vy *= 0.6;
        }

        // Primeiro resolve o eixo X
        // Depois resolve o eixo Y
        // Isso evita bugs de colisão diagonal
        //this.x + thisvx calcula o nextPosX.
        this.nextPosX = this.clampToCanvas(this.x + this.vx, this.y).x;
        const movedX = this.resolveAxis(this.nextPosX, this.y, this.vx, 0, collidables);
        if (!movedX) this.vx = 0;

        // Depois de resolver o movimento no eixo X, tenta resolver o movimento no eixo Y
        this.nextPosY = this.clampToCanvas(this.x, this.y + this.vy).y;
        const movedY = this.resolveAxis(this.x, this.nextPosY, 0, this.vy, collidables);
        if (!movedY) this.vy = 0;

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

        //detecta sobreposições.
        if(this.hitboxes && this.hitboxes.length > 0){
            this.hitboxes.filter(Boolean).forEach(box => {
                box.draw()
            });
        }

        // detecta bloqueios físicos.
        if(this.collides && this.collides.length > 0){
            this.collides.filter(Boolean).forEach(box => {
                box.draw()
            });
        }

    }    
}
