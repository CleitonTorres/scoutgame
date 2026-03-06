import { GameObject } from "../engine/GameObject.js";
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
        });

        this.direction = {
            x: direction.x / length,
            y: direction.y / length,
        };
        this.owner = options.owner ?? null;
        this.destroyed = false;
        this.maxLifetime = options.maxLifetime ?? 180;
    }

    destroy() {
        this.destroyed = true;
    }

    update(_inputX, _inputY, collidables = []) {
        if (this.destroyed) return;

        // Detecta colisao na proxima posicao e destrói antes de mover.
        const step = this.speed / 60;
        const nextX = this.x + (this.direction.x * step);
        const nextY = this.y + (this.direction.y * step);
        const collided = getCollider(nextX, nextY, collidables, this);
        if (collided && collided !== this.owner) {
            this.destroy();
            return;
        }

        // Move sem bloqueio fisico; colisao e tratada manualmente acima.
        super.update(this.direction.x, this.direction.y, []);

        // Destroi ao sair da area visível (unidade em tiles).
        const limitX = (this.canvas.width / this.gridSize) - this.width;
        const limitY = (this.canvas.height / this.gridSize) - this.height;
        const toDestroy = this.x <= 0 || this.y <= 0 || this.x >= limitX || this.y >= limitY;

        this.maxLifetime -= 1;
        if (toDestroy || this.maxLifetime <= 0) {
            this.destroy();
        }
    }
}
