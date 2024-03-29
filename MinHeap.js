class MinHeap {
    /**
     * Keys are integer indexes of the array storage.
     * Values are being organized in the heap.
     */
    constructor() {
        this.keyToValue = [];
        this.valueToKeys = new ValueToKeys();
    }

    insert(value) {
        this.keyToValue.push(value);
        let key = this.keyToValue.length - 1;
        this.valueToKeys.addValueAndKey(value, key);
        this._bubbleUp(key);
    }

    delete(value) {
        let key = this.valueToKeys.getOneKeyFromValue(value);
        if (key === undefined) {
            return;
        }

        let lastKey = this.keyToValue.length - 1;

        if (key === lastKey) {
            this._deleteLastKey();
        } else {
            this._swapValuesOfKeys(key, lastKey);
            this._deleteLastKey();
            this._bubbleUp(key);
            this._bubbleDown(key);
        }
    }

    /**
     * @returns {int | null}
     */
    extractMin() {
        if (!(0 in this.keyToValue)) {
            return null;
        }
        let min = this.keyToValue[0];
        let lastKey = this.keyToValue.length - 1;

        this._swapValuesOfKeys(0, lastKey);
        this._deleteLastKey();
        this._bubbleDown(0);

        return min;
    }

    getMin() {
        if (!(0 in this.keyToValue)) {
            return null;
        }
        return this.keyToValue[0];
    }

    _bubbleUp(key) {
        if (key === 0) {
            return;
        }
        let value = this.keyToValue[key];

        let parentKey = Math.floor((key -1) / 2);
        let parentValue = this.keyToValue[parentKey];

        if (value < parentValue) {
            this._swapValuesOfKeys(key, parentKey);
            this._bubbleUp(parentKey);
        }
    }

    _bubbleDown(key) {
        let value = this.keyToValue[key];

        let minimumKey = key;
        let minimumValue = value;

        let firstChildKey = (key * 2) + 1;
        if (
            (firstChildKey in this.keyToValue) &&
            this.keyToValue[firstChildKey] < minimumValue
        ) {
            minimumKey = firstChildKey;
            minimumValue = this.keyToValue[firstChildKey];
        }

        let secondChildKey = (key * 2) + 2;
        if (
            (secondChildKey in this.keyToValue) &&
            this.keyToValue[secondChildKey] < minimumValue
        ) {
            minimumKey = secondChildKey;
        }


        if (key !== minimumKey) {
            this._swapValuesOfKeys(key, minimumKey);
            this._bubbleDown(minimumKey);
        }
    }

    _deleteLastKey() {
        let lastKey = this.keyToValue.length - 1;
        let lastValue = this.keyToValue[lastKey];

        this.keyToValue.pop();
        this.valueToKeys.deleteValueAndKey(lastValue, lastKey);
    }

    _swapValuesOfKeys(firstKey, secondKey) {
        let firstValue = this.keyToValue[firstKey];
        let secondValue = this.keyToValue[secondKey];

        this.keyToValue[firstKey] = secondValue;
        this.keyToValue[secondKey] = firstValue;

        this.valueToKeys.deleteValueAndKey(firstValue, firstKey);
        this.valueToKeys.deleteValueAndKey(secondValue, secondKey);

        this.valueToKeys.addValueAndKey(firstValue, secondKey);
        this.valueToKeys.addValueAndKey(secondValue, firstKey);
    }
}

class ValueToKeys {
    constructor() {
        this.hashmap = {};
    }

    addValueAndKey(value, key) {
        if (!this.hashmap.hasOwnProperty(value)) {
            this.hashmap[value] = new Map();
            this.hashmap[value].set(key, true);
        } else {
            this.hashmap[value].set(key, true);
        }
    }

    deleteValueAndKey(value, key) {
        this.hashmap[value].delete(key);
    }

    getOneKeyFromValue(value) {
        // the value at the end is the value of the key
        return this.hashmap[value].keys().next().value;
    }
}
