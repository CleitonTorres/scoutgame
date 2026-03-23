import { Camera } from "../engine/Camera.js";
import { QuestSystem } from "../engine/Quest/QuestSystem.js";
import { EventBus } from "./EventBus.js";
import { tags } from "./tags.js";

/**
 * @typedef {import("../entities/Player").Player} Player
 * @typedef {import("./UIManager").UIManager} UIManager
 * @typedef {import ("../engine/Quest/QuestSystem").QuestSystem} QuestSystem
 * @typedef {import("../engine/GameObject").GameObject} GameObject
 * @typedef {import("../engine/SpatialHashGrid").SpatialHashGrid} SpatialHashGrid
 */
export class Game {
    /**
     * Objeto Game
     * @param {{
        * canvas: HTMLCanvasElement,
        * ctx: CanvasRenderingContext2D,
        * gridSize: number,
        * grid: SpatialHashGrid,
        * uiManager: UIManager,
        * eventBus: EventBus,
        * worldObjects: GameObject[],
     * }} option 
     */
    constructor({
        canvas,
        ctx,
        gridSize,
        grid,
        eventBus,
        uiManager,
        worldObjects
    }) {
        /**
         * World Camera.
         */
        this.mainCamera = new Camera({
            x: 0, y: 0, 
            width: 12, height: 12, zoom: 1, 
            showViewport: false,
            shape: "circle"
        });        

        /**
         * @type {HTMLCanvasElement | null}
         */
        this.canvas = canvas || null;

        /**
         * @type {CanvasRenderingContext2D | null}
         */
        this.ctx = ctx || null;

        /**
         * @type {number}
         */
        this.gridSize = gridSize || 64;

        /**
         * Grid virtual para colisões.
         * @type {SpatialHashGrid}
         */
        this.grid = grid || null;

        /**
         * @type {UIManager | null}
         */
        this.uiManager = uiManager || null;

        this._nextObjId = 1; // incremental
        this.activePlayerId = null;

        /**
         * @type {Map<number, GameObject>}
         */
        this.worldObjects = new Map();
        this.registerWorldObjects(worldObjects);

        this.eventBus = eventBus;

        /**
         * @type {QuestSystem | null}
         */
        this.questSystem = new QuestSystem({
            player: this.worldObjects.get(this.activePlayerId), 
            eventBus: this.eventBus
        });
    }

    /**
     * @param {GameObject[]} worldObjects
     */
    registerWorldObjects(worldObjects = []) {
        worldObjects.forEach(obj=>{
            if (!obj.id || obj.id === 0) {
                obj.id = this._nextObjId++;
            }

            if(obj.tag === tags.PLAYER && this.activePlayerId === null) {                
                this.activePlayerId = obj.id;
            }

            this.worldObjects.set(obj.id, obj);
        })
    }

    update() {    
        //atual dados dos objetos de cena que precisam ser atualizados.
        const resolve = Array.from(this.worldObjects.values());
        
        for (let i = resolve.length - 1; i >= 0; i--) {
            const obj = resolve[i];
            if(!obj || !obj.tag) continue;
    
            obj.update?.(this.grid, this);
    
            if(obj.destroyed) this.removeObject(obj);
        }
        
        //atualiza dados do UI.
        const activePlayer = this.getActivePlayer();
        if (activePlayer && this.uiManager) {
            this.uiManager.setPlayerInfo(activePlayer);
        }

        if(this.mainCamera && !this.mainCamera.target && activePlayer){
            this.mainCamera.follow(activePlayer)
        }

        //atualia a camera (viewport)
        this.mainCamera?.update(this.gridSize);   
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
        this.renderCamera(
            this.ctx, 
            this.mainCamera,
            {
                x: 0, 
                y: 0,
                width: this.canvas.width,
                height: this.canvas.height
            }
        );

        this.drawViewportMask(this.ctx, this.mainCamera);
    }

    getActivePlayer() {
        return this.worldObjects.get(this.activePlayerId);
    }

    /**
     * Pegue um objeto no mundo pelo ID do GameObject.
     * @param {number} id 
     * @returns 
     */
    getWorldObject(id){
        if(!id) return;

        return this.worldObjects.get(id);
    }

    /**
     * Pegue uma lista com todos os objetos do mundo.
     */
    getAllWorldObjects(){
        const objs = Array.from(this.worldObjects.values());
        return objs;
    }

    /**
     * Alterar um objeto.
     * @param {GameObject} newData
     */
    updateObject(newData){
        const obj = this.getWorldObject(newData.id);
        if(obj) {
            this.worldObjects.set(newData.id, newData);
            return true;
        }
        return false;
    }

