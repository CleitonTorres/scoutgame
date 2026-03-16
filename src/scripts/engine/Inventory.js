export class Inventory {
    constructor(size = 20){
        this.size = size
        this.slots = []
    }

    addItem(itemData, quantity){
        const slot = this.slots.find(
            s => s.item.id === itemData.id && s.quantity < itemData.maxStack
        )

        if(slot){
            slot.quantity += quantity
            return true
        }

        if(this.slots.length < this.size){
            this.slots.push({
                item: itemData,
                quantity
            })
            return true
        }

        return false
    }
}