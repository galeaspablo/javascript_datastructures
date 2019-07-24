class Data {
    constructor(data) {
        this.data = data;
    }
}

class PathElement {
    constructor(level, node, rank) {
        this.level = level;
        this.node = node;
        this.rank = rank;
    }
}

class SkipListNode {
    constructor(down, right, key, data, span) {
        this.down = down;
        this.right = right;
        this.key = key;
        this.data = data;
        this.span = span;
    }
}

class SkipList {
    constructor() {
        this.tail = new SkipListNode(
            null,
            null,
            null,
            null,
            0
        );
        this.head = new SkipListNode(
            null,
            this.tail,
            null,
            null,
            1
        );
        this.topRight = this.tail;
        this.levelsCount = 1;
        this.itemsCount = 0;
    }

    find(key) {
        let path = this._findPath(key);

        let bottomRightInPath = path[path.length - 1];
        if (bottomRightInPath.node.right.key === key) {
            return bottomRightInPath.node.right.data;
        }

        return null;
    }

    insert(key, data) {
        let newLevelsCount = SkipList._randomLevel();
        this._addLevelsAccordingToNewLevelsCount(newLevelsCount);

        let insertPath = this._findInsertPath(key);

        let bottomRight = insertPath[insertPath.length - 1];
        if (bottomRight.node.right.key === key) {
            bottomRight.node.right.data = data;
            return;
        }

        let insertingAtRank = bottomRight.rank + 1;
        let lastNode = null;

        insertPath.forEach(function (pathElement) {
            if (pathElement.level < newLevelsCount) {
                let insertedNode = new SkipListNode(
                    null,
                    pathElement.node.right,
                    key,
                    (pathElement.level === 0) ? data : null,
                    (pathElement.node.span + 1) - (insertingAtRank - pathElement.rank)
                );
                pathElement.node.right = insertedNode;
                pathElement.node.span = pathElement.node.span + 1 - insertedNode.span;
                if (lastNode instanceof SkipListNode) {
                    lastNode.down = insertedNode;
                }
                lastNode = insertedNode;
            } else {
                pathElement.node.span = pathElement.node.span + 1;
            }
        });

        this.itemsCount = this.itemsCount + 1;
    }

    delete (key) {
        let insertPath = this._findInsertPath(key);
        insertPath.forEach(function (pathElement) {
            let right = pathElement.node.right;
            if (right.key === key) {
                pathElement.node.span = pathElement.node.span + right.span - 1;
                pathElement.node.right = right.right;
            } else {
                pathElement.node.span = pathElement.node.span - 1;
            }
        });
    }

    findRankOfKey(key) {
        let path = this._findPath(key);

        let bottomRightInPath = path[path.length - 1];
        if (bottomRightInPath.node.right.key === key) {
            return bottomRightInPath.rank + 1;
        }

        return null;
    }

    findByRank(rank) {
        let rankCounter = -1;
        let next = this.head;

        while (rankCounter < rank ) {
            if (
                rankCounter + next.span < rank &&
                next.right.key !== null
            ) {
                rankCounter = rankCounter + next.span;
                next = next.right;
            } else if (
                next.down instanceof SkipListNode
            ) {
                next = next.down;
            } else {
                break;
            }
        }

        if (next.right.key !== null) {
            return next.right.data;
        }
    }

    _findPath(key) {
        let path = [];
        let level = this.levelsCount - 1;
        let rank = -1;
        let next = this.head;

        while (next instanceof SkipListNode) {
            path.push(new PathElement(level, next, rank));
            if (
                next.right.key !== null &&
                next.right.key < key
            ) {
                rank = rank + next.span;
                next = next.right;
            } else if (
                next.down instanceof SkipListNode
            ) {
                next = next.down;
                level--;
            } else {
                break;
            }
        }

        return path;
    }

    _findInsertPath(key) {
        let path = this._findPath(key);
        let insertPath = Array(this.levelsCount);

        path.forEach(function (pathElement) {
            insertPath[pathElement.level] = new PathElement(
                pathElement.level,
                pathElement.node,
                pathElement.rank
            );
        });

        return insertPath.reverse();
    }

    _addLevelsAccordingToNewLevelsCount(newLevelsCount) {
        let numberOfNewLevels = newLevelsCount - this.levelsCount;

        if (numberOfNewLevels <= 0) {
            return;
        }

        for (let i = 0; i < numberOfNewLevels; i++) {
            this.topRight = new SkipListNode(
                this.topRight,
                null,
                null,
                null,
                0
            );
            this.head = new SkipListNode(
                this.head,
                this.topRight,
                null,
                null,
                this.itemsCount + 1
            );
        }

        this.levelsCount = this.levelsCount + numberOfNewLevels;
    }

    static _randomLevel() {
        let level = 1;

        while (
            level <= 32 &&
            Math.random() >= 0.5
            ) {
            level++;
        }

        return level;
    }
}