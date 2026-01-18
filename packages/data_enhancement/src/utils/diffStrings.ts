type ChangeType = "equal" | "delete" | "insert";

export interface Change {
    type: ChangeType;
    value: string;
}

export function diffStrings(oldStr: string, newStr: string): Change[] {
    // Find the longest common substring
    function longestCommonSubstring(s1: string, s2: string): string {
        const longest = { start: 0, length: 0 };
        const matrix = new Array(s1.length + 1).fill(null).map(() => new Array(s2.length + 1).fill(0));

        for (let i = 1; i <= s1.length; i++) {
            for (let j = 1; j <= s2.length; j++) {
                if (s1[i - 1] === s2[j - 1]) {
                    matrix[i][j] = matrix[i - 1][j - 1] + 1;
                    if (matrix[i][j] > longest.length) {
                        longest.start = i - matrix[i][j];
                        longest.length = matrix[i][j];
                    }
                }
            }
        }

        return s1.slice(longest.start, longest.start + longest.length);
    }

    // Recursively find changes and create Change objects
    function findChanges(s1: string, s2: string): Change[] {
        if (s1 === s2) return s1.length > 0 ? [{
            type: "equal",
            value: s1
        }] : [];

        const common = longestCommonSubstring(s1, s2);

        if (common.length === 0) {
            const changes: Change[] = [];
            if (s1.length > 0) {
                changes.push({ type: "delete", value: s1 });
            }
            if (s2.length > 0) {
                changes.push({ type: "insert", value: s2 });
            }
            return changes;
        }

        const s1Before = s1.slice(0, s1.indexOf(common));
        const s1After = s1.slice(s1.indexOf(common) + common.length);
        const s2Before = s2.slice(0, s2.indexOf(common));
        const s2After = s2.slice(s2.indexOf(common) + common.length);

        const changesBefore = findChanges(s1Before, s2Before);
        const changesAfter = findChanges(s1After, s2After);

        return [
            ...changesBefore,
            { type: "equal", value: common },
            ...changesAfter
        ];
    }

    return findChanges(oldStr, newStr);
}

