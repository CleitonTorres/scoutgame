import { GameObject } from "./GameObject.js";

export class SpatialHashGrid {

    // 1️⃣ Construtor da estrutura.
    // cellSize define o tamanho de cada célula da grade espacial.
    // Objetos próximos acabam caindo na mesma célula ou em células vizinhas.
    constructor(cellSize = 2) {
        this.cellSize = cellSize;

        // Map que armazena as células da grade.
        // A chave é uma string no formato "x,y" representando a posição da célula.
        // O valor é um array com os objetos que estão naquela célula.
        this.grid = new Map();
    }

    // 2️⃣ Limpa completamente a grade.
    // Normalmente chamado no início de cada frame do jogo,
    // antes de reinserir todos os objetos atualizados.
    clear() {
        this.grid.clear();
    }

    // 3️⃣ Converte uma posição do mundo (x,y) em uma chave de célula.
    // Divide a posição pelo tamanho da célula e arredonda para baixo.
    /**
     * Isso determina em qual célula do grid o objeto está.
     * @param {number} x - posição x do objeto.
     * @param {number} y - posição y do objeto.
     * @returns 
     */
    getCellKey(x, y) {
        //floor arredonda para baixo.
        const cx = Math.floor(x / this.cellSize);
        const cy = Math.floor(y / this.cellSize);

        // A célula é representada como string para ser usada como chave do Map.
        return `${cx},${cy}`;
    }

    // 4️⃣ Insere um objeto na célula correspondente à sua posição.
    insert(obj) {
        // Descobre qual célula corresponde à posição do objeto.
        const key = this.getCellKey(obj.x, obj.y);

        // Se a célula ainda não existe no grid, cria um array vazio.
        if (!this.grid.has(key)) {
            this.grid.set(key, []);
        }

        // Adiciona o objeto na lista de objetos daquela célula.
        this.grid.get(key).push(obj);
    }

    // 5️⃣ Consulta objetos próximos de uma posição (x,y).
    // Em vez de retornar todos os objetos do mundo,
    /**
     * retorna apenas os que estão na célula atual e nas células vizinhas.
     * @param {*} x - posição x do objeto.
     * @param {*} y - posição y do objeto.
     * @returns {Array<GameObject>} - retornar um array contendo os objetos próximos.
     */
    query(x, y) {

        // Descobre a célula onde a posição do objeto está localizada.
        const cx = Math.floor(x / this.cellSize);
        const cy = Math.floor(y / this.cellSize);

        // Array que armazenará os objetos encontrados nas células vizinhas.
        const results = [];

        // Percorre um quadrado 3x3 de células ao redor da posição.
        // Isso inclui:
        // - a célula atual
        // - as 8 células vizinhas
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {

                // Calcula a chave da célula vizinha.
                const key = `${cx + dx},${cy + dy}`;

                // Busca os objetos armazenados nessa célula.
                const cell = this.grid.get(key);

                // Se houver objetos, adiciona todos ao resultado.
                if (cell) {
                    results.push(...cell);
                }
            }
        }

        // Retorna apenas os objetos próximos da posição consultada.
        return results;
    }
}