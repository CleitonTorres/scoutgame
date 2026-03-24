import Canvas from "../settings/Canvas.js";
import { ItemData } from "../engine/Item/ItemData.js";
import { QuestData } from "../engine/Quest/QuestData.js";
import { NPC } from "../entities/NPC.js";
import { Tree } from "../entities/Tree.js";
import { Wall } from "../entities/Wall.js";
import { itemsTypes } from "../settings/itemsTypes.js";
import { tags } from "../settings/tags.js";
import { layers } from "../settings/layers.js";
import { shapes } from "../settings/shapes.js";
import { PickupItem } from "../engine/Item/PickupItem.js";
import AssetManager from "../settings/AssetsManager.js";

/**
 * Classe InitialScene
 * Responsável por criar e retornar os objetos da cena inicial.
 */
export class InitialScene {
    constructor() {
        this.canvas = Canvas.getCanvas();
        this.gridSize = Canvas.getGridsize();
        
        // Pontos para simulação de caminhada de NPC.
        this.patrolPoints = [
            { x: 2, y: 10 },
            { x: 10, y: 5 },
            { x: 10, y: 8 },
            { x: 5, y: 8 }
        ];
    }

    /**
     * Cria e retorna a lista de objetos da cena.
     * Este método deve ser chamado APÓS o AssetManager.loadAll().
     */
    getObjects() {
        return [
            ...this._createNPCs(),
            ...this._createWalls(),
            ...this._createTrees(),
            ...this._createItems()
        ];
    }

    _createNPCs() {
        return [
            new NPC({
                name: "Baloo",
                tag: tags.NPC_quest,
                physical: { behavior: "dynamic", collision: false, mass: 7, smooth: 6, speed: 3 },
                position: { x: 10, y: 1 },
                hitboxes: [{ offSetHitbox: { x: 15, y: 10 }, anchorHitBox: { x: 0, y: 0 }, showHitbox: false }],
                collides: [{ offSetBoxCollide: { x: 15, y: 20 }, anchorBoxCollide: { x: 0, y: 20 }, showBoxCollide: false }],
                quest: new QuestData({
                    id: "collect_apples",
                    name: "Coletar Maçãs",
                    description: "Colete 3 maçãs",
                    objectives: [{ type: "collect", itemId: "apple", amount: 3 }],
                    rewards: [{ 
                        type: "item", amount: 1, 
                        item: new ItemData({
                            id: "axe", name: "Machadinha", type: itemsTypes.TOOL, stackable: false, maxStack: 1,
                            description: "uma machadinha para cortar lenha",
                            icon: "src/assets/objects/forest-pack-sprites/axe.png"
                        })
                    }],
                    dialogs: { start: "Pode coletar 3 maçãs pra mim?", progress: "Ainda faltam maçãs...", complete: "Obrigado pelas maçãs!" }
                }),
                sortLayer: layers.underFloor,
                state: "idle",
                animation: AssetManager.getAnimation("npc.baloo-f"),
                canvas: this.canvas,
                gridSize: this.gridSize
            }),
            new NPC({
                name: "BP",
                tag: "NPC",
                physical: { behavior: "dynamic", collision: true, mass: 7, smooth: 6, speed: 0.5 },
                patrolPoints: this.patrolPoints,
                position: { x: 2, y: 10 },
                hitboxes: [{ offSetHitbox: { x: 10, y: 10 }, anchorHitBox: { x: 0, y: 0 }, showHitbox: false }],
                collides: [{ offSetBoxCollide: { x: 15, y: 20 }, anchorBoxCollide: { x: 0, y: 20 }, showBoxCollide: false }],
                sortLayer: layers.underFloor,
                state: "idle",
                animation: AssetManager.getAnimation("npc.bp"),
                canvas: this.canvas,
                gridSize: this.gridSize
            })
        ];
    }

