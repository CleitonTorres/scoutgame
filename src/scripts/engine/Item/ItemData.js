export class ItemData {
    constructor({
        id,
        name,
        description = "",
        stackable = false,
        maxStack = 1,
        type = "generic",
        icon = null,
        onUse = null
    }) {
        this.id = id;
        this.name = name;
        this.description = description;

        this.stackable = stackable;
        this.maxStack = maxStack;

        this.type = type;
        this.icon = icon;

        this.onUse = onUse; //função executada na coleta.
    }
}