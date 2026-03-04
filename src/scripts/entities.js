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
    constructor({
        // Nome interno do objeto (ex: "Player", "Tree_01")
        name,

        // Categoria ou tipo do objeto (útil para filtros e regras)
        tag = 'GameObject',

        // Configurações de transformação visual
        transform: {
            width = 1,     // largura em tiles
            height = 1,    // altura em tiles
            scale = 1      // escala visual (multiplicador)
        } = {},

        // Posição no grid (coordenadas lógicas, não em pixels)
        position: {
            x = 0,
            y = 0
        } = {},

        // Configurações físicas
        physical: {
            behavior = 'static', // 'static' ou 'dynamic'
            speed = 2,           // velocidade base
            mass = 0,            // massa (usada para empurrar objetos)
            collision = false,   // participa de colisão?
            smooth = 6,          // fator de suavização do movimento
        } = {},        

        // Configuração das animações
        animation = {},

        // Debug
        showHitbox = false,     // desenhar hitbox na tela?
        offSetHitbox = 10,      // margem interna do hitbox visual
        offSetBoxCollide = 0,   // margem do hitbox de colisão

        // Tamanho do grid (ex: 64px por tile)
        gridSize = 64,

        // Referência do canvas
        canvas,
    } = {}) {

        // ------------------------
        // IDENTIFICAÇÃO
        // ------------------------
        this.name = name;
        this.tag = tag;

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
        this.animation = this.normalizeAnimation(animation);
        this.currentAnimation = 'idle';
        this.animationFrame = 0;
        this.animationElapsed = 0;

        // ------------------------
        // HITBOX INICIAL
        // ------------------------
        // Representa a área real de colisão do objeto.
        this.hitbox = {
            x: this.x * this.gridSize + this.offSetHitbox,
            y: this.y * this.gridSize + this.offSetHitbox,
            width: this.gridSize - (this.offSetHitbox * 2),
            height: this.gridSize - (this.offSetHitbox * 2)
        };
    }

    /**
     * NORMALIZAÇÃO DE ANIMAÇÕES
     * ------------------------------------------------------
     * Esse método recebe o objeto de animações configurado
     * pelo desenvolvedor e converte tudo para um formato
     * interno padrão da engine.
     * 
     * Ele permite dois formatos de entrada:
     * 
     * 1) Forma simples:
     *    idle: [img1, img2, img3]
     * 
     * 2) Forma completa:
     *    idle: {
     *       frames: [
     *       //se for um sprite sheet
     *         * { 
     *              image: spriteSheet,
     *              sx: 0,
     *              sy: 0,
     *              sw: 32, //largura sprite
     *              sh: 32 // altura sprite
     *           },
     *        // se for uma imagem frame.
     *          img1,
     *          ...
     *       ],
     *       fps: 12,
     *       loop: false
     *    }
     * 
     * O objetivo é padronizar tudo para:
     * {
     *   frames: [],
     *   fps: number,
     *   loop: boolean
     * }
     */
    normalizeAnimation(animation = {}) {
        // Estados de animação suportados pela engine.
        // Aqui estamos definindo um padrão.
        const keys = ['idle', 'walkUp', 'walkDown', 'walkLeft', 'walkRight'];
        
        // Objeto final normalizado que será retornado.
        const normalized = {};

        // Percorre todos os estados possíveis
        for (const key of keys) {
            // Pega a animação correspondente à chave atual
            const clip = animation[key];

            // Se o desenvolvedor não definiu essa animação,
            // simplesmente ignora.
            if (!clip) continue;

            /**
             * CASO 1: O desenvolvedor passou apenas um array
             * Exemplo:
             * walkDown: [img1, img2, img3]
             */
            if (Array.isArray(clip)) {
                normalized[key] = {
                    frames: clip.filter(Boolean), // Remove valores inválidos (null/undefined)
                    fps: 8, // FPS padrão da engine
                    loop: true, // Por padrão animações entram em loop
                };
                continue;
            }

            /**
             * CASO 2: O desenvolvedor passou objeto completo
             * Exemplo:
             * idle: {
             *   frames: [...],
             *   fps: 12,
             *   loop: false
             * }
             */
            const frames = Array.isArray(clip.frames) ? clip.frames.filter(Boolean) : [];
            
            // Se não houver frames válidos, ignora essa animação
            if (frames.length === 0) continue;

            normalized[key] = {
                frames,
                fps: Math.max(1, clip.fps ?? 8), // Garante FPS mínimo de 1
                // Se loop for explicitamente false, respeita.
                // Caso contrário, assume true.
                loop: clip.loop !== false,
            };
        }

        // Retorna o objeto já padronizado
        return normalized;
    }

    // Padroniza as animações recebidas.
    // Permite que o desenvolvedor passe apenas um array de frames
    // ou um objeto mais completo com fps e loop.
    // Isso deixa a API mais flexível.
    hasAnimation() {
        return Object.keys(this.animation).length > 0;
    }

    // Define qual animação deve tocar com base na direção do input.
    // Exemplo:
    // inputX = 1  -> walkRight
    // inputY = -1 -> walkUp
    setAnimationState(inputX, inputY) {
        if (!this.hasAnimation()) return;

        const moving = Math.abs(inputX) > 0.001 || Math.abs(inputY) > 0.001;
        let next = 'idle';

        if (moving) {
            if (Math.abs(inputY) >= Math.abs(inputX)) {
                next = inputY < 0 ? 'walkUp' : 'walkDown';
            } else {
                next = inputX < 0 ? 'walkLeft' : (this.animation.walkRight ? 'walkRight' : 'walkLeft');
            }
        }

        if (!this.animation[next]) {
            next = this.animation.idle ? 'idle' : Object.keys(this.animation)[0];
        }

        if (this.currentAnimation !== next) {
            this.currentAnimation = next;
            this.animationFrame = 0;
            this.animationElapsed = 0;
        }
    }

    updateAnimation(deltaSeconds = 1 / 60) {
        if (!this.hasAnimation()) return;

        const clip = this.animation[this.currentAnimation];
        if (!clip || clip.frames.length <= 1) return;

        this.animationElapsed += deltaSeconds;
        const frameDuration = 1 / Math.max(1, clip.fps);

        while (this.animationElapsed >= frameDuration) {
            this.animationElapsed -= frameDuration;
            this.animationFrame += 1;

            if (this.animationFrame >= clip.frames.length) {
                this.animationFrame = clip.loop ? 0 : clip.frames.length - 1;
            }
        }
    }

    /**
     * DESENHA A ANIMAÇÃO ATUAL
     * --------------------------------------------------
     * Esse método tenta desenhar o frame atual
     * da animação ativa no canvas.
     * 
     * Ele suporta:
     * 1) Frames como imagem direta (Image, Canvas, Bitmap)
     * 2) Frames como recorte de sprite sheet
     * 
     * Retorna:
     * true  -> se conseguiu desenhar
     * false -> se não havia animação válida
     */
    drawAnimation(ctx) {
        // Pega o clip da animação atual (ex: idle, walkDown...)
        const clip = this.animation[this.currentAnimation];
        
        // Se não houver animação válida, não desenha
        if (!clip || clip.frames.length === 0) return false;

        // Seleciona o frame atual da animação
        const frame = clip.frames[this.animationFrame] || clip.frames[0];
        if (!frame) return false;

        /**
        * Converte posição lógica (grid)
        * para posição real em pixels
        */
        const drawX = this.x * this.gridSize;
        const drawY = this.y * this.gridSize;
        const drawW = this.gridSize * (this.width ?? 1) * (this.scale ?? 1);
        const drawH = this.gridSize * (this.height ?? 1) * (this.scale ?? 1);

        /**
        * Detecta se o frame é uma imagem direta
        * (sprite independente)
        */
        const isImage = typeof HTMLImageElement !== 'undefined' && frame instanceof HTMLImageElement;
        const isCanvas = typeof HTMLCanvasElement !== 'undefined' && frame instanceof HTMLCanvasElement;
        const isBitmap = typeof ImageBitmap !== 'undefined' && frame instanceof ImageBitmap;

        // Caso 1: frame é uma imagem direta
        if (isImage || isCanvas || isBitmap) {
            ctx.drawImage(frame, drawX, drawY, drawW, drawH);
            return true;
        }

        /**
        * Caso 2: frame é parte de uma sprite sheet
        * 
        * Exemplo de estrutura esperada:
        * {
        *   image: spriteSheet,
        *   sx: 0,
        *   sy: 0,
        *   sw: 32,
        *   sh: 32
        * }
        */
        if (frame.image && frame.sx !== undefined) {
            const sx = frame.sx ?? 0;
            const sy = frame.sy ?? 0;

            // Define largura e altura do recorte
            const sw = frame.sw ?? frame.frameWidth ?? frame.image.width;
            const sh = frame.sh ?? frame.frameHeight ?? frame.image.height;

            ctx.drawImage(frame.image, sx, sy, sw, sh, drawX, drawY, drawW, drawH);
            return true;
        }

        // Se não conseguiu desenhar, retorna false
        return false;
    }

    // Atualiza o hitbox para a posição atual do jogador
    updateHitbox() {
        this.hitbox.x = this.x * this.gridSize + this.offSetHitbox;
        this.hitbox.y = this.y * this.gridSize + this.offSetHitbox;
    }

    // Desenha o hitbox do jogador, se a opção estiver ativada
    drawHitbox(ctx) {
        if (this.showHitbox) {
            ctx.strokeStyle = 'red';
            ctx.strokeRect(this.hitbox.x, this.hitbox.y, this.hitbox.width, this.hitbox.height);
        }
    }

    // Retorna o hitbox para a posição de colisão, que pode ser diferente do hitbox de renderização
    getHitboxCollideAt(nextX, nextY) {
        return {
            x: nextX * this.gridSize + this.offSetBoxCollide,
            y: nextY * this.gridSize + this.offSetBoxCollide,
            width: this.gridSize - (this.offSetBoxCollide * 2),
            height: this.gridSize - (this.offSetBoxCollide * 2)
        };
    }

    // Verifica colisão entre dois retângulos (AABB collision)
    // Técnica clássica de colisão retangular.
    // Essa técnica é chamada de Axis-Aligned Bounding Box (AABB).
    isOverlapping(objectA, objectB) {
        return (
            objectA.x < objectB.x + objectB.width &&
            objectA.x + objectA.width > objectB.x &&
            objectA.y < objectB.y + objectB.height &&
            objectA.y + objectA.height > objectB.y
        );
    }

    // Verifica se há um objeto bloqueando a posição de destino
    getBlockingObject(nextX, nextY, collidables = []) {
        if (!this.collision) return null;

        // Usa o hitbox de colisão para verificar bloqueios, permitindo que o hitbox de renderização seja diferente
        const nextHitbox = this.getHitboxCollideAt(nextX, nextY);

        // Verifica cada objeto colidível para ver se há uma colisão
        for (const object of collidables) {
            if (!object || object === this || !object.collision) continue;

            const objectHitbox = object.getHitboxCollideAt
                ? object.getHitboxCollideAt(object.x, object.y)
                : object.hitbox;

            if (objectHitbox && this.isOverlapping(nextHitbox, objectHitbox)) {
                return object;
            }
        }

        return null;
    }

    isStatic() {
        return this.behavior === 'static';
    }

    isDynamic() {
        return this.behavior === 'dynamic' || this.behavior === 'dinamic';
    }

    // Garante que o jogador não saia dos limites do canvas
    clampToCanvas(nextX, nextY) {
        const limitCanvasX = this.canvas.width / this.gridSize - 1;
        const limitCanvasY = this.canvas.height / this.gridSize - 1;

        return {
            x: Math.max(0, Math.min(limitCanvasX, nextX)),
            y: Math.max(0, Math.min(limitCanvasY, nextY)),
        };
    }

    // Verifica se o jogador pode ocupar a posição de destino, considerando os objetos colidíveis
    canOccupy(nextX, nextY, collidables = [], ignore = null) {
        const blocker = this.getBlockingObject(nextX, nextY, collidables.filter((obj) => obj !== ignore));
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

    // Tenta resolver o movimento para a posição de destino, 
    // considerando bloqueios e empurrões
    resolveAxis(nextX, nextY, deltaX, deltaY, collidables = []) {
        // Verifica se há um bloqueio na posição de destino
        const blocker = this.getBlockingObject(nextX, nextY, collidables);

        // Se não houver bloqueio, move o jogador para a posição de destino
        if (!blocker) {
            this.x = nextX;
            this.y = nextY;
            return true;
        }

        // Se houver um bloqueio, tenta empurrar o objeto bloqueador para a posição de destino
        const pushed = this.tryPush(blocker, deltaX, deltaY, collidables);
        if (pushed && !this.getBlockingObject(nextX, nextY, collidables)) {
            this.x = nextX;
            this.y = nextY;
            return true;
        }

        return false;
    }

    // Movimento suavizado usando interpolação linear.
    // Isso cria efeito de aceleração e desaceleração,
    // evitando movimento "seco" e instantâneo.
    update(inputX, inputY, collidables = []) {
        this.setAnimationState(inputX, inputY);

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
        const nextPosX = this.clampToCanvas(this.x + this.vx, this.y);
        const movedX = this.resolveAxis(nextPosX.x, this.y, this.vx, 0, collidables);
        if (!movedX) this.vx = 0;

        // Depois de resolver o movimento no eixo X, tenta resolver o movimento no eixo Y
        const nextPosY = this.clampToCanvas(this.x, this.y + this.vy);
        const movedY = this.resolveAxis(this.x, nextPosY.y, 0, this.vy, collidables);
        if (!movedY) this.vy = 0;

        // Atualiza o hitbox para a nova posição do jogador
        this.updateHitbox();
        this.updateAnimation(1 / 60);
    }

    // Desenha animação se existir.
    // Caso contrário, desenha um retângulo azul padrão.
    // Útil para debug quando sprite ainda não foi definido.
    draw() {
        const ctx = this.canvas.getContext('2d');

        //se não foi fornecido uma animação, desenha um retangulo azul.
        const drawn = this.drawAnimation(ctx);
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
    }    
}

