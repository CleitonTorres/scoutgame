export class UIManager {
    constructor() {
        this.playerNameEl = document.getElementById("ui-player-name");
        this.playerHpEl = document.getElementById("ui-player-hp");
        this.playerPosEl = document.getElementById("ui-player-pos");
        this.playerLayerEl = document.getElementById("ui-player-layer");

        this.warningEl = document.getElementById("ui-warning");

        this.dialogEl = document.getElementById("ui-dialog");
        this.dialogSpeakerEl = document.getElementById("ui-dialog-speaker");
        this.dialogTextEl = document.getElementById("ui-dialog-text");
        
        this.warningTimeoutId = null;
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

    showDialog({ speaker = "Narrador", text = "" } = {}) {
        if (!this.dialogEl) return;

        if (this.dialogSpeakerEl) this.dialogSpeakerEl.textContent = speaker;
        if (this.dialogTextEl) this.dialogTextEl.textContent = text;
        this.dialogEl.classList.remove("is-hidden");
    }

    hideDialog() {
        if (!this.dialogEl) return;

        this.dialogEl.classList.add("is-hidden");
    }

    toggleDialog(dialogData) {
        if (!this.dialogEl) return;

        if (this.dialogEl.classList.contains("is-hidden")) {
            this.showDialog(dialogData);
            return;
        }

        this.hideDialog();
    }
}
