import { loadAnimations } from "../engine/Animation.js";

/**
 * Classe AssetManager (Estática)
 * Gerencia o carregamento e armazenamento de todos os recursos do jogo.
 */
class AssetManager {
    // Propriedades privadas e estáticas para armazenar os assets
    static #animations = new Map();
    static #images = new Map();
    static #audio = new Map();

    // Construtor vazio (não deve ser instanciado)
    constructor() {}

    /**
     * Carrega uma animação e a armazena no cache.
     */
    static async loadAnimation(key, paths, fps = 6, loop = true) {
        // Assume que loadAnimations é uma função global ou importada
        const animation = await loadAnimations(paths, fps, loop);
        if(animation) {
            AssetManager.#animations.set(key, animation);
            return true;
        }
        else return false;
    }

    /**
     * Retorna uma animação do cache.
     */
    static getAnimation(key) {
        if (!AssetManager.#animations.has(key)) {
            console.warn(`Animation not found: ${key}`);
            return {};
        }
        return AssetManager.#animations.get(key);
    }

    /**
     * Carrega uma imagem simples e a armazena no cache.
     */
    static async loadImage(key, path) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = path;
            img.onload = () => {
                AssetManager.#images.set(key, img);
                resolve(img);
            };
            img.onerror = () => reject(`Erro ao carregar imagem: ${path}`);
        });
    }

    /**
     * Retorna uma imagem do cache.
     */
    static getImage(key) {
        return AssetManager.#images.get(key);
    }

    /**
     * Carrega todos os assets iniciais do jogo.
     */
    static async loadAll() {
        console.log("Iniciando carregamento de assets...");
        let isLoaded = false;

        // PLAYER
        const avaliablePlayers = ["leo", "lipe"];
        for(const player of avaliablePlayers){
            const playerPaths = createPlayerManifest("./src/assets/characters/", player);
            isLoaded = await AssetManager.loadAnimation(`player.${player}`, playerPaths, 6, true);
        }

        // NPCs
        const npcs = ["baloo-f", "bp"];
        for (const npc of npcs) {
            const paths = createNPCManifest("./src/assets/characters/", npc);
            isLoaded = await AssetManager.loadAnimation(`npc.${npc}`, paths, 4, true);
        }

        // ITEMS
        const avaliableItems = ["apple_01", "bexiga"];
        for (const item of avaliableItems) {
            const paths = creatObjectManifest("./src/assets/objects/", item);
            isLoaded = await AssetManager.loadAnimation(`obj.${item}`, paths, 6, true);
        }

        // TREES
        const trees = ['tree01', 'tree07'];
        for (const tree of trees) {
            const paths = createTreesManifest("./src/assets/objects/", tree);
            const randomFps = Math.random() * 3 + 1;
            isLoaded = await AssetManager.loadAnimation(`obj.${tree}`, paths, randomFps, true);
        }

        console.log("Todos os assets foram carregados com sucesso!");
        return isLoaded;
    }
}

export default AssetManager;


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