type ChangeType = "equal" | "delete" | "insert";

export interface Change {
    type: ChangeType;
    value: string;
}

interface Position {
    x: number;
    y: number;
}

export function diffStrings(oldStr: string, newStr: string): Change[] {
    function shortestEditPath(s1: string, s2: string): Position[][] {
        const n = s1.length;
        const m = s2.length;
        const max = n + m;
        const v: { [key: number]: number } = { 1: 0 };

        const trace: Position[][] = [];

        for (let d = 0; d <= max; d++) {
            trace.push([]);

            for (let k = -d; k <= d; k += 2) {
                let x = k === -d || (k !== d && v[k - 1] < v[k + 1]) ? v[k + 1] : v[k - 1] + 1;
                let y = x - k;

                while (x < n && y < m && s1[x] === s2[y]) {
                    x++;
                    y++;
                }

                v[k] = x;
                trace[d].push({ x, y });

                if (x >= n && y >= m) {
                    return trace;
                }
            }
        }
        return trace;
    }

// Backtrack the edit path and create Change objects
    function backtrack(trace: Position[][], s1: string, s2: string): Change[] {
        const result: Change[] = [];
        let x = s1.length;
        let y = s2.length;

        for (let d = trace.length - 1; d >= 0; d--) {
            const positions = trace[d];
            const k = x - y;
            const index = positions.findIndex((p) => p.x - p.y === k);
            const position = positions[index];

            const prevK = position.x === position.y ? k - 1 : k;

            const prevIndex = trace[d - 1]?.findIndex((p) => p.x - p.y === prevK);
            const prevPosition = trace[d - 1]?.[prevIndex] || { x: 0, y: 0 };

            while (x > position.x && y > position.y) {
                result.push({ type: "equal", value: s1[x - 1] });
                x--;
                y--;
            }

            if (d === 0) break; // Prevent accessing undefined trace[-1]

            if (position.x > prevPosition.x && position.y === prevPosition.y) {
                result.push({ type: "delete", value: s1.slice(prevPosition.x, position.x) });
            } else if (position.x === prevPosition.x && position.y > prevPosition.y) {
                result.push({ type: "insert", value: s2.slice(prevPosition.y, position.y) });
            }

            x = prevPosition.x;
            y = prevPosition.y;
        }

        return result.reverse();
    }

    const trace = shortestEditPath(oldStr, newStr);
    return backtrack(trace, oldStr, newStr);
}

//
// export function diffStrings(oldStr: string, newStr: string): Change[] {
//     // Find the longest common substring
//     function longestCommonSubstring(s1: string, s2: string): string {
//         const longest = { start: 0, length: 0 };
//         const matrix = new Array(s1.length + 1).fill(null).map(() => new Array(s2.length + 1).fill(0));
//
//         for (let i = 1; i <= s1.length; i++) {
//             for (let j = 1; j <= s2.length; j++) {
//                 if (s1[i - 1] === s2[j - 1]) {
//                     matrix[i][j] = matrix[i - 1][j - 1] + 1;
//                     if (matrix[i][j] > longest.length) {
//                         longest.start = i - matrix[i][j];
//                         longest.length = matrix[i][j];
//                     }
//                 }
//             }
//         }
//
//         return s1.slice(longest.start, longest.start + longest.length);
//     }
//
//     // Recursively find changes and create Change objects
//     function findChanges(s1: string, s2: string): Change[] {
//         if (s1 === s2) return s1.length > 0 ? [{
//             type: "equal",
//             value: s1
//         }] : [];
//
//         const common = longestCommonSubstring(s1, s2);
//
//         if (common.length === 0) {
//             const changes: Change[] = [];
//             if (s1.length > 0) {
//                 changes.push({ type: "delete", value: s1 });
//             }
//             if (s2.length > 0) {
//                 changes.push({ type: "insert", value: s2 });
//             }
//             return changes;
//         }
//
//         const s1Before = s1.slice(0, s1.indexOf(common));
//         const s1After = s1.slice(s1.indexOf(common) + common.length);
//         const s2Before = s2.slice(0, s2.indexOf(common));
//         const s2After = s2.slice(s2.indexOf(common) + common.length);
//
//         const changesBefore = findChanges(s1Before, s2Before);
//         const changesAfter = findChanges(s1After, s2After);
//
//         // Merge adjacent delete and insert changes
//         if (
//             changesBefore.length > 0 &&
//             changesAfter.length > 0 &&
//             changesBefore[changesBefore.length - 1].type === "delete" &&
//             changesAfter[0].type === "insert"
//         ) {
//             changesBefore[changesBefore.length - 1].value += changesAfter[0].value;
//             changesAfter.shift();
//         }
//
//         return [
//             ...changesBefore,
//             { type: "equal", value: common },
//             ...changesAfter
//         ];
//     }
//
//     return findChanges(oldStr, newStr);
// }
