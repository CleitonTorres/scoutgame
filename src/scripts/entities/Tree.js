import { GameObject } from "../engine/GameObject.js";

/**
 * Parametros default para instanciar a classe.
 * 
 * {
 *      name = '',
        tag = 'Tree',

        transform = {
            width = 1,
            height = 1,
            scale = 1
        },
        position = {
            x = 0,
            y = 0
        },
        physical = {
            behavior = 'static',
            speed = 0,
            mass = 0,
            collision = true,
            smooth = 0
        },

        animation =  animation = {
            idle: {
                frames: [];
                fps: number;
                loop: boolean;
            },
            ...
        },

        showHitbox = false,
        offSetHitbox = { x: 0, y: 0 },
        offSetBoxCollide = { x: 0, y: 0 },

        gridSize = 64,
        canvas
    }
*/
export class Tree extends GameObject {
    constructor(options = {}) {        
        super({...options});
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