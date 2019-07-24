/**
 * SkipList by galeaspablo, based on William Pugh's paper.
 * See http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.17.524&rep=rep1&type=pdf
 *
 * It is a valid substitute for an order statistics tree
 * See https://www.chiark.greenend.org.uk/~sgtatham/algorithms/cbtree.html
 *
 * I.e. it supports find, insert, delete, findRankOfKey, findByRank.
 */

class Data {
    /**
     * @param {*} data
     */
    constructor(data) {
        this.data = data;
    }
}

class PathElement {
    /**
     * @param {int} level
     * @param {SkipListNode} node
     * @param {int} rank
     */
    constructor(level, node, rank) {
        this.level = level; // bottom is zero
        this.node = node;
        this.rank = rank; // left is -1 (null nodes)
    }
}

class SkipListNode {
    /**
     * @param {null | SkipListNode} down
     * @param {null | SkipListNode} right
     * @param {null | string | int} key
     * @param {null | Data} data
     * @param {int} span
     */
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

    /**
     * @param {string | int} key
     *
     * @return {null | Data}
     */
    find(key) {
        let path = this._findPath(key);

        let bottomRightInPath = path[path.length - 1];
        if (bottomRightInPath.node.right.key === key) {
            return bottomRightInPath.node.right.data;
        }

        return null;
    }

    /**
     * Replaces matching element if it exists.
     *
     * @param {string | int} key
     * @param {Data} data
     */
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

    /**
     * Deletes matching element if it exists.
     *
     * @param {string | int} key
     */
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

    /**
     * Starts at zero.
     *
     * @param {string | int} key
     *
     * @return {int | null}
     */
    findRankOfKey(key) {
        let path = this._findPath(key);

        let bottomRightInPath = path[path.length - 1];
        if (bottomRightInPath.node.right.key === key) {
            return bottomRightInPath.rank + 1;
        }

        return null;
    }

    /**
     * @param {int} rank
     *
     * @return {null | Data}
     */
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

    /**
     * Returns full path, just before the expected position of a key.
     * Order: topLeft to bottomRight.
     *
     * @param {string | int} key
     *
     * @returns {[PathElement]}
     *
     * @private
     */
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

    /**
     * Returns the rightmost nodes of ._findPath
     * Order: topLeft to bottomRight.
     *
     * @param {string | int} key
     * @returns {[PathElement]}
     * @private
     */
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

    /**
     * @param {int} newLevelsCount
     *
     * @private
     */
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

    /**
     * This can be optimized. More than one bit of randomness is being used per boolean.
     *
     * @returns {int}
     */
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

    debug() {
        let print = "";
        let nextDown = this.head;
        while(nextDown instanceof SkipListNode) {
            let nextRight = nextDown;
            while (nextRight instanceof SkipListNode) {
                let span = nextRight.span ? nextRight.span : 'null';
                print = print + "(" + nextRight.key + "," + span + "),";
                nextRight = nextRight.right;
            }

            nextDown = nextDown.down;
            print = print + "\n";
        }

        console.log(print);
    }
}

function test() {
    let skipList = new SkipList();
    let keys = [];
    let notKeys = [];

    for (let x = 101; x < 350000; x = x + 5) {
        skipList.insert(x, new Data(x));
        keys.push(x);
    }

    for (let x = 102; x < 350000; x = x + 5) {
        skipList.insert(x, new Data(x));
        keys.push(x);
    }

    for (let x = 103; x < 350000; x = x + 5) {
        skipList.insert(x, new Data(x));
        skipList.delete(x);
    }

    for (let x = 349999; x > 0; x = x -5) {
        skipList.insert(x, new Data(x));
        keys.push(x);
    }

    for (let x = 100; x < 350000; x = x + 5) {
        notKeys.push(x);
    }

    let sortNumeric = function(a, b) {
        return a -b;
    };

    let sortedKeys = keys.sort(sortNumeric);
    sortedKeys.forEach(function (key, expectedRank) {
        if (
            skipList.find(key) !== null &&
            skipList.find(key).data !== key
        ) {
            throw new Error("ERROR 1 FOR "+key);
        }
        if (skipList.findRankOfKey(key) !== expectedRank) {
            throw new Error("ERROR 2 FOR "+key);
        }
        if (
            skipList.findByRank(expectedRank) !== null &&
            skipList.findByRank(expectedRank).data !== key
        ) {
            throw new Error("ERROR 3 FOR "+key);
        }
    });

    let sortedNotKeys = notKeys.sort(sortNumeric);
    sortedNotKeys.forEach(function (key) {
        if (skipList.find(key) !== null) {
            throw new Error("ERROR 4 FOR "+key);
        }

    });

    console.log("IT WORKS");
}
test();

