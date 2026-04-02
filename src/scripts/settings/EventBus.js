/**
* @typedef {import("../types/types").PayloadEventBus} Payload 
* @typedef {import("../types/types").EventTypeEventBus} EventType
* @typedef {import("../types/types").CallbackEventBus} Callback
*/
export class EventBus {
    /**
    * @type {{
    *  [event: EventType]: Callback[]
    * }}
    */
    constructor() {
        /**
        * @type {{
        *  [event: EventType]: Callback[]
        * }}
        */
        this.listeners = {};
    }

    /**
     * 
     * @param {{
     *  event: EventType,
     *  callback: (payload: Payload)=>void
     * 
     * }} options
     */
    on({event, callback}) {
        // se ninguem estiver escutando.
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        
        //se tiver alguém escutando adiciona o callback.
        this.listeners[event].push(callback);
    }

    /**
    *  
    * @param {{
    *   event:  EventType,
    *   payload: Payload
    * }} options 
    */
    emit({event, payload}) {
        // se ninguem estiver escutando.
        const list = this.listeners[event];
        if (!list) return;

        // se tiver, adiciona o payload (dados)
        list.forEach(cb => cb(payload));
    }
}