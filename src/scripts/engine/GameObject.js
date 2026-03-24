import { drawAnimation, normalizeAnimation } from "./Animation.js";
import { AnimationController } from "./AnimatorController.js";
import { HitBox } from "../entities/Hitbox.js";
import { Collide } from "../entities/BoxCollide.js";
import { tags } from "../settings/tags.js";
import { layers } from "../settings/layers.js";
import { behaviors } from "../settings/behaviors.js";

/**
 * @typedef {{
    *  name: string,
    *  tag: tags,
    *  sortLayer: layers,
    *  visible: boolean,
    *  transform: {
    *    width: number,
    *    height: number,
    *    scale: number
    *  },
    *  position: {x: number, y: number},
    *  physical: {
    *    behavior: behaviors,
    *    speed: number,
    *    mass: number,
    *    collision: boolean,
    *    smooth: number
    *  },
    *  state: string,
    *  animator?: AnimationController,
    *  sprite?: HTMLImageElement,
    *  animation?: {
    *   [anim: string]: {
    *        frames: [];
    *        fps: number;
    *        loop: boolean;
    *  }},
    *  hitboxes: HitBox[],
    *  collides: Collide[],
    *  gridSize: number,
    *  canvas: HTMLCanvasElement
    * }} GameObjectType
 */
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
    /**
    * 
    * @param {GameObjectType} options 
    */
    constructor(options = {}) {
        const {
            name = '',
            tag = tags.GAMEOBJECT,
            sortLayer = 0,
            visible = true,

            transform = {},
            position = {},
            physical = {},

            state= "idle",
            animator = null,
            sprite = "",
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
            behavior = behaviors.STATIC,
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
        this.visible = visible;

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
        this.sprite = sprite;
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
                owner: this
            })
        );

        // Representa a área "sólida" do objeto.
        this.collides = (collides || []).map(config =>
            new Collide({
                ...config,
                owner: this
            })
        );

        this.id = 0;
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
     * @param {{width: number, height: number}} worldTransform
     * @returns {} posX e posY garantidos que ele não vai sair da ela.
     */
    clampToCanvas(nextX, nextY, worldTransform) {
        const limitCanvasX = worldTransform.width / this.gridSize;
        const limitCanvasY = worldTransform.height / this.gridSize;

        return {
            x: Math.max(0, Math.min(nextX, limitCanvasX)),
            y: Math.max(0, Math.min(nextY, limitCanvasY)),
        };
    }

    // Verifica se o jogador pode ocupar a posição de destino, considerando os objetos colidíveis
    canOccupy() {
        const blocker = this.collides.find(box => box.hit.length > 0);
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
    * @param {GameObject} target - entidade a ser movida.
    * @param {number} deltaX - direção x
    * @param {number} deltaY - direção y.
    * @param {GameObject[]} collidables - entidades próximas a colisão.
    */
    tryPush(target, deltaX, deltaY) {
        // Se entityB for um colisor, usamos o 'owner' dele.
        const targetResolved = target.owner ? target.hit : target;

        // Se não existe alvo ou ele não participa de colisão
        if (!targetResolved) return false;
        // Objetos estáticos nunca podem ser empurrados
        if (targetResolved.isStatic && targetResolved.isStatic()) return false;
        // Apenas objetos dinâmicos podem se mover
        if (!(targetResolved.isDynamic && targetResolved.isDynamic())) return false;
        // Verifica regra de massa (força)
        if (this.mass <= targetResolved.mass) return false;

        /**
        * Calcula nova posição desejada
        * Também respeita limites do canvas
        */
        const clamped = targetResolved.clampToCanvas
            ? targetResolved.clampToCanvas(target.x + deltaX, target.y + deltaY)
            : { x: targetResolved.x + deltaX, y: targetResolved.y + deltaY };

        /**
        * Verifica se o local para onde o alvo
        * será empurrado está livre
        */
        const canMove = targetResolved.canOccupy
            ? targetResolved.canOccupy()
            : true;
        if (!canMove) return false;

        // Move o objeto
        targetResolved.x = clamped.x;
        targetResolved.y = clamped.y;

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
        // const blocker = getCollider(this, collidables, "collide");
        const blockers = this.collides.find(collide=> collide.hit.length > 0)?.hit;
        
        // Se não houver bloqueio, move o jogador para a posição de destino
        if (!blockers) {
            this.x = nextX;
            this.y = nextY;
            return true;
        }

        // Se houver um bloqueio, tenta empurrar o objeto bloqueador para a posição de destino
        if (this.state === "push" && blockers) {
            blockers.forEach(hit=>{
                const pushed = this.tryPush(hit, deltaX, deltaY, collidables);
                if (pushed) {
                    const stillBlocked = this.collides.find(collide=> collide.hit.length > 0)?.hit;

                    if (!stillBlocked) {
                        this.x = nextX;
                        this.y = nextY;
                        return true;
                    }

                }
            })
        }

        // bloqueado → cancela movimento
        return false;
    }

    /**
    * Movimento suavizado usando interpolação linear.
    * Isso cria efeito de aceleração e desaceleração,
    * evitando movimento "seco" e instantâneo.
    * @param {number} inputX 
    * @param {number} inputY 
    * @param {GameObject[] | null} collidables 
    * @param {{width: number, height: number}} worldTransform
    */
    update(inputX, inputY, collidables = [], worldTransform) {
        //maxStep: Imagina que this.speed é a velocidade máxima do seu personagem (por exemplo, 100 pixels por segundo). 
        // Como a função update é chamada 60 vezes por segundo, maxStep calcula quantos pixels o personagem pode 
        // se mover em um único quadro (1 / 60). Isso garante que o movimento seja consistente, independentemente 
        // da taxa de quadros.
        const maxStep = this.speed / 60;
        
        // smoothFactor: Este valor controla a suavidade do movimento. Se this.smooth for um número alto, 
        // o smoothFactor será pequeno, e o personagem levará mais tempo para atingir a velocidade máxima,
        // resultando em um movimento mais suave (como um carro acelerando). Se this.smooth for baixo, o 
        // movimento será mais responsivo (como um kart).
        const smoothFactor = 1 / this.smooth;

        // calcula movimentos diagonais (hipotenusa: x² + y² = h² ).
        // length (Math.hypot) calcula a distância da sua intenção de movimento a partir do centro.
        // Por exemplo, se você pressionar para a direita (inputX = 1, inputY = 0), 
        // length será 1. Se você pressionar para cima e para a direita (inputX = 1, inputY = 1), 
        // length será sqrt(1² + 1²) = 1.414.... Isso é importante para garantir que o personagem não se mova 
        // mais rápido na diagonal.
        const length = Math.hypot(inputX, inputY);

        // targetVX, targetVY: Estas são as velocidades alvo nos eixos X e Y. Elas representam a velocidade
        // que o personagem deseja ter, baseada na sua entrada. Se length for 0 (nenhuma entrada), as 
        // velocidades alvo são 0. Caso contrário, inputX / length e inputY / length "normalizam" a direção
        // (transformam o vetor de entrada em um vetor de comprimento 1), e então multiplicamos por maxStep
        // para obter a velocidade máxima nessa direção.
        const targetVX = length ? (inputX / length) * maxStep : 0;
        const targetVY = length  ? (inputY / length) * maxStep : 0;

        // Isso é uma interpolação gradual (ou lerp) até a velocidade alvo.
        // Em vez de mudar instantaneamente para targetVX, o código adiciona apenas uma fração da diferença
        // entre a velocidade atual (this.vx) e a velocidade alvo (targetVX). Essa fração é controlada por
        // smoothFactor. Isso faz com que o personagem acelere e desacelere de forma natural, em vez de 
        // parar e começar abruptamente.
        this.vx += (targetVX - this.vx) * smoothFactor;
        this.vy += (targetVY - this.vy) * smoothFactor;

        // fricção natural
        // O que acontece quando você para de pressionar as teclas? O personagem deve parar imediatamente 
        // ou deslizar um pouco? A fricção cuida disso.
        // Se não houver entrada do jogador (length === 0), o código aplica uma fricção. Ele multiplica as
        // velocidades atuais (this.vx, this.vy) por 0.6. Isso significa que a cada quadro, a velocidade 
        // diminui 40%. O personagem vai desacelerar gradualmente até parar, simulando a fricção do mundo 
        // real.
        if (length === 0) {
            this.vx *= 0.6;
            this.vy *= 0.6;
        }

        // Primeiro resolve o eixo X
        // Esta é uma das partes mais importantes e um pouco mais complexas. Para evitar que o personagem
        // "grude" nas paredes ou passe por elas de forma estranha, o código resolve o movimento e as 
        // colisões em eixos separados (primeiro X, depois Y).
        
        // Primeiro, o código calcula a próxima posição potencial em X (this.x + this.vx). 
        // A função this.clampToCanvas limita a posição do personagem dentro dos limites da tela do jogo.
        // Isso evita que o personagem saia da tela.
        // Eixo X
        this.nextPosX = this.clampToCanvas(this.x + this.vx, this.y, worldTransform).x;

        //  Para o eixo X, a posição Y é mantida a mesma. Estamos testando apenas o movimento horizontal.
        this.nextPosY = this.y; 

        // updateCollides é crucial. Ela verifica se o personagem colidirá com algum objeto (collidables)
        // se ele se movesse para this.nextPosX (e this.nextPosY). Ela atualiza posição dos hitboxes 
        // e collides (this.hitboxes e this.collides) com informações atualizadas da possição do seu owner.
        this.updateCollides(collidables); // Atualiza os hits na posição nextPosX
        
        // this.resolveAxis é a que realmente lida com a colisão. Ela tenta mover o personagem para 
        // this.nextPosX. Se houver uma colisão, ela ajusta a posição final para que o personagem pare 
        // exatamente na frente do obstáculo, e não o atravesse. Ela retorna true se o personagem 
        // conseguiu se mover (total ou parcialmente) e false se ele não conseguiu se mover nada 
        // (porque bateu em algo).
        const movedX = this.resolveAxis(this.nextPosX, this.y, this.vx, 0, collidables);
        
        // Se resolveAxis disser que o personagem não conseguiu se mover no eixo X (bateu em uma parede), 
        // então a velocidade horizontal (this.vx) é zerada, e a nextPosX é resetada para a posição atual
        // this.x. Isso impede que o personagem continue tentando se mover para dentro da parede e evita 
        // um efeito visual estranho chamado "ghosting" (onde o personagem parece estar um pouco dentro da
        // parede).
        if (!movedX) {
            this.vx = 0;
            this.nextPosX = this.x; // Reseta nextPos para evitar "ghosting"
        }

        // Depois de resolver o movimento horizontal, o código faz exatamente a mesma coisa para o
        // movimento vertical.
        // Eixo Y
        this.nextPosY = this.clampToCanvas(this.x, this.y + this.vy, worldTransform).y;
        this.nextPosX = this.x; // Mantém X atualizado
        this.updateCollides(collidables); // Atualiza os hits na posição nextPosY
        const movedY = this.resolveAxis(this.x, this.nextPosY, 0, this.vy, collidables);
        if (!movedY) {
            this.vy = 0;
            this.nextPosY = this.y;
        }

        // Por que tratar eixos separados? Imagine que seu personagem está se movendo na diagonal em direção a um
        // canto. Se você tentar resolver o movimento nos dois eixos ao mesmo tempo, pode ser difícil 
        // determinar qual parede ele atingiu primeiro ou como ele deve "deslizar" pelo canto. Ao resolver
        // um eixo de cada vez, o processo se torna muito mais simples e robusto, evitando os temidos 
        // "bugs de colisão diagonal".

        // é um objeto que gerencia as animações do seu personagem (por exemplo, "andando", "parado", 
        // "pulando"). setState informa ao animador qual estado de animação deve ser exibido. 
        // O this.state seria uma variável que indica o estado atual do personagem (por exemplo, se ele 
        // está se movendo, this.state pode ser "walking").
        this.animator?.setState(this.state);

        // Esta linha avança a animação em um pequeno passo de tempo (1/60 de segundo, que é o tempo de 
        // um quadro). Isso faz com que a animação "se mova" junto com o personagem.
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
    
    /**
     * 
     * @param {GameObject[]} collidables 
     */
    updateCollides(collidables){
        if(this.hitboxes){
            this.hitboxes.forEach(h => h.update(collidables));
        }

        if(this.collides){
            this.collides.forEach(h => h.update(collidables));
        }
    }
}
