import { GameObject } from "../engine/GameObject.js";
import { updateAnimation } from "../engine/Animation.js";
import { getCollider } from "../engine/GetColliders.js";

export class Ballon extends GameObject {
    constructor(options = {}) {
        const direction = options.direction ?? { x: 0, y: 1 };
        const length = Math.hypot(direction.x, direction.y) || 1;

        super({
            ...options,
            tag: options.tag ?? "Ballon",
            transform: {
                width: 0.35,
                height: 0.35,
                ...(options.transform ?? {}),
            },
            physical: {
                behavior: "dynamic",
                collision: false,
                speed: 10,
                smooth: 1,
                ...(options.physical ?? {}),
            },
            animation: options.animation,
        });

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
        // 1️⃣ Evita executar o hit mais de uma vez.
        // Se o objeto já foi destruído ou já está no estado de explosão/hit,
        // a função é interrompida imediatamente.
        if (this.destroyed || this.exploding) return;

        // 2️⃣ Obtém o "clip" de animação chamado "hit".
        // O operador ?. evita erro caso this.animation seja undefined.
        const hitClip = this.animation?.hit;

        // 3️⃣ Se não existir animação de hit ou se ela não possuir frames válidos,
        // não faz sentido executar a animação. Nesse caso o objeto é destruído diretamente.
        if (!hitClip || !Array.isArray(hitClip.frames) || hitClip.frames.length === 0) {
            this.destroy();
            return;
        }

        // 4️⃣ Marca o objeto como "explodindo".
        // Isso altera o comportamento do update para executar a lógica de hit.
        this.exploding = true;

        // 5️⃣ Desativa a colisão enquanto o objeto está explodindo,
        // evitando interações indesejadas com outros objetos.
        this.collision = false;

        // 6️⃣ Interrompe completamente qualquer movimento atual.
        this.vx = 0;
        this.vy = 0;

        // 7️⃣ Define a animação atual como "hit".
        this.currentAnimation = "hit";

        // 8️⃣ Reinicia o frame da animação.
        this.animationFrame = 0;

        // 9️⃣ Reinicia o contador de tempo da animação.
        this.animationElapsed = 0;


        // 🔟 CÁLCULO DO REBOTE

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

    isHitAnimationFinished() {
        // 1️⃣ Tenta pegar o "clip" de animação chamado "hit".
        // O operador ?. evita erro caso this.animation seja undefined.
        const hitClip = this.animation?.hit;

        // 2️⃣ Se não existir animação de hit,
        // consideramos que ela já terminou.
        // Isso evita travar a lógica do jogo.
        if (!hitClip) return true;

        // 3️⃣ Se a animação estiver marcada como loop,
        // então ela nunca termina.
        // Logo retornamos false.
        if (hitClip.loop) return false;

        // 4️⃣ Calcula o índice do último frame da animação.
        // Exemplo: se existem 4 frames → índices 0,1,2,3
        const lastFrameIndex = Math.max(0, hitClip.frames.length - 1);

        // 5️⃣ Verifica duas condições:
        // - se a animação atual é "hit"
        // - se o frame atual já chegou ao último frame
        return this.currentAnimation === "hit" && this.animationFrame >= lastFrameIndex;
    }

    update(_inputX, _inputY, collidables = []) {
        // 1️⃣ Se o objeto já foi destruído, não executa mais nada.
        if (this.destroyed) return;


        // 2️⃣ Se o objeto já entrou no estado de explosão (hit),
        // executa apenas a lógica de rebote e animação.
        if (this.exploding) {
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

            this.updateHitbox();
            this.updateHitBoxCollide();

            updateAnimation(this, 1/60);

            if (this.isHitAnimationFinished()) {
                this.destroy();
            }

            return;
        }


        // 3️⃣ Detecta se haverá colisão na próxima posição do objeto.

        // Calcula quanto o objeto se move por frame.
        const step = this.speed / 60;

        // Calcula a próxima posição baseada na direção.
        const nextX = this.x + (this.direction.x * step);
        const nextY = this.y + (this.direction.y * step);

        // Verifica se haverá colisão na próxima posição.
        const collided = getCollider(nextX, nextY, collidables, "hitbox", this);

        // Se houve colisão e o objeto colidido não é o dono do projétil,
        // inicia o hit/explosão.
        if (collided && collided !== this.owner) {
            this.startHit();
            return;
        }


        // 4️⃣ Move o objeto normalmente (sem bloqueio físico automático).
        // A colisão já foi tratada manualmente acima.
        super.update(this.direction.x, this.direction.y, []);


        // 5️⃣ Verifica se o objeto saiu da área visível do canvas.

        const limitX = (this.canvas.width / this.gridSize) - this.width;
        const limitY = (this.canvas.height / this.gridSize) - this.height;

        const toDestroy =
            this.x <= 0 ||
            this.y <= 0 ||
            this.x >= limitX ||
            this.y >= limitY;


        // 6️⃣ Diminui o tempo máximo de vida do objeto.
        this.maxLifetime -= 1;

        // Se saiu da tela ou o tempo de vida acabou,
        // inicia a animação de hit antes de remover.
        if (toDestroy || this.maxLifetime <= 0) {
            this.startHit();
        }
    }
}
