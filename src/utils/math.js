export function distance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

export function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

export function distToSegment(px, py, ax, ay, bx, by) {
    const abx = bx - ax;
    const aby = by - ay;
    const apx = px - ax;
    const apy = py - ay;
    const abLenSq = abx * abx + aby * aby;
    if (abLenSq === 0) return Math.hypot(apx, apy);
    let t = (apx * abx + apy * aby) / abLenSq;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (ax + t * abx), py - (ay + t * aby));
}

export function isSegmentHorizontal(nodeKey1, nodeKey2, wp) {
    if (!nodeKey1 || !nodeKey2 || !wp || !wp[nodeKey1] || !wp[nodeKey2]) return true;
    return Math.abs(wp[nodeKey1].y - wp[nodeKey2].y) <= 15;
}

export function hasArrivedAtNode(enemy, fromNode, toNode, wp) {
    if (!toNode || !wp || !wp[toNode]) return false;
    const to = wp[toNode];
    const from = fromNode && wp[fromNode] ? wp[fromNode] : null;

    if (!from || isSegmentHorizontal(fromNode, toNode, wp)) {
        return Math.abs(to.x - enemy.body.body.center.x) <= 10;
    } else {
        const movingUp = to.y < from.y;
        if (movingUp) {
            return enemy.body.y <= to.y - 12;
        } else {
            return enemy.body.y >= to.y - 6 || (enemy.body.body && enemy.body.body.blocked.down);
        }
    }
}

export function dijkstra(startKey, targetKey, wp) {
    if (!wp || !wp[startKey] || !wp[targetKey]) return { path: [], distance: Infinity };
    if (startKey === targetKey) return { path: [startKey], distance: 0 };
    const distances = {};
    const previous = {};
    const unvisited = new Set(Object.keys(wp));
    for (const key of unvisited) distances[key] = Infinity;
    distances[startKey] = 0;

    while (unvisited.size > 0) {
        let curr = null;
        let smallestDist = Infinity;
        for (const node of unvisited) {
            if (distances[node] < smallestDist) {
                smallestDist = distances[node];
                curr = node;
            }
        }
        if (!curr || distances[curr] === Infinity || curr === targetKey) break;
        unvisited.delete(curr);

        const nodeData = wp[curr];
        if (!nodeData || !nodeData.connections) continue;
        for (const neighbor of nodeData.connections) {
            if (!unvisited.has(neighbor)) continue;
            const nData = wp[neighbor];
            const weight = Math.hypot(nData.x - nodeData.x, nData.y - nodeData.y);
            const alt = distances[curr] + weight;
            if (alt < distances[neighbor]) {
                distances[neighbor] = alt;
                previous[neighbor] = curr;
            }
        }
    }

    const path = [];
    let curr = targetKey;
    while (curr) {
        path.unshift(curr);
        curr = previous[curr];
    }
    return {
        path: path[0] === startKey ? path : [],
        distance: distances[targetKey]
    };
}

export function getCurrentEdge(eX, eY, wp) {
    if (!wp) return null;
    let bestEdge = null;
    let minEdgeDist = Infinity;
    const visited = new Set();
    for (const [key, node] of Object.entries(wp)) {
        for (const conn of node.connections) {
            const edgeKey = [key, conn].sort().join("-");
            if (visited.has(edgeKey)) continue;
            visited.add(edgeKey);
            const other = wp[conn];
            const d = distToSegment(eX, eY, node.x, node.y, other.x, other.y);
            if (d < minEdgeDist) {
                minEdgeDist = d;
                bestEdge = [key, conn];
            }
        }
    }
    return bestEdge;
}

export function getClosestNode(x, y, wp) {
    if (!wp) return null;
    let closestKey = null;
    let minDist = Infinity;
    for (const [key, node] of Object.entries(wp)) {
        const d = Math.hypot(node.x - x, node.y - y);
        if (d < minDist) {
            minDist = d;
            closestKey = key;
        }
    }
    return closestKey;
}

export function checkDirectChase(eX, eY, pX, pY, corridors) {
    if (!corridors) return null;
    const tol = 25;
    for (const corr of corridors) {
        if (corr.type === "horizontal") {
            if (Math.abs(eY - corr.y) <= tol && Math.abs(pY - corr.y) <= tol &&
                eX >= corr.minX - tol && eX <= corr.maxX + tol &&
                pX >= corr.minX - tol && pX <= corr.maxX + tol) {
                return { type: "horizontal", targetX: pX, targetY: corr.y };
            }
        } else if (corr.type === "vertical") {
            if (Math.abs(eX - corr.x) <= tol && Math.abs(pX - corr.x) <= tol &&
                eY >= corr.minY - tol && eY <= corr.maxY + tol &&
                pY >= corr.minY - tol && pY <= corr.maxY + tol) {
                return { type: "vertical", targetX: corr.x, targetY: pY };
            }
        }
    }
    return null;
}

export function getBestNextNode(eX, originY, playerTargetKey, wp) {
    if (!wp) return { fromNode: playerTargetKey, targetNode: playerTargetKey };
    for (const [key, node] of Object.entries(wp)) {
        if (Math.hypot(node.x - eX, node.y - originY) <= 16) {
            if (key === playerTargetKey) return { fromNode: key, targetNode: key };
            const { path } = dijkstra(key, playerTargetKey, wp);
            return {
                fromNode: key,
                targetNode: (path && path.length > 1) ? path[1] : key
            };
        }
    }

    const edge = getCurrentEdge(eX, originY, wp);
    if (!edge) return { fromNode: playerTargetKey, targetNode: playerTargetKey };

    let bestNode = null;
    let otherNode = null;
    let minTotal = Infinity;
    for (const nodeKey of edge) {
        const node = wp[nodeKey];
        const dist = Math.hypot(node.x - eX, node.y - originY);
        const { distance: pathCost } = dijkstra(nodeKey, playerTargetKey, wp);
        const total = dist + pathCost;
        if (total < minTotal) {
            minTotal = total;
            bestNode = nodeKey;
            otherNode = (edge[0] === nodeKey) ? edge[1] : edge[0];
        }
    }
    return { fromNode: otherNode, targetNode: bestNode };
}

