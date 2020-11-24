/**
 * The initial scene that loads all necessary assets to the game and displays a loading bar.
 */
export declare class BootScene extends Phaser.Scene {
    constructor();
    preload(): void;
    /**
     * All assets that need to be loaded by the game (sprites, images, animations, tiles, music, etc)
     * should be added to this method. Once loaded in, the loader will keep track of them, indepedent of which scene
     * is currently active, so they can be accessed anywhere.
     */
    private loadAssets;
}