    _createWalls() {
        const wallConfig = { 
            tag: tags.WALL, 
            sortLayer: layers.ground, 
            physical: { behavior: 'static', collision: true, mass: Infinity }, 
            transform: { height: 0.5 }, 
            gridSize: this.gridSize, 
            canvas: this.canvas 
        };

        return [
            new Wall({ 
                ...wallConfig, 
                name: 'Wall1', 
                position: { x: 4, y: 4 },
                hitboxes: [{ 
                    offSetHitbox: { x: 0, y: 0 }, 
                    anchorHitBox: { x: 0, y: 0 }, 
                    showHitbox: true 
                }], 
                collides: [{ 
                    offSetBoxCollide: { x: 0, y: 0 }, 
                    anchorBoxCollide: { x: 0, y: 0 }, 
                    showBoxCollide: true 
                }],
            }),
            new Wall({ 
                ...wallConfig, 
                name: 'Wall2', 
                position: { x: 5, y: 5 }, 
                hitboxes: [{ 
                    offSetHitbox: { x: 0, y: 0 }, 
                    anchorHitBox: { x: 0, y: 0 }, 
                    showHitbox: true 
                }], 
                collides: [{ 
                    offSetBoxCollide: { x: 0, y: 0 }, 
                    anchorBoxCollide: { x: 0, y: 0 }, 
                    showBoxCollide: true 
                }],
            }),
            new Wall({ 
                ...wallConfig, 
                name: 'Wall3', 
                position: { x: 6, y: 4 }, 
                hitboxes: [{ 
                    offSetHitbox: { x: 0, y: 0 }, 
                    anchorHitBox: { x: 0, y: 0 }, 
                    showHitbox: true 
                }], 
                collides: [{ 
                    offSetBoxCollide: { x: 0, y: 0 }, 
                    anchorBoxCollide: { x: 0, y: 0 }, 
                    showBoxCollide: true 
                }],
            })
        ];
    }

    _createTrees() {
        return [
            new Tree({ 
                name: 'Tree1', 
                tag: tags.TREE, 
                sortLayer: layers.underFloor, 
                position: { x: 9, y: 5 }, 
                physical: { collision: true }, 
                hitboxes: [{ 
                    offSetHitbox: { x: 20, y: 10 }, 
                    anchorHitBox: { x: 0, y: 0 }, 
                    showHitbox: false 
                }], 
                collides: [{ 
                    offSetBoxCollide: { x: 25, y: 25 }, 
                    anchorBoxCollide: { x: 0, y: 25 }, 
                    showBoxCollide: false 
                }], 
                state: "move", 
                animation: AssetManager.getAnimation("obj.tree01"), 
                canvas: this.canvas 
            }),
            new Tree({ 
                name: 'Tree2', 
                tag: tags.TREE, 
                sortLayer: layers.underFloor, 
                position: { x: 6, y: 7.5 },
                physical: { collision: true }, 
                transform: { width: 2, height: 2, scale: 1 }, 
                hitboxes: [
                    { 
                        offSetHitbox: { x: 50, y: 25 }, 
                        anchorHitBox: { x: 8, y: 25 }, 
                        showHitbox: false 
                    }, 
                    { 
                        shape: shapes.CIRCLE, 
                        offSetHitbox: { x: 15, y: 15 }, 
                        anchorHitBox: { x: -15, y: -33 }, 
                        showHitbox: false 
                    }
                ], 
                collides: [{ 
                    offSetBoxCollide: { x: 50, y: 60 }, 
                    anchorBoxCollide: { x: 10, y: 60 }, 
                    showBoxCollide: false 
                }], 
                state: "move", 
                animation: AssetManager.getAnimation("obj.tree07"), 
                gridSize: this.gridSize, 
                canvas: this.canvas 
            }),
        ];
    }

    _createItems() {
        const appleConfig = { 
            visible: false, 
            itemData: new ItemData({ 
                id: "apple", 
                name: "Maçã", 
                stackable: true, 
                maxStack: 10, 
                type: "food", 
                icon: "src/assets/objects/forest-pack-sprites/apple_01.png", 
                onUse(player){ player.hp += 5 } 
            }),
            quantity: 2, 
            transform: { width: 0.5, height: 0.5 }, 
            sprite: "src/assets/objects/forest-pack-sprites/apple_01.png", 
            canvas: this.canvas,
        };
        return [
            new PickupItem({ 
                ...appleConfig, 
                position: { x: 4, y: 9 } 
            }),
            new PickupItem({ 
                ...appleConfig, 
                position: { x: 7, y: 7 }, 
                sortLayer: layers.ground 
            }),
            new PickupItem({ 
                ...appleConfig, 
                position: { x: 13, y: 2 } 
            })
        ];
    }
}