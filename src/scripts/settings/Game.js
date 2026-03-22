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
        this.mainCamera?.update();       
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
        this.renderCamera(
            this.ctx, 
            this.mainCamera
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
     * @param {number} x - em pixel
     * @param {number} y - em pixel
     * @param {number} width - em pixel 
     * @param {number} height - em pixel
     */
    renderCamera(ctx, camera) {
        if(!this.mainCamera){
            this.drawWorld(ctx);
            return;
        }

        ctx.save();

        // 1. define viewport na TELA
        ctx.beginPath();
        if(this.mainCamera.shape === "circle"){
            const centerX = (camera.x * this.gridSize) + ((camera.width * this.gridSize) / 2);
            const centerY = (camera.y * this.gridSize) + ((camera.height * this.gridSize) / 2);
            const radius = Math.min((camera.width * this.gridSize), (camera.height * this.gridSize)) * 0.35;
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        }else{
            ctx.rect(
                camera.x * this.gridSize, 
                camera.y * this.gridSize, 
                (camera.width * this.gridSize), 
                (camera.height * this.gridSize)
            );
        }
        ctx.clip();

        // 2. move origem pra posição do viewport
        ctx.translate(
            Math.floor(camera.x), 
            Math.floor(camera.y)
        );

        // 3. aplica câmera (movimento no MUNDO)
        ctx.scale(camera.zoom, camera.zoom);
        const camX = Math.floor(-camera.x);
        const camY = Math.floor(-camera.y);

        ctx.translate(-camX, -camY);
        
        // 4. desenha mundo
        ctx.imageSmoothingEnabled = false;
        this.drawWorld(ctx);
        
        //draw the camera
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
        const viewX = camera.x * this.gridSize;
        const viewY = camera.y * this.gridSize;
        const viewW = camera.width * this.gridSize;
        const viewH = camera.height * this.gridSize;

        //configuração do gradiente de sombra.
        const innerRadius = viewW * 0.2; // área visível
        const outerRadius = viewW * 0.4; // onde escurece totalmente

        ctx.save();

        // 🎯 gradiente CENTRALIZADO NO VIEWPORT (tela)
        const centerX = viewX + viewW / 2;
        const centerY = viewY + viewH / 2;
        const radius = Math.min(viewW, viewH) * 0.35;

        const gradient = ctx.createRadialGradient(
            centerX,
            centerY,
            innerRadius,
            centerX,
            centerY,
            outerRadius
        );

        gradient.addColorStop(0, "rgba(0,0,0,0)");
        gradient.addColorStop(1, "rgba(0,0,0,0.8)");

        // creates a path with a "hole"
        ctx.beginPath();

        // total area (full screen)
        ctx.rect(0, 0, this.canvas.width, this.canvas.height);

        // "recorte" (viewport)
        if(camera.shape === "circle"){
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        }else{
            ctx.rect(viewX, viewY, viewW, viewH);
        }

        // dark color with transparency
        ctx.fillStyle = gradient; //"rgba(0, 0, 0, 0.6)";
        
        // usa regra EVENODD → cria buraco
        ctx.fill("evenodd");        

        ctx.restore();
    }
}