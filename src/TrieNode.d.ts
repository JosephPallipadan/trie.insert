interface ECONode {
    XPosition: number;
    YPosition: number;
}
export declare class TrieNode {
    val: string;
    children: Record<string, TrieNode>;
    root: TrieNode;
    parent: TrieNode;
    id: number;
    actual: ECONode;
    text: Phaser.GameObjects.Text;
    lines: Record<string, Phaser.GameObjects.Line>;
    gameObject: Phaser.GameObjects.Sprite;
    moveTo: Phaser.Math.Vector2;
    scaler: number;
    scaleDirection: number;
    constructor(val: string, gameObject: Phaser.GameObjects.Sprite, parent?: TrieNode);
    setMoveTo(): void;
    addChild(val: string, scene: Phaser.Scene): TrieNode;
    update(): void;
    activateParentMode(): void;
    deactivateParentMode(): void;
}
export {};
