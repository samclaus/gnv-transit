// TODO: all of this code is ripped straight from Agafonkin's rbush-knn repo because
// the package is out of date and didn't work with Vite or something--need to investigate

import Queue from 'tinyqueue';
import type RBush from 'rbush';

interface BBox {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

export default function knn<T>(
    tree: RBush<T>,
    x: number,
    y: number,
    n?: number,
    predicate?: (item: T) => unknown,
    maxDistance?: number,
): T[] {
    var node = (tree as any).data,
        result = [],
        toBBox = tree.toBBox,
        i, child, dist, candidate;

    var queue = new Queue(undefined, compareDist);

    while (node) {
        for (i = 0; i < node.children.length; i++) {
            child = node.children[i];
            dist = boxDist(x, y, node.leaf ? toBBox(child) : child);
            if (!maxDistance || dist <= maxDistance * maxDistance) {
                queue.push({
                    node: child,
                    isItem: node.leaf,
                    dist: dist
                });
            }
        }

        while (queue.length && queue.peek().isItem) {
            candidate = queue.pop().node;
            if (!predicate || predicate(candidate))
                result.push(candidate);
            if (n && result.length === n) return result;
        }

        node = queue.pop();
        if (node) node = node.node;
    }

    return result;
}

function compareDist(a: any, b: any): any {
    return a.dist - b.dist;
}

function boxDist(x: number, y: number, box: BBox): number {
    var dx = axisDist(x, box.minX, box.maxX),
        dy = axisDist(y, box.minY, box.maxY);
    return dx * dx + dy * dy;
}

function axisDist(k: number, min: number, max: number): number {
    return k < min ? min - k : k <= max ? 0 : k - max;
}