export class Player extends GameObject {
    constructor(options= {
            name: 'jogador01',
            tag: 'Player',
            physical: {
                behavior: 'dynamic',   // Player se move
                speed: 4,              // Mais rápido que padrão
                mass: 10,              // Pode empurrar objetos leves
                collision: true,       // Participa de colisão
                smooth: 8,             // Movimento mais suave
            },
            position: {
                x: 0, //posição x inicial.
                y: 0 // posição y inicial.
            },
            // Configuração das animações
            animation: {},

            // Debug
            showHitbox: false,     // desenhar hitbox na tela?
            offSetHitbox: 10,      // margem interna do hitbox visual
            offSetBoxCollide: 0,   // margem do hitbox de colisão

            // Tamanho do grid (ex: 64px por tile)
            gridSize: 64,

            // Referência do canvas
            canvas,
        }) {
        super({
            ...options,
            physical: {
                ...options.physical
            }
        });
    }

    /**
     * Atualização do Player
     * Aqui poderíamos futuramente:
     * - Adicionar sistema de vida
     * - Energia
     * - Inventário
     * - Ataque
     */
    update(inputX, inputY, collidables = []) {
        // Chama comportamento base de movimento
        super.update(inputX, inputY, collidables);
    }
}

export class Wall extends GameObject {
    constructor(options = {
            name: 'parede01',
            tag: 'Wall',
            physical: {
                behavior: 'static',  // Nunca se move
                collision: true,     // Sempre bloqueia
                mass: Infinity,      // Impossível empurrar
            },
            position: {
                x: 0, //posição x inicial.
                y: 0 // posição y inicial.
            },
            // Configuração das animações
            animation: {},

            // Debug
            showHitbox: false,     // desenhar hitbox na tela?
            offSetHitbox: 10,      // margem interna do hitbox visual
            offSetBoxCollide: 0,   // margem do hitbox de colisão

            // Tamanho do grid (ex: 64px por tile)
            gridSize: 64,

            // Referência do canvas
            canvas,
        }) {
        super({
            ...options,          
            physical: {                
                ...options.physical
            }
        });
    }

    // Parede não precisa atualizar movimento
    update() {
        // Nada acontece
    }
}

export class Tree extends GameObject {
    constructor(options = {
            name: 'arvore01',
            tag: 'Tree',
            physical: {
                behavior: 'static',
                collision: false, // não bloqueia
            },
            position: {
                x: 0, //posição x inicial.
                y: 0 // posição y inicial.
            },
            // Configuração das animações
            animation: {},

            // Debug
            showHitbox: false,     // desenhar hitbox na tela?
            offSetHitbox: 10,      // margem interna do hitbox visual
            offSetBoxCollide: 0,   // margem do hitbox de colisão

            // Tamanho do grid (ex: 64px por tile)
            gridSize: 64,

            // Referência do canvas
            canvas,
        }) {
        super({
            ...options,           
            physical: {                
                ...options.physical
            }
        });
    }

    draw() {
        const ctx = this.canvas.getContext('2d');
        const size = this.gridSize;

        const pixelX = this.x * size;
        const pixelY = this.y * size;

        const width = size * (this.width ?? 1) * (this.scale ?? 1);
        const height = size * (this.height ?? 1) * (this.scale ?? 1);

        const centerX = pixelX + width / 2;

        // Tronco
        ctx.fillStyle = "#8B4513";
        ctx.fillRect(
            centerX - width * 0.1,   // centraliza o tronco
            pixelY + height * 0.5,   // metade da altura
            width * 0.2,             // 20% da largura
            height * 0.5             // metade da altura
        );

        // Copa
        ctx.fillStyle = "#246c1d";

        ctx.beginPath();
        ctx.arc(
            centerX,
            pixelY + height * 0.4,
            width * 0.4,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}