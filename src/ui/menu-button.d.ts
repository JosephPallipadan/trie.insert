import * as Phaser from 'phaser';
export declare class MenuButton extends Phaser.GameObjects.Rectangle {
    private label;
    constructor(scene: Phaser.Scene, x: number, y: number, text: string, onClick?: () => void);
    private enterMenuButtonHoverState;
    private enterMenuButtonRestState;
}
