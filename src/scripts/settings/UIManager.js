import { typesProgQuest } from "./typesProgressQuest.js";

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
        this.listQuests = document.getElementById("list-quests-in");
        this.listQuestsFinish = document.getElementById("list-quests-finish");
        this.hudQuestInProg = document.getElementById("ui-hud-quests-in");
        this.hudQuestComp = document.getElementById("ui-hud-quests-complete");
        this.btnToggleQuestUI = document.getElementById("btnToggleQuestUI");

        // --- ELEMENTOS DE DEBUG ---
        this.toggleFogEl = document.getElementById("toggle-fog");
        this.toggleHitboxEl = document.getElementById("toggle-hitbox");
        this.toggleCameraEl = document.getElementById("toggle-camera");
        this.toggleCollidersEl = document.getElementById("toggle-collider");

        this.isDialogOpen = false;
        this.dialogEl = document.getElementById("ui-dialog");
        this.dialogSpeakerEl = document.getElementById("ui-dialog-speaker");
        this.dialogTextEl = document.getElementById("ui-dialog-text");
        
        this.dialogButtonsConteiner = document.getElementById("ui-conteiner-button-dialog");
        this.buttonCancelar = document.getElementById("button-cancelar");
        this.buttonOk = document.getElementById("button-ok");

        // --- SELEÇÃO DE DIÁLOGO ---
        this.selectedButtonIndex = 0; // 0: Cancelar, 1: Ok
        this.hasButtons = false;

        this.onClickCancelar = null;
        this.onClickOk = null;
        this.warningTimeoutId = null;

        this._initListeners();

        /**
         * Porque usar o eventBus, o UIManager não precisa conhecer os detalhes internos da Camera ou do Game. 
         * Ele apenas "grita" para o sistema: "Ei, alguém quer ligar o Fog!", e o componente 
         * responsável (o Game) escuta e executa a ação. Isso deixa seu código muito mais limpo e 
         * fácil de expandir!
         * @type {import("./EventBus.js").EventBus}
         */
        this.eventBus = eventBus || null;
        this._initEventBusListeners();
    }

    _initListeners() {
        this.inventorySlots.forEach((slot, index) => {
            slot.addEventListener("click", () => {
                console.log("clicou no slot", index);
            });
        });

        this.buttonCancelar.addEventListener("click", ()=>{
            this.onClickCancelar?.();
        });

        this.buttonOk.addEventListener("click", ()=>{
            this.onClickOk?.();
        });

        this.btnToggleQuestUI.addEventListener("click",()=>{
            this.toggleHUDQuests();
        });

        // --- LISTENERS DE DEBUG ---
        // Quando o checkbox mudar, avisamos o jogo via EventBus
        this.toggleFogEl?.addEventListener("change", (e) => {
            this.eventBus?.emit({
                event: "toggleDebug", 
                payload: { type: "fog", value: e.target.checked }
            });
        });

        this.toggleHitboxEl?.addEventListener("change", (e) => {
            this.eventBus?.emit({
                event: "toggleDebug", 
                payload: { type: "hitbox", value: e.target.checked }
            });
        });

        this.toggleCameraEl?.addEventListener("change", (e) => {
            this.eventBus?.emit({
                event: "toggleDebug", payload: { type: "camera", value: e.target.checked }
            });
        });

        this.toggleCollidersEl?.addEventListener("change", (e) => {
            this.eventBus?.emit({
                event: "toggleDebug", payload: { type: "collider", value: e.target.checked }
            });
        });
    }

    _initEventBusListeners() {
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

        this.eventBus?.on({
            event: "itemCollected",
            callback: (data) => {
                this.renderInventory(data.inventory);
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

    showDialog({ speaker = "Narrador", text = "", buttons= undefined}) {
        if (!this.dialogEl) return;

        if (this.dialogSpeakerEl) this.dialogSpeakerEl.textContent = speaker;
        if (this.dialogTextEl) this.dialogTextEl.textContent = text;
        this.dialogEl.classList.remove("is-hidden");
        this.isDialogOpen = true;

        if(!buttons){
            this.dialogButtonsConteiner.classList.add("is-hidden");
            this.hasButtons = false;
        }else{
            this.dialogButtonsConteiner.classList.remove("is-hidden");
            this.showButtonsDialog();
            this.onClickCancelar = buttons.cancelar;
            this.onClickOk = buttons.ok;
            this.hasButtons = true;

            // Reseta a seleção para o botão "Ok" (índice 1) por padrão
            this.selectedButtonIndex = 1;
            this._updateButtonVisuals();
        }
    }

    /**
     * Navega entre os botões do diálogo (Esquerda/Direita).
     * @param {number} direction -1 para esquerda, 1 para direita.
     */
    navigateDialog(direction) {
        if (!this.isDialogOpen || !this.hasButtons) return;

        // Alterna entre 0 e 1
        this.selectedButtonIndex = (this.selectedButtonIndex === 0) ? 1 : 0;
        this._updateButtonVisuals();
    }

    /**
     * Para o GAMEPAD - Executa a ação do botão selecionado.
     */
    confirmSelection() {
        if (!this.isDialogOpen) return;

        if (this.hasButtons) {
            if (this.selectedButtonIndex === 0) {
                this.onClickCancelar?.();
            } else {
                this.onClickOk?.();
            }
        } else {
            // Se não houver botões, apenas fecha o diálogo (comportamento padrão)
            this.hideDialog();
        }
    }

     /**
     * Atualiza a aparência visual dos botões para mostrar qual está selecionado.
     */
    _updateButtonVisuals() {
        if (!this.buttonCancelar || !this.buttonOk) return;

        // Remove a classe de foco de ambos
        this.buttonCancelar.classList.remove("is-selected");
        this.buttonOk.classList.remove("is-selected");

        // Adiciona no selecionado
        if (this.selectedButtonIndex === 0) {
            this.buttonCancelar.classList.add("is-selected");
        } else {
            this.buttonOk.classList.add("is-selected");
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
        if(!inventory) return;
        if (!this.inventorySlots) return;

        inventory.slots.forEach((itemData, index) => {
            const slotEl = this.inventorySlots[index];
            if (!slotEl) return;

            const img = slotEl.querySelector("img");
            const span = slotEl.querySelector("span");

            if (itemData) {
                slotEl.classList.remove("empty");
                img.src = itemData.item?.icon?.src ?? "";
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

    loadQuests(quests){
        if(!this.listQuests) return;

        this.listQuests.querySelectorAll("li").forEach(li=> this.listQuests.removeChild(li));

        quests.forEach((q)=>{
            const newitem = document.createElement("li");
            const resolveProgresso = q.status === typesProgQuest.IN_PROGRESS ? "em andamento" : "Completa";
            newitem.textContent = `nome: ${q.data.name} - Objetivo: ${q.data.description} - Obtido: ${q.progress?.[0]?.current || 0} - Status: ${resolveProgresso}`;

            if(q.status === typesProgQuest.COMPLETED){
                this.listQuestsFinish.appendChild(newitem);
            }else{
                this.listQuests.appendChild(newitem);
            }
        });
    }

    toggleQuestUI(){
        if(!this.uiQuestsConteiner) return;
        this.uiQuestsConteiner.classList.toggle("is-hidden");
    }
    showQuestUI(){
        if(!this.uiQuestsConteiner) return;
        this.uiQuestsConteiner.classList.remove("is-hidden");
    }
    hideQuestUI(){
        if(!this.uiQuestsConteiner) return;
        this.uiQuestsConteiner.classList.add("is-hidden");
    }
    toggleHUDQuests(){
        this.hudQuestComp.classList.toggle("is-hidden");
        this.hudQuestInProg.classList.toggle("is-hidden");
    }

    hideAll(){
        this.hideQuestUI();
        this.hideDialog();
        this.hideInventory();
        this.hideWarning();
    }
}