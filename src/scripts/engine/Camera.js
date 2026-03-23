import { getAnchor } from "../mathh/GetAnchor.js";
import { anchorsPoints } from "../settings/anchorsPoints.js";

export class Camera {
    /**
     * Metrics x, y, width and heigt in tiles.
     * @param {{
     *  x: number,
     *  y: number,
     *  width: number,
     *  height: number,
     *  zoom: number,
     *  showViewport: boolean,
     *  shape: "circle" | "box",
     *  fogWar: boolean
     * }} options 
     */
    constructor({
        x = 0, y = 0, 
        width, height, 
        zoom = 1, 
        showViewport = false, 
        shape = "circle",
        fogWar = false,
    }) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.zoom = zoom;
        this.showViewport = showViewport || false;
        this.target = null; // quem a câmera segue
        this.shape = shape;
        this.fogWar = fogWar;
    }

    follow(target) {
        this.target = target;
    }

    update() {
        if (this.target) {

            //em tiles
            const {x, y} = getAnchor(this.target, anchorsPoints.middle);
            
            const targetX = x - (this.width / 2);
            const targetY = y - (this.height / 2);

            //Interpolação suave (lerp)
            let nextX = this.x += (targetX - this.x) * 0.1;
            let nextY = this.y += (targetY - this.y) * 0.1;

            // 🎯 APLICAR TRAVA DO MUNDO (CLAMP)
            // Se o jogo tiver limites definidos (ex: 5000x5000 pixels)
            if (this.worldTransform && this.gridSize) {
                const worldWidthInTiles = this.worldTransform.width / this.gridSize;
                const worldHeightInTiles = this.worldTransform.height / this.gridSize;

                // A câmera não pode ir para X < 0
                // E não pode ir além de (LarguraDoMundo - LarguraDaCamera)
                nextX = Math.max(0, Math.min(nextX, worldWidthInTiles - this.width));
                nextY = Math.max(0, Math.min(nextY, worldHeightInTiles - this.height));
            }

            this.x = nextX;
            this.y = nextY;
        }
    }

    /**
    * Desenha o debug da câmera (viewport) no espaço do MUNDO.
    */
    draw(ctx, gridSize){
        if(!this.showViewport) return;

        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        
        if(this.shape === "circle"){            
            const centerX = (this.x + this.width / 2) * gridSize;
            const centerY = (this.y + this.height / 2) * gridSize;
            const radius = Math.min(this.width, this.height) * gridSize * 0.35;
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        } else {
            ctx.strokeRect(
                this.x * gridSize,
                this.y * gridSize,
                this.width * gridSize,
                this.height * gridSize
            );
        }
        ctx.stroke();
        ctx.restore();
    }
}