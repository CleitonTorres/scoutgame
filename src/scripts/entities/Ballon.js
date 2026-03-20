import { GameObject } from "../engine/GameObject.js";

export class Ballon extends GameObject {
    /**
    * 
    * @typedef {{
    *   import("../engine/GameObject.js").GameObjectType & {
    *   owner: GameObject,
    *   maxLifetime: number
    * }} BallonType
    * @param {BallonType} options
    */
    constructor(options = {}) {
        const direction = options.direction ?? { x: 0, y: 1 };
        const length = Math.hypot(direction.x, direction.y) || 1;

        super({...options});

        this.direction = {
            x: direction.x / length,
            y: direction.y / length,
        };
        this.owner = options.owner ?? null;
        this.destroyed = false;
        this.exploding = false;
        this.reboundVX = 0;
        this.reboundVY = 0;
        this.reboundDamping = 0.86;
        this.maxLifetime = options.maxLifetime ?? 180;
    }

    destroy() {
        this.destroyed = true;
    }

    startHit(reboundSource = this.direction) {
        // Evita executar o hit mais de uma vez.
        // Se o objeto já foi destruído ou já está no estado de explosão/hit,
        // a função é interrompida imediatamente.
        if (this.destroyed || this.exploding) return;

        // Obtém o "clip" de animação chamado "hit".
        // O operador ?. evita erro caso this.animation seja undefined.
        const hitClip = this.animation?.hit;

        // Se não existir animação de hit ou se ela não possuir frames válidos,
        // não faz sentido executar a animação. Nesse caso o objeto é destruído diretamente.
        if (!hitClip || !Array.isArray(hitClip.frames) || hitClip.frames.length === 0) {
            this.destroy();
            return;
        }

        // Marca o objeto como "explodindo".
        // Isso altera o comportamento do update para executar a lógica de hit.
        this.exploding = true;
        this.state = "hit";
        this.animator.setState(this.state);

        // Desativa a colisão enquanto o objeto está explodindo,
        // evitando interações indesejadas com outros objetos.
        this.collision = false;

        // Interrompe completamente qualquer movimento atual.
        this.vx = 0;
        this.vy = 0;

        // CÁLCULO DO REBOTE

        // 10.1 Calcula a direção oposta ao impacto.
        // Se o projétil veio da direita (1,0), o rebote será para a esquerda (-1,0).
        const oppositeX = -(reboundSource?.x ?? 0);
        const oppositeY = -(reboundSource?.y ?? 0);

        // 10.2 Calcula um vetor perpendicular à direção oposta.
        // Isso serve para gerar um pequeno desvio lateral no rebote.
        const perpX = -oppositeY;
        const perpY = oppositeX;

        // 10.3 Combina a direção oposta com parte do vetor perpendicular.
        // Isso cria um movimento levemente diagonal,
        // deixando o rebote mais natural visualmente.
        const dirX = oppositeX + perpX * 0.7;
        const dirY = oppositeY + perpY * 0.7;

        // 10.4 Calcula o comprimento do vetor resultante usando Pitágoras.
        // Isso será usado para normalizar a direção.
        const len = Math.hypot(dirX, dirY) || 1;

        // 10.5 Define o impulso inicial do rebote.
        // A velocidade é baseada na velocidade do objeto original,
        // mas reduzida para criar um pequeno deslocamento.
        const impulse = this.speed * 0.03;

        // 10.6 Aplica a normalização do vetor e calcula a velocidade final de rebote.
        // Isso garante que o objeto rebata na direção correta
        // mantendo velocidade consistente.
        this.reboundVX = (dirX / len) * impulse;
        this.reboundVY = (dirY / len) * impulse;

        // 11️⃣ Parâmetros físicos do rebote.

        // Fator de atrito aplicado a cada frame.
        // Quanto menor o valor, mais rápido o objeto perde velocidade.
        this.reboundFriction = 0.82;

        // Velocidade mínima para considerar que o objeto parou.
        // Evita que ele fique se movendo infinitamente com valores muito pequenos.
        this.reboundStopThreshold = 0.01;
    }

    update(grid) {
        // Se o objeto já foi destruído, não executa mais nada.
        if (this.destroyed) return;

        const collidables = grid?.query(this.x, this.y) || [];

        // Se o objeto já entrou no estado de explosão (hit),
        // executa apenas a lógica de rebote e animação.
        if (this.exploding) {
            this.state = "hit";
            this.x += this.reboundVX;
            this.y += this.reboundVY;

            // decay de velocidade
            this.reboundVX *= this.reboundFriction;
            this.reboundVY *= this.reboundFriction;

            // para completamente quando velocidade é muito pequena
            if (Math.abs(this.reboundVX) < this.reboundStopThreshold) {
                this.reboundVX = 0;
            }

            if (Math.abs(this.reboundVY) < this.reboundStopThreshold) {
                this.reboundVY = 0;
            }

            //atualiza a animação.
            this.animator.setState(this.state);
            this.animator.update(1 / 60);

            if (this.animator.isFinished()) {
                this.destroy();
            }

            //evita a continuação do código seguinte (super.update()).
            return;
        }

        // Calcula quanto o objeto se move por frame.
        const step = this.speed / 60;

        // Calcula a próxima posição baseada na direção.
        const nextX = this.x + (this.direction.x * step);
        const nextY = this.y + (this.direction.y * step);

        // Verifica se haverá colisão na próxima posição.
        // const collided = getCollider(collidables, "hitbox", this);
        // Em Ballon.js -> update()
        this.nextPosX = nextX;
        this.nextPosY = nextY;
        this.updateCollides(collidables); // Força atualização antes de checar

        const collided = this.hitboxes.find(box => box.hit);
        if (collided && collided !== this.owner) {
            this.startHit();
            return;
        }

        // Move o objeto normalmente (sem bloqueio físico automático).
        //verifica se precisa mudar de animação (idle, walkUp, walkDown...)
        this.state = "move";
        
        // Não passa o collidables porque a colisão já foi tratada manualmente acima.
        super.update(this.direction.x, this.direction.y, []);


        // Verifica se o objeto saiu da área visível do canvas.

        const limitX = (this.canvas.width / this.gridSize) - this.width;
        const limitY = (this.canvas.height / this.gridSize) - this.height;

        const toDestroy =
            this.x <= 0 ||
            this.y <= 0 ||
            this.x >= limitX ||
            this.y >= limitY;


        // Diminui o tempo máximo de vida do objeto.
        this.maxLifetime -= 1;

        // Se saiu da tela ou o tempo de vida acabou,
        // inicia a animação de hit antes de remover.
        if (toDestroy || this.maxLifetime <= 0) {
            this.startHit();
        }
    }
}
