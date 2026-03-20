import { loadAnimations } from "../engine/Animation.js";

class AssetManager {
    static instance; //não permite ter mais de uma no game.

    constructor() {
        this.animations = new Map();
        this.images = new Map();
        this.audio = new Map();
    }

    /**
     * 
     * @param {string} key - identidade do asset (nome do asset). 
     * @param {string} paths - caminho onde o asset está localizado. 
     * @param {number} fps - velocidade da animação.
     * @param {boolean} loop - se vai rodar em loop ou não. 
     * @returns 
     */
    async loadAnimation(key, paths, fps = 6, loop = true) {
        const animation = await loadAnimations(paths, fps, loop);
        
        this.animations.set(key, animation);

        return animation;
    }

    /**
     * Retorana o objeto de animação.
     * @param {string} key "player.name" ou "item.name" ou "tree.name" ... 
     * @returns {{
     *  [anim:string]: {frames: [], fps: number, loop: boolean }
     * }}
     */
    getAnimation(key) { 
        if (!this.animations.has(key)) {
            console.warn(`Animation not found: ${key}`);
            return {};
        }
        return this.animations.get(key);
    }

    async loadAll() {
        // PLAYER
        const avaliablePlayers = [
            "leo",
            "lipe"
        ]
        for(const player of avaliablePlayers){
            const playerPaths = createPlayerManifest(
                "./src/assets/characters/",
                player
            );

            await this.loadAnimation(
                `player.${player}`,
                playerPaths,
                6,
                true
            );
        }

        // NPCs
        const npcs = ["baloo-f", "bp"];
        for (const npc of npcs) {
            const paths = createNPCManifest(
                "./src/assets/characters/", 
                npc
            );

            await this.loadAnimation(`npc.${npc}`, paths, 4, true);
        }

        // ITEMS
        const avaliableItems = [
            "apple_01",
            "bexiga"
        ]
        for (const item of avaliableItems) {
            const paths = creatObjectManifest(
                "./src/assets/objects/", 
                item
            );
            
            await this.loadAnimation(`obj.${item}`, paths, 6, true);
        }

        //TREES
        const trees = [
            'tree01',
            'tree07'
        ];
        for (const tree of trees) {
            const paths = createTreesManifest(
                "./src/assets/objects/", 
                tree
            );
            
            const randomFps = Math.random() * 3 + 1;
            await this.loadAnimation(`obj.${tree}`, paths, randomFps, true);
        }
    }
}
export const assetManager = new AssetManager();


export function createPlayerManifest(basePath, character) {
    return {
        idle: [
            `${basePath}${character}/idle/down/0.png`,
            `${basePath}${character}/idle/down/1.png`,
            `${basePath}${character}/idle/down/2.png`,
            `${basePath}${character}/idle/down/3.png`,
        ], 
        idleRight: [
            `${basePath}${character}/idle/right/0.png`,
            `${basePath}${character}/idle/right/1.png`,
            `${basePath}${character}/idle/right/2.png`,
            `${basePath}${character}/idle/right/3.png`,
        ],
        idleLeft: [
            `${basePath}${character}/idle/left/0.png`,
            `${basePath}${character}/idle/left/1.png`,
            `${basePath}${character}/idle/left/2.png`,
            `${basePath}${character}/idle/left/3.png`,
        ],
        idleUp: [
            `${basePath}${character}/idle/up/0.png`,
            `${basePath}${character}/idle/up/1.png`,
            `${basePath}${character}/idle/up/2.png`,
            `${basePath}${character}/idle/up/3.png`,
        ],
        idleDown: [
            `${basePath}${character}/idle/down/0.png`,
            `${basePath}${character}/idle/down/1.png`,
            `${basePath}${character}/idle/down/2.png`,
            `${basePath}${character}/idle/down/3.png`,
        ],
        walkUp: [
            `${basePath}${character}/walk/up/0.png`,
            `${basePath}${character}/walk/up/1.png`,
            `${basePath}${character}/walk/up/2.png`,
            `${basePath}${character}/walk/up/3.png`,
        ], 
        walkDown: [
            `${basePath}${character}/walk/down/0.png`,
            `${basePath}${character}/walk/down/1.png`,
            `${basePath}${character}/walk/down/2.png`,
            `${basePath}${character}/walk/down/3.png`,
        ], 
        walkLeft: [
            `${basePath}${character}/walk/left/0.png`,
            `${basePath}${character}/walk/left/1.png`,
            `${basePath}${character}/walk/left/2.png`,
            `${basePath}${character}/walk/left/3.png`,
        ], 
        walkRight: [
            `${basePath}${character}/walk/right/0.png`,
            `${basePath}${character}/walk/right/1.png`,
            `${basePath}${character}/walk/right/2.png`,
            `${basePath}${character}/walk/right/3.png`,
        ],
        push:[
            `${basePath}${character}/walk/right/0.png`,
            `${basePath}${character}/walk/right/1.png`,
            `${basePath}${character}/walk/right/2.png`,
            `${basePath}${character}/walk/right/3.png`,
        ]
    };
}

export function createNPCManifest(path, npc){
    //carrega as animações de cada NPC disponível.
    const paths = {
        idle: [
            `${path}${npc}/idle/down/0.png`,
            `${path}${npc}/idle/down/1.png`,
            `${path}${npc}/idle/down/2.png`,
            `${path}${npc}/idle/down/3.png`,
        ],
        walkUp: [
            `${path}${npc}/walk/up/0.png`,
            `${path}${npc}/walk/up/1.png`,
            `${path}${npc}/walk/up/2.png`,
            `${path}${npc}/walk/up/3.png`,
        ],
        walkDown: [
            `${path}${npc}/walk/down/0.png`,
            `${path}${npc}/walk/down/1.png`,
            `${path}${npc}/walk/down/2.png`,
            `${path}${npc}/walk/down/3.png`,
        ],
        walkLeft: [
            `${path}${npc}/walk/left/0.png`,
            `${path}${npc}/walk/left/1.png`,
            `${path}${npc}/walk/left/2.png`,
            `${path}${npc}/walk/left/3.png`,
        ],
        walkRight: [
            `${path}${npc}/walk/right/0.png`,
            `${path}${npc}/walk/right/1.png`,
            `${path}${npc}/walk/right/2.png`,
            `${path}${npc}/walk/right/3.png`,
        ]
    };

    return paths;
}

export function createTreesManifest(path, obj){
    const paths = {
        move: [
            `${path}arvores/${obj}/move/0.png`,
            `${path}arvores/${obj}/move/1.png`,
            `${path}arvores/${obj}/move/2.png`,
            `${path}arvores/${obj}/move/3.png`,
            `${path}arvores/${obj}/move/4.png`,
            `${path}arvores/${obj}/move/5.png`,
        ],
    };

    return paths;
}

export function creatObjectManifest(path, name){
    const pathMonted = {
        move:[
            `${path}${name}/move/0.png`,
            `${path}${name}/move/1.png`,
            `${path}${name}/move/2.png`,
            `${path}${name}/move/3.png`,
        ],
        hit:[
            `${path}${name}/hit/0.png`,
            `${path}${name}/hit/1.png`,
            `${path}${name}/hit/2.png`,
            `${path}${name}/hit/3.png`,
        ],
    }

    return pathMonted;
}