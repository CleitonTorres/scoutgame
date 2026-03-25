/**
 * 
 * @param {import("../engine/GameObject").GameObject} entity 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {string} text 
 * @returns 
 */
export function drawLabel(entity, ctx, text){
    if(!ctx || !entity) return;

    //estilo do texto.
    ctx.font = "12px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center"; // left | center | right
    ctx.textBaseline = "bottom"; // top | middle | bottom

    const posx = (entity.x * entity.gridSize) + (entity.width * entity.gridSize) / 2;
    const posy = (entity.y * entity.gridSize);
    //desenha o texto.
    ctx.fillText(text, posx, posy);
}

/**
 * Classe FloatingLabel
 * Cria um texto animado que flutua acima de um GameObject.
 */
export class FloatingLabel {
    /**
     * @param {Object} options
     * @param {string} options.text - O texto a ser exibido.
     * @param {string} [options.color] - Cor do texto (padrão: branco).
     * @param {number} [options.fontSize] - Tamanho da fonte (padrão: 14).
     * @param {string} [options.fontFamily] - Fonte retro (padrão: 'Press Start 2P' ou 'monospace').
     */
    constructor({ text, color = "white", fontSize = 14, fontFamily = "'Press Start 2P', monospace" }) {
        this.text = text;
        this.color = color;
        this.fontSize = fontSize;
        this.fontFamily = fontFamily;

        // Variáveis para a animação de flutuação
        this.timer = 0;
        this.floatSpeed = 0.05; // Velocidade da oscilação
        this.floatAmplitude = 5; // Quantos pixels ele sobe e desce
        this.offsetY = 0; // O deslocamento atual calculado
    }

    /**
     * Atualiza a animação de flutuação.
     * Deve ser chamado no update do jogo.
     */
    update() {
        this.timer += this.floatSpeed;
        // Usamos Math.sin para criar um movimento suave de vai-e-vem (onda senoidal)
        this.offsetY = Math.sin(this.timer) * this.floatAmplitude;
    }

    /**
     * Desenha o label acima da entidade.
     * @param {CanvasRenderingContext2D} ctx 
     * @param {import("./GameObject").GameObject} entity 
     */
    draw(ctx, entity) {
        if (!ctx || !entity) return;

        const gridSize = entity.gridSize || 64;
        
        // Calcula a posição centralizada acima da cabeça da entidade
        const posX = (entity.x * gridSize) + (entity.width * gridSize) / 2;
        // Subtraímos 10 pixels extras para não ficar colado na cabeça + o offsetY da animação
        const posY = (entity.y * gridSize) - 10 + this.offsetY;

        ctx.save();

        // Estilo Retro
        ctx.font = `${this.fontSize}px ${this.fontFamily}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";

        // 1. Desenha uma sombra/contorno para facilitar a leitura (estilo game antigo)
        ctx.fillStyle = "black";
        ctx.fillText(this.text, posX + 2, posY + 2);

        // 2. Desenha o texto principal
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, posX, posY);

        ctx.restore();
    }
}