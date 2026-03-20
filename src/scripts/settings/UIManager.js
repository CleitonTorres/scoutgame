export class UIManager {
    /**
     * 
     * @param {import("../settings/EventBus.js")} eventBus 
     */
    constructor(eventBus) {
        this.playerNameEl = document.getElementById("ui-player-name");
        this.playerHpEl = document.getElementById("ui-player-hp");
        this.playerPosEl = document.getElementById("ui-player-pos");
        this.playerLayerEl = document.getElementById("ui-player-layer");
        this.playerAnimEl = document.getElementById("ui-player-anim");

        this.inventoryConteiner = document.getElementById("iu-conteiner-inventory");
        this.inventorySlots = document.querySelectorAll("#ui-inventory .item-inventory");

        this.warningEl = document.getElementById("ui-warning");

        this.uiQuestsConteiner = document.getElementById("ui-hud-quests");
        this.listQuests = document.getElementById("list-quests");

        this.isDialogOpen = false;
        this.dialogEl = document.getElementById("ui-dialog");
        this.dialogSpeakerEl = document.getElementById("ui-dialog-speaker");
        this.dialogTextEl = document.getElementById("ui-dialog-text");
        
        this.dialogButtonsConteiner = document.getElementById("ui-conteiner-button-dialog");
        this.buttonCancelar = document.getElementById("button-cancelar");
        this.buttonOk = document.getElementById("button-ok");
        /**
        * @type {()=>void}
        */
        this.onClickCancelar = null;
        /**
        * @type {()=>void}
        */
        this.onClickOk = null;

        this.warningTimeoutId = null;

        this.inventorySlots.forEach((slot, index) => {
            slot.addEventListener("click", () => {
                console.log("clicou no slot", index);
            });
        });

        this.buttonCancelar.addEventListener("click", ()=>{
            this.onClickCancelar?.();
        })

        this.buttonOk.addEventListener("click", ()=>{
            this.onClickOk?.();
        })

        /**
         * @type {import("./EventBus.js").EventBus}
         */
        this.eventBus = eventBus || null;
        this.eventBus?.on({
            event: "questAccept", 
            callback: (data) => {
                this.loadQuests(data.quests);
            }
        });
        this.eventBus?.on({
            event: "updateQuest", 
            callback: (data) => {
                this.loadQuests(data.quests);
            }
        });
    }

    setPlayerInfo(player) {
        if (!player) return;

        if (this.playerNameEl) this.playerNameEl.textContent = player.name ?? "-";
        if (this.playerHpEl) this.playerHpEl.textContent = String(player.hp ?? 0);

        if (this.playerPosEl) {
            const x = Number.isFinite(player.x) ? player.x.toFixed(2) : "0.00";
            const y = Number.isFinite(player.y) ? player.y.toFixed(2) : "0.00";
            this.playerPosEl.textContent = `${x}, ${y}`;
        }
        if(this.playerLayerEl){
            this.playerLayerEl.textContent = `${player.sortLayer}`;
        }
        if(this.playerAnimEl){
            this.playerAnimEl.textContent = `${player.state}`;
        }
    }

    showWarning(message, durationMs = 2200) {
        if (!this.warningEl) return;

        this.warningEl.textContent = message;
        this.warningEl.classList.remove("is-hidden");

        if (this.warningTimeoutId) {
            clearTimeout(this.warningTimeoutId);
        }

        //se durationMs for 0 não oculta o aviso.
        if (durationMs > 0) {
            this.warningTimeoutId = setTimeout(() => {
                this.hideWarning();
            }, durationMs);
        }
    }

    hideWarning() {
        if (!this.warningEl) return;

        this.warningEl.classList.add("is-hidden");
        this.warningEl.textContent = "";
    }

    /**
     * 
     * @param {{
     *  speaker: string, 
     *  text: string, 
     *  buttons: {cancelar: ()=>{}, ok: ()=>{}} 
     * }} options 
     * @returns 
     */
    showDialog({ speaker = "Narrador", text = "", buttons= undefined}) {
        if (!this.dialogEl) return;

        if (this.dialogSpeakerEl) this.dialogSpeakerEl.textContent = speaker;
        if (this.dialogTextEl) this.dialogTextEl.textContent = text;
        this.dialogEl.classList.remove("is-hidden");
        this.isDialogOpen = true;

        if(!buttons){
            this.dialogButtonsConteiner.classList.add("is-hidden");
        }else{
            this.dialogButtonsConteiner.classList.remove("is-hidden");
            this.showButtonsDialog();
            this.onClickCancelar = buttons.cancelar;
            this.onClickOk = buttons.ok;
        }
    }

    hideButtonsDialog(){
        this.dialogButtonsConteiner.classList.add("is-hidden");
    }
    showButtonsDialog(){
        this.dialogButtonsConteiner.classList.remove("is-hidden");
    }

    toggleInventory(){
        if(!this.inventoryConteiner) return;
        this.inventoryConteiner.classList.toggle("is-hidden");
    }
    hideInventory(){
        if(!this.inventoryConteiner) return;
        this.inventoryConteiner.classList.add("is-hidden");
    }

    hideDialog() {
        if (!this.dialogEl) return;

        this.dialogEl.classList.add("is-hidden");
        this.isDialogOpen = false;
    }

    toggleDialog(dialogData) {
        if (!this.dialogEl) return;

        if (this.dialogEl.classList.contains("is-hidden")) {
            this.showDialog(dialogData);
            return;
        }

        this.hideDialog();
    }

    /**
     * 
     * @param {import("../engine/Inventory.js").Inventory} inventory 
     * @returns 
     */
    renderInventory(inventory) {
        if (!this.inventorySlots) return;

        inventory.slots.forEach((itemData, index) => {
            const slotEl = this.inventorySlots[index];
            if (!slotEl) return;

            const img = slotEl.querySelector("img");
            const span = slotEl.querySelector("span");

            if (itemData) {
                slotEl.classList.remove("empty");

                img.src = itemData.item.icon;
                img.style.display = "block";

                span.textContent = `x${itemData.quantity}`;
            } else {
                slotEl.classList.add("empty");

                img.src = "";
                img.style.display = "none";

                span.textContent = "";
            }
        });
    }

    /**
     * 
     * @param {import("../engine/Quest/QuestInstance.js").QuestInstance[]} quests 
     */
    loadQuests(quests){
        if(!this.listQuests) return;

        //limpa o conteiner antes de reescrever.
        this.listQuests.querySelectorAll("li").forEach(li=> this.listQuests.removeChild(li));
        console.log(quests);

        quests.forEach((q)=>{
            const newitem = document.createElement("li");
            newitem.textContent = `nome: ${q.data.name} - Objetivo: ${q.data.description} - Cumprido: ${q.progress?.[0]?.current || 0}`;

            this.listQuests.appendChild(newitem);
        })
    }

    toggleQuestUI(){
        if(!this.uiQuestsConteiner) return;
        this.uiQuestsConteiner.classList.toggle("is-hidden")
    }
    showQuestUI(){
        if(!this.uiQuestsConteiner) return;
        this.uiQuestsConteiner.classList.remove("is-hidden")
    }
    hideQuestUI(){
        if(!this.uiQuestsConteiner) return;
        this.uiQuestsConteiner.classList.add("is-hidden")
    }
}
