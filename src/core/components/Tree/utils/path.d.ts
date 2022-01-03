import { Path } from '../types';
export declare const isSamePath: (a: Path, b: Path) => boolean;
export declare const hasSameParent: (a: Path, b: Path) => boolean;
export declare const getParentPath: (child: Path) => Path;
export declare const isTopOfSubtree: (belowPath: Path, abovePath?: Path | undefined) => boolean;
export declare const getIndexAmongSiblings: (path: Path) => number;
export declare const getPathOnLevel: (path: Path, level: number) => Path;
export declare const moveAfterPath: (after: Path, from: Path) => Path;
export declare const isLowerSibling: (a: Path, other: Path) => boolean;
