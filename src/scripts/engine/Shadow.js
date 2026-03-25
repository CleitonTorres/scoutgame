/**
 * Classe Shadow
 * Desenha uma sombra oval suave sob um GameObject.
 */
export class Shadow {
    /**
     * @param {Object} options
     * @param {number} [options.widthScale] - Largura da sombra em relação ao objeto (padrão: 0.8).
     * @param {number} [options.heightScale] - Altura da sombra em relação ao objeto (padrão: 0.3).
     * @param {string} [options.color] - Cor da sombra (padrão: preto semi-transparente).
     */
    constructor({ widthScale = 0.8, heightScale = 0.3, color = "rgba(0, 0, 0, 0.3)" } = {}) {
        this.widthScale = widthScale;
        this.heightScale = heightScale;
        this.color = color;
    }

    /**
     * Desenha a sombra sob a entidade.
     * @param {CanvasRenderingContext2D} ctx 
     * @param {import("./GameObject").GameObject} entity 
     */
    draw(ctx, entity) {
        if (!ctx || !entity) return;

        const gridSize = entity.gridSize || 64;
        
        // 1. Calcula o centro da base do objeto
        const centerX = (entity.x * gridSize) + (entity.width * gridSize) / 2;
        const centerY = (entity.y * gridSize) + (entity.height * gridSize);

        // 2. Define o tamanho da elipse baseado no tamanho do objeto
        const radiusX = (entity.width * gridSize / 2) * this.widthScale;
        const radiusY = (entity.width * gridSize / 4) * this.heightScale;

        ctx.save();
        
        // 3. Desenha a elipse preenchida
        ctx.beginPath();
        ctx.fillStyle = this.color;
        // ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle)
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}