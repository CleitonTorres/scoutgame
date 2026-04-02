/**
* @typedef {{
* spatialGrid: SpatialHashGridInstance,
* uiManager: UIManagerInstance,
* inputManager: InputManagerInstance,
* eventBus: EventBusInstance,
* worldObjects: GameObjectInstance[],
* worldTransform: {width: number, height: number},
* }} GameType
* @global
*/

/**
* @typedef {{
*  name: string,
*  tag: import("../settings/tags.js"),
*  sortLayer: import("../settings/layers.js"),
*  visible: boolean,
*  transform: {
*    width: number,
*    height: number,
*    scale: number
*  },
*  position: {x: number, y: number},
*  physical: {
*    behavior: import("../settings/behaviors.js"),
*    speed: number,
*    mass: number,
*    collision: boolean,
*    smooth: number
*  },
*  state: string,
*  controller: import("../engine/NPCController.js").NPCController | import("../engine/CharacterController.js").CharacterController,
*  animator?: import("../engine/AnimatorController.js").AnimationController,
*  sprite?: HTMLImageElement,
*  animation?: {
*   [anim: string]: {
*        frames: [];
*        fps: number;
*        loop: boolean;
*  }},
*  hitboxes: HitBox[],
*  collides: Collide[],
* }} GameObjectType
* @global
*/

/**
* @typedef {(
*   GameObjectType & {
*   owner: GameObjectInstance,
*   maxLifetime: number
* })} BallonType
* @global
*/

/**
* @typedef {(
*  GameObjectType & {
*  inventory?: Inventory,
* })} PlayerType
* @global
*/

/**
* @typedef {(
*  GameObjectType & {
*  patrolPoints?: {x: number, y: number}[],
*  autoPatrol?: boolean,
*  quest?: import("../engine/Quest/QuestData.js").QuestData
* })} NPCType
* @global
*/

/**
* @typedef {{
* owner: GameObjectInstance,
* showBoxCollide: boolean, 
* offSetBoxCollide: {x: number, y: number}, 
* anchorBoxCollide: {x: number, y: number}, 
* shape: import("../settings/shapes.js")
* }} BoxCollideType
* @global
*/

/**
* @typedef {{
* owner: GameObjectInstance
* showHitbox: boolean, 
* offSetHitbox: {x: number, y: number}, 
* anchorHitBox: {x: number, y: number}, 
* shape: import("../settings/shapes.js")
* }} HitBoxType
* @global
*/

/**
* @typedef {{ 
*   type: "fog" | "hitbox" | "camera" | "collider",
*   value: boolean, 
*   playerID: number,
*   itemId: string,
*   qtdItem?: number,  
*   quests?: import("../engine/Quest/QuestInstance").QuestInstance[], 
*   inventory?: import("../engine/Inventory").Inventory,
* }} PayloadEventBus
* @typedef {"itemCollected" | "defeatEnemy" | "questAccept" | "updateQuest" | "toggleDebug"} EventTypeEventBus
* @typedef {(payload: PayloadEventBus)=>void} CallbackEventBus
* @global
*/

/**
* @typedef {import("../settings/Game.js").Game} GameInstance
* @typedef {import("../engine/GameObject.js").GameObject} GameObjectInstance
* @typedef {import("../settings/UIManager.js").UIManager} UIManagerInstance
* @typedef {import("../settings/InputManager.js").InputManager} InputManagerInstance
* @typedef {import("../entities/Player.js").Player} PlayerInstance
* @typedef {import("../entities/NPC.js").NPC} NPCInstance
* @typedef {import("../entities/Ballon.js").Ballon} BallonInstance
* @typedef {import("../entities/Nature.js").Nature} NatureInstance
* @typedef {import("../entities/Tree.js").Tree} TreeInstance
* @typedef {import("../entities/Wall.js").Wall} WallInstance
* @typedef {import("../entities/BoxCollide.js").BoxCollide} BoxCollideInstance
* @typedef {import("../entities/Hitbox.js").Hitbox} HitboxInstance
* @typedef {import("../engine/Inventory.js").Inventory} InventoryInstance
* @typedef {import("../engine/Item/PickupItem.js").PickupItem} PickupItemInstance
* @typedef {import("../engine/SpatialHashGrid.js").SpatialHashGrid} SpatialHashGridInstance
* @global
*/

export {};
