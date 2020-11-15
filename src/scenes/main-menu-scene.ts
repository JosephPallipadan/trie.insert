import { MenuButton } from '../ui/menu-button';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'MainMenu',
};

/**
 * The initial scene that starts, shows the splash screens, and loads the necessary assets.
 */
export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super(sceneConfig);
  }

  public create(): void {
    this.add
      .text(280, 250, 'Welcome to Trie.Insert(); Click Below to begin.', {
        fill: '#FF0000',
      })
      .setFontSize(48);

    new MenuButton(this, window.innerWidth / 2 - 100, window.innerHeight / 2, 'Start Game', () => {
      this.scene.start('Game');
    });
  }
}
