import { Camera } from "../engine/Camera.js";
import { QuestSystem } from "../engine/Quest/QuestSystem.js";
import { shooter } from "../engine/Shooter.js";
import AssetManager from "./AssetsManager.js";
import Canvas from "./Canvas.js";
import { EventBus } from "./EventBus.js";
import { InputManager } from "./InputManager.js";
import { tags } from "./tags.js";

/**
 * @typedef {import("../entities/Player").Player} Player
 * @typedef {import("./UIManager").UIManager} UIManager
 * @typedef {import ("../engine/Quest/QuestSystem").QuestSystem} QuestSystem
 * @typedef {import("../engine/GameObject").GameObject} GameObject
 * @typedef {import("../engine/SpatialHashGrid").SpatialHashGrid} SpatialHashGrid
 * @typedef {{x: number, y: number, width: number, height: number}} Viewport
 */
export class Game {
    /**
     * Objeto Game
     * @param {{
        * grid: SpatialHashGrid,
        * uiManager: UIManager,
        * inputManager: InputManager,
        * eventBus: EventBus,
        * worldObjects: GameObject[],
        * worldTransform: {width: number, height: number} - largura e altura do mundo.
     * }} option 
     */
    constructor({
        spatialGrid,
        eventBus,
        uiManager,
        inputManager,
        worldObjects,
    }) {
        /**
         * World Camera.
         */
        this.mainCamera = new Camera({
            x: 0, y: 0, 
            width: 15, height: 12, zoom: 1, 
            showViewport: false,
            shape: "circle", fogWar: false
        });        

        /**
         * Grid virtual para colisões.
         * @type {SpatialHashGrid}
         */
        this.spatialGrid = spatialGrid || null;

        /**
         * @type {UIManager | null}
         */
        this.uiManager = uiManager || null;
        this.inputManager = inputManager || null;

        this._nextObjId = 1; // incremental
        this.activePlayerId = null;

        /**
         * @type {Map<number, GameObject>}
         */
        this.worldObjects = new Map();
        this.registerWorldObjects(worldObjects);

        /**
         * Listeners de eventos.
         */
        this.eventBus = eventBus;

        /**
         * @type {QuestSystem | null}
         */
        this.questSystem = new QuestSystem({
            player: this.worldObjects.get(this.activePlayerId), 
            eventBus: this.eventBus
        });

        // Listener para controles de Debug vindos do UIManager
        this.eventBus?.on({
            event: "toggleDebug",
            callback: (data) => {
                if (data.type === "camera") {
                    this.mainCamera.showViewport = data.value;
                }
                // Você pode adicionar outros aqui, como: fog, hitbox etc
                if (data.type === "fog") this.mainCamera.fogWar = data.value;

                if(data.type === "hitbox"){
                    const objs = this.getAllWorldObjects()
                    objs.forEach(o=> o.hitboxes.forEach(h=> h.showHitbox = data.value))
                }

                if(data.type === "collider"){
                    const objs = this.getAllWorldObjects()
                    objs.forEach(o=> o.collides.forEach(c=> c.showBoxCollide= data.value))
                }
            }
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
        // 1. Atualiza os inputs (Teclado + Gamepad)
        this.inputManager?.update();

        // 2. Se houver um diálogo aberto, o input é desviado para a UI
        if (this.uiManager?.isDialogOpen) {
            this._handleDialogInput();
        } else{
            //atual dados dos objetos de cena que precisam ser atualizados.
            const resolve = Array.from(this.worldObjects.values());
        
            for (let i = resolve.length - 1; i >= 0; i--) {
                const obj = resolve[i];
                if(!obj || !obj.tag) continue;
        
                obj.update?.(this.spatialGrid, this, Canvas.getWorldTransform());
                
                if(obj.destroyed) this.removeObject(obj);
            }

            // 2. Lógica de Atirar (Espaço ou Gatilho do Controle)
            if (this.inputManager.state.shootPressed) {
                const isCollided = this.getActivePlayer()?.hitboxes?.find(hit => hit.hit.length > 0);
                if (!isCollided) {
                    this.addObject(
                        shooter(this.getActivePlayer(), AssetManager.getAnimation("obj.bexiga"), 
                        Canvas.getCanvas(), 
                        Canvas.getGridsize(),
                        Canvas.getWorldTransform()
                    ));
                }
            }

            // 3. Lógica de UI (Inventário, Quests, etc.)
            if (this.inputManager.state.inventory) {
                this.uiManager.toggleInventory();
            }
            if (this.inputManager.state.quest) {
                this.uiManager.toggleQuestUI();
            }

            // 4. Teclas Especiais (como o ESC)
            // Você pode adicionar 'escape' na sua classe InputManager se quiser centralizar tudo
            if (this.inputManager.state.escape) {
                this.uiManager.hideAll(); // Função hipotética para fechar tudo
            }
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
        this.mainCamera?.update(Canvas.getGridsize());  
        
        // Limpa os cliques únicos para o próximo frame
        this.inputManager.clearPresses(this.inputManager.state);
    }

    draw() {
        Canvas.getContext().clearRect(0, 0, Canvas.getCanvas().width, Canvas.getCanvas().height);
    
        this.renderCamera(
            Canvas.getContext(), 
            this.mainCamera,
            {
                x: 0, 
                y: 0,
                width: Canvas.getCanvas().width,
                height: Canvas.getCanvas().height
            }
        );

        if(this.mainCamera.fogWar) this.drawViewportMask(Canvas.getContext(), this.mainCamera);
    }

    /**
     * Gerencia a navegação e confirmação de diálogos via Gamepad/Teclado.
     */
    _handleDialogInput() {
        if (!this.inputManager || !this.uiManager) return;

        // Navegação entre botões (Esquerda/Direita)
        if (this.inputManager.state.leftPressed) {
            this.uiManager.navigateDialog(-1);
        }
        if (this.inputManager.state.rightPressed) {
            this.uiManager.navigateDialog(1);
        }

        // Confirmação (Botão de Diálogo/Ação)
        if (this.inputManager.state.dialog) {
            this.uiManager.confirmSelection();
        }
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
     * @param {Viewport} viewport
     */
    renderCamera(ctx, camera, viewport) {
        //if there is no camera set up, draw the static world (without following anyone).
        if(!this.mainCamera){
            this.drawWorld(ctx);
            return;
        }

        // Save() is like taking a "snapshot" of the current brush settings (color, position, etc.).
        // We do this so we can mess everything up in there and then revert to normal with restore().
        ctx.save();

        // 1. STEP 1: THE FRAME (CLIP)
        // Here we tell the computer: "only draw inside this rectangle." 
        // This prevents the game from drawing things outside the viewport sets.
        ctx.beginPath();
        ctx.rect(
            viewport.x, 
            viewport.y, 
            viewport.width, 
            viewport.height
        );
        // Anything drawn after this point will only appear inside this rectangle.
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
        const camX = Math.floor(camera.x * Canvas.getGridsize());
        const camY = Math.floor(camera.y * Canvas.getGridsize());

        // Para que o centro da câmera (camera.x + width/2) fique no centro da tela:
        // Precisamos compensar o fato de que camera.x é o canto superior esquerdo.
        const offsetX = (camera.width / 2) * Canvas.getGridsize();
        const offsetY = (camera.height / 2) * Canvas.getGridsize();

        ctx.translate(-(camX + offsetX), -(camY + offsetY));       

        // 5. Desenha o mundo
        ctx.imageSmoothingEnabled = false;
        this.drawWorld(ctx, camera);
        
        // 6. Desenha o debug da câmera (se ativo)
        if(this.mainCamera && this.mainCamera.showViewport){
            this.mainCamera.draw(ctx, Canvas.getGridsize());
        }

        ctx.restore();
    }

    /**
     * Desenha o mundo de forma otimizada (Culling).
     * @param {CanvasRenderingContext2D} ctx 
     * @param {Camera} camera 
     */
    drawWorld(ctx, camera) {
        // 1. Definimos a área visível (Viewport) em TILES
        // Adicionamos uma pequena margem (buffer) de 1 ou 2 tiles para evitar que 
        // objetos grandes "pisquem" ao entrar na tela.
        const buffer = 3;
        const viewLeft = camera.x - buffer;
        const viewRight = camera.x + camera.width + buffer;
        const viewTop = camera.y - buffer;
        const viewBottom = camera.y + camera.height + buffer;

        // 2. Pegamos todos os objetos e ordenamos por profundidade (Layer e Y)
        const renderQueue = Array.from(this.worldObjects.values());
        
        renderQueue.sort((a, b) => {
            // 1. Primeiro critério: A camada fixa (sortLayer)
            // Ex: Chão (0) sempre desenha antes de Árvore (10)
            const layerDiff = (a.sortLayer ?? 0) - (b.sortLayer ?? 0);
            if (layerDiff !== 0) return layerDiff;

            // 2. Segundo critério (O SEGREDO): A base do objeto (Y + Altura)
            // Se dois objetos estão na mesma camada (ex: Player e Árvore),
            // quem estiver com o "pé" mais para baixo (maior Y) desenha por último (fica na frente).
            const bottomA = (a.y ?? 0) + ((a.height * a.scale) ?? 0);
            const bottomB = (b.y ?? 0) + ((b.height * a.scale) ?? 0);
            
            return bottomA - bottomB;
        });

        // 3. O CORAÇÃO DO CULLING:
        // Só desenhamos se o objeto estiver visível E dentro da área da câmera.
        let drawCount = 0; // Contador para debug (opcional)

        for (const obj of renderQueue) {
            if (!obj.visible) continue;

            // Verificamos se a posição do objeto (x, y) está dentro do retângulo da câmera
            const isInsideX = obj.x >= viewLeft && obj.x <= viewRight;
            const isInsideY = obj.y >= viewTop && obj.y <= viewBottom;

            if (isInsideX && isInsideY) {
                obj.draw(ctx);
                drawCount++;
            }
        }

        // Dica: Se quiser ver a mágica acontecendo, descomente a linha abaixo:
        // console.log(`Objetos no mundo: ${renderQueue.length} | Desenhados: ${drawCount}`);
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {Camera} camera 
     */
    drawViewportMask(ctx, camera) {
        // A máscara deve ser desenhada em coordenadas de TELA (0 a canvas.width)
        // O "buraco" deve estar no centro da tela, onde o player está centralizado.        
        const screenCenterX = Canvas.getCanvas().width / 2;
        const screenCenterY = Canvas.getCanvas().height / 2;
        
        // O tamanho do buraco depende do tamanho da câmera (em tiles) convertido para pixels
        const viewW = camera.width * Canvas.getGridsize() * camera.zoom;
        const viewH = camera.height * Canvas.getGridsize() * camera.zoom;
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
        ctx.rect(0, 0, Canvas.getCanvas().width, Canvas.getCanvas().height);

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