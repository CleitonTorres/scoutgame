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
    }

    draw() {
        // Limpa o canvas antes de desenhar a próxima frame
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
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
}