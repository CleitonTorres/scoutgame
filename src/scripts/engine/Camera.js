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
     *  shape: "circle" | "box"
     * }} options 
     */
    constructor({x = 0, y = 0, width, height, zoom = 1, showViewport, shape = "circle"}) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.zoom = zoom;
        this.showViewport = showViewport || false;
        this.target = null; // quem a câmera segue
        this.shape = shape;
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

            this.x += (targetX - this.x) * 0.1;
            this.y += (targetY - this.y) * 0.1;
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