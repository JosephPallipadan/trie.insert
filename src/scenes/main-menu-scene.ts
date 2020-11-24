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

    this.add
      .text(560, 350, 'W A S D - Movement | Shift - Add Node', {
        fill: '#FF0000',
      })
      .setFontSize(36);

    this.add
      .text(400, 600, 'Press C To Input Custom Words | Press X To Clear Custom Inputs', {
        fill: '#FF0000',
      })
      .setFontSize(30);

    new MenuButton(this, window.innerWidth / 2 - 100, window.innerHeight / 2, 'Start Game', () => {
      this.scene.start('Game');
    });

    this.input.keyboard.on('keydown_C', () => {
      const words = prompt('Enter a comma separated list of words');
      localStorage.setItem('words', words);
    });

    this.input.keyboard.on('keydown_X', () => {
      localStorage.removeItem('words');
    });

    this.input.keyboard.on('keydown_T', () => {
      localStorage.setItem('Test Mode', 'true');
    });

    this.input.keyboard.on('keydown_Y', () => {
      localStorage.removeItem('Test Mode');
    });
  }
}