    /**
    * Game deve ser o único responsável por adicionar e remover objetos.
    * @param {GameObject} obj 
    */
    addObject(obj) {
        if (!obj.id) {
            obj.id = this._nextObjId++;
        }

        this.worldObjects.set(obj.id, obj);
    }

    /**
    * Game deve ser o único responsável por adicionar e remover objetos.
    * @param {GameObject} obj 
    */
    removeObject(obj){
        this.worldObjects.delete(obj.id);
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {Camera} camera 
     * @param {{x: number, y: number, width: number, height: number}} viewport
     */
    renderCamera(ctx, camera, viewport) {
        if(!this.mainCamera){
            this.drawWorld(ctx);
            return;
        }

        ctx.save();

        // 1. define viewport na TELA
        ctx.beginPath();
        ctx.rect(
            viewport.x, 
            viewport.y, 
            viewport.width, 
            viewport.height
        );
        ctx.clip();

        // 2. Centraliza o mundo na tela
        // Movemos a origem para o centro do viewport (tela)
        ctx.translate(
            viewport.x + viewport.width / 2,
            viewport.y + viewport.height / 2
        );

        // 3. Aplica o zoom.
        ctx.scale(camera.zoom, camera.zoom);

        // 4. Aplica a posição da Câmera
        // Subtraímos a posição da câmera (em pixels) para mover o mundo no sentido oposto
        // Como a câmera está em tiles, multiplicamos pelo gridSize
        const camX = camera.x * this.gridSize; //Math.floor(camera.x * this.gridSize)
        const camY = camera.y * this.gridSize;

        // Para que o centro da câmera (camera.x + width/2) fique no centro da tela:
        // Precisamos compensar o fato de que camera.x é o canto superior esquerdo.
        const offsetX = (camera.width / 2) * this.gridSize;
        const offsetY = (camera.height / 2) * this.gridSize;

        ctx.translate(-(camX + offsetX), -(camY + offsetY));       

        // 5. Desenha o mundo
        ctx.imageSmoothingEnabled = false;
        this.drawWorld(ctx);
        
        // 6. Desenha o debug da câmera (se ativo)
        if(this.mainCamera && this.mainCamera.showViewport){
            this.mainCamera.draw(ctx, this.gridSize);
        }

        ctx.restore();
    }

    drawWorld(){
        //desenha cada elemento de acordo com sua layer (profundidade)
        const renderQueue = Array.from(this.worldObjects.values());
        renderQueue.sort((a, b) => {
            // 1) layer base (menor primeiro, maior desenha por último = fica na frente)
            const layerDiff = (a.sortLayer ?? 0) - (b.sortLayer ?? 0);
            if (layerDiff !== 0) return layerDiff;
    
            // 2) desempate opcional por Y (bom para profundidade)
            return (a.y ?? 0) - (b.y ?? 0);
        });
        for (const obj of renderQueue) if(obj.visible) obj.draw();
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {Camera} camera 
     */
    drawViewportMask(ctx, camera) {
        // A máscara deve ser desenhada em coordenadas de TELA (0 a canvas.width)
        // O "buraco" deve estar no centro da tela, onde o player está centralizado.        
        const screenCenterX = this.canvas.width / 2;
        const screenCenterY = this.canvas.height / 2;
        
        // O tamanho do buraco depende do tamanho da câmera (em tiles) convertido para pixels
        const viewW = camera.width * this.gridSize * camera.zoom;
        const viewH = camera.height * this.gridSize * camera.zoom;
        const radius = Math.min(viewW, viewH) * 0.35;

        // Configuração do gradiente de sombra
        const innerRadius = radius * 0.8;
        const outerRadius = radius * 1.2;

        ctx.save();

        const gradient = ctx.createRadialGradient(
            screenCenterX, screenCenterY, innerRadius,
            screenCenterX, screenCenterY, outerRadius
        );

        gradient.addColorStop(0, "rgba(0,0,0,0)");
        gradient.addColorStop(1, "rgba(0,0,0,0.8)");

        ctx.beginPath();
        // Área total (tela cheia)
        ctx.rect(0, 0, this.canvas.width, this.canvas.height);

        // Recorte (viewport) centralizado na tela
        if(camera.shape === "circle"){
            ctx.arc(screenCenterX, screenCenterY, radius, 0, Math.PI * 2);
        }else{
            ctx.rect(
                screenCenterX - viewW / 2, 
                screenCenterY - viewH / 2, 
                viewW, 
                viewH
            );
        }

        ctx.fillStyle = gradient;
        ctx.fill("evenodd");        

        ctx.restore();
    }
}