export class Player {
    constructor({
        name,
        inicialX,
        inicialY,
        speed = 5,
        showHitbox = false,
        offSetHitbox = 10,
        offSetBoxCollide = 0,
        smooth = 6,
        tag = 'Player',
        behavior = 'static',
        mass = 0,
        collision = false,
        gridSize,
        canvas,
    }) {
        this.name = name;
        this.x = inicialX;
        this.y = inicialY;
        this.speed = speed;
        this.showHitbox = showHitbox;
        this.offSetHitbox = offSetHitbox;
        this.offSetBoxCollide = offSetBoxCollide;
        this.smooth = Math.max(1, smooth); // Evita valores menores que 1 para smooth
        this.tag = tag;
        this.behavior = behavior;
        this.mass = mass;
        this.collision = collision;

        this.gridSize = gridSize;
        this.canvas = canvas;

        this.vx = 0;
        this.vy = 0;

        // Define o hitbox inicial
        this.hitbox = {
            x: this.x * this.gridSize + this.offSetHitbox,
            y: this.y * this.gridSize + this.offSetHitbox,
            width: this.gridSize - (this.offSetHitbox * 2),
            height: this.gridSize - (this.offSetHitbox * 2)
        };
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

    // Verifica se dois objetos estão se sobrepondo
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

    // Tenta empurrar um objeto para a posição de destino, se possível
    tryPush(target, deltaX, deltaY, collidables = []) {
        if (!target || !target.collision) return false;
        if (target.isStatic && target.isStatic()) return false;
        if (!(target.isDynamic && target.isDynamic())) return false;
        if (this.mass <= target.mass) return false;

        const clamped = target.clampToCanvas
            ? target.clampToCanvas(target.x + deltaX, target.y + deltaY)
            : { x: target.x + deltaX, y: target.y + deltaY };

        const canMove = target.canOccupy
            ? target.canOccupy(clamped.x, clamped.y, collidables, this)
            : true;

        if (!canMove) return false;

        target.x = clamped.x;
        target.y = clamped.y;
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

    update(inputX, inputY, collidables = []) {
        const maxStep = this.speed / 60;
        const smoothFactor = 1 / this.smooth;

        const length = Math.hypot(inputX, inputY) || 1;
        const targetVX = (inputX / length) * maxStep;
        const targetVY = (inputY / length) * maxStep;

        this.vx += (targetVX - this.vx) * smoothFactor;
        this.vy += (targetVY - this.vy) * smoothFactor;

        // Tenta resolver o movimento no eixo X primeiro, depois no eixo Y
        const nextPosX = this.clampToCanvas(this.x + this.vx, this.y);
        const movedX = this.resolveAxis(nextPosX.x, this.y, this.vx, 0, collidables);
        if (!movedX) this.vx = 0;

        // Depois de resolver o movimento no eixo X, tenta resolver o movimento no eixo Y
        const nextPosY = this.clampToCanvas(this.x, this.y + this.vy);
        const movedY = this.resolveAxis(this.x, nextPosY.y, 0, this.vy, collidables);
        if (!movedY) this.vy = 0;

        // Atualiza o hitbox para a nova posição do jogador
        this.updateHitbox();
    }

    draw() {
        const ctx = this.canvas.getContext('2d');

        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x * this.gridSize, this.y * this.gridSize, this.gridSize, this.gridSize);

        this.drawHitbox(ctx);
    }    
}

export class Wall extends Player {
    constructor({name, x, y, gridSize, canvas, showHitbox = false}) {
        super({
            name, 
            inicialX: x, 
            inicialY: y,
            speed: 0, 
            showHitbox, 
            offSetHitbox: 0, 
            offSetBoxCollide: 0,
            smooth: 1,
            tag: 'Wall',
            behavior: 'static',
            mass: 999,
            collision: true,
            gridSize: gridSize,
            canvas: canvas
        });
    }

    draw() {
        const ctx = this.canvas.getContext('2d');
        const px = this.x * this.gridSize;
        const py = this.y * this.gridSize;

        ctx.fillStyle = '#5c5c5c';
        ctx.fillRect(px, py, this.gridSize, this.gridSize);

        ctx.fillStyle = '#7a7a7a';
        ctx.fillRect(px + 4, py + 4, this.gridSize - 8, 8);

        this.drawHitbox(ctx);
    }
}

export class Tree extends Player {
    constructor({
        name, x, y, 
        gridSize, canvas, 
        collision = true,
        showHitbox = false, 
        offSetHitbox = 0, 
        offSetBoxCollide = 0
    }) {
        super({
            name, 
            inicialX: x, 
            inicialY: y,
            speed: 0, 
            showHitbox: showHitbox, 
            offSetHitbox: offSetHitbox, 
            offSetBoxCollide: offSetBoxCollide,
            smooth: 1,
            tag: 'Tree',
            behavior: 'static',
            mass: 999,
            collision: collision, 
            gridSize: gridSize,
            canvas: canvas
        });
    }

    draw() {
        const ctx = this.canvas.getContext('2d');
        const px = this.x * this.gridSize;
        const py = this.y * this.gridSize;

        // copa
        ctx.fillStyle = '#2f7d32';
        ctx.beginPath();
        ctx.arc(px + this.gridSize / 2, py + this.gridSize / 2 - 6, this.gridSize / 2.3, 0, Math.PI * 2);
        ctx.fill();

        // tronco
        ctx.fillStyle = '#6b3f1d';
        ctx.fillRect(px + this.gridSize * 0.4, py + this.gridSize * 0.55, this.gridSize * 0.2, this.gridSize * 0.35);

        this.drawHitbox(ctx);
    }
}
