class Canvas {
    /**
     * @type {Canvas}
     */
    static #instance = null;
    /**
     * @type {HTMLCanvasElement | null}
     */
    static #canvas = null;
    /**
     * @type {CanvasRenderingContext2D | null}
     */
    static #ctx = null;
    /**
     * @type {{width: number, height: number}}
     */
    static #worldTransform = {width: 5000, height: 5000}

    constructor() {}

    static getInstance() {
        if (!Canvas.#instance) {
            Canvas.#canvas = document.getElementById('gameCanvas');
            if (!Canvas.#canvas) {
                throw new Error('Canvas element not found in DOM');
            }
            Canvas.#ctx = Canvas.#canvas.getContext('2d');
            Canvas.#instance = new Canvas();
        }
        return Canvas.#instance;
    }

    static getCanvas() {
        Canvas.getInstance();
        return Canvas.#canvas;
    }

    static getContext() {
        Canvas.getInstance();
        return Canvas.#ctx;
    }

    static getWidth() {
        return Canvas.#canvas?.width || 0;
    }

    static getHeight() {
        return Canvas.#canvas?.height || 0;
    }

    static clear() {
        Canvas.#ctx?.clearRect(0, 0, Canvas.#canvas.width, Canvas.#canvas.height);
    }

    static getGridsize(){
        return 64;
    }

    static getWorldTransform(){
        return Canvas.#worldTransform;
    }
}

export default Canvas;