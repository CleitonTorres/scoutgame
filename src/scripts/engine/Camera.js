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
            const targetX = (this.target.x - (this.width / 2) + 0.5);
            const targetY = (this.target.y - (this.height / 2) + 0.5);

            this.x += (targetX - this.x) * 0.1;
            this.y += (targetY - this.y) * 0.1;
        }
    }

    draw(ctx, gridSize){
        if(!this.showViewport) return;

        ctx.beginPath();

        // estilo da borda
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        
        const centerX = (this.width * gridSize) / 2;
        const centerY = (this.height * gridSize) / 2;
        const radius = Math.min((this.width * gridSize), (this.height * gridSize)) * 0.35;

        

        // desenha o retângulo da câmera no mundo
        if(this.shape === "circle"){            
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();
        }else{
            ctx.strokeRect(
                this.x * gridSize,
                this.y * gridSize,
                this.width * gridSize,
                this.height * gridSize
            );
        }
    }
}