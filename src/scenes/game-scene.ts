import { Input } from 'phaser';
import { getGameWidth, getGameHeight } from '../helpers';
import { TrieNode } from '../TrieNode';

const Vector2 = Phaser.Math.Vector2;
let InTestMode = true;

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

export class GameScene extends Phaser.Scene {
  root: TrieNode;
  reached = true;
  wordIndex = 0;
  index = 0;
  runner: TrieNode;

  playerPointer: TrieNode;
  playerPointerChildIndex = 0;
  childChoices: TrieNode[];

  currentWord: Phaser.GameObjects.Text;
  currentLetter: Phaser.GameObjects.Text;
  scoreText: Phaser.GameObjects.Text;
  highScoreText: Phaser.GameObjects.Text;

  shiftKey: Input.Keyboard.Key;

  score = 0;
  highScore = parseInt(localStorage.getItem('hs')) || 0;
  lastAddTime: number;

  correct: Phaser.Sound.BaseSound;
  wrong: Phaser.Sound.BaseSound;
  move: Phaser.Sound.BaseSound;

  constructor() {
    super(sceneConfig);
  }

  setupAudio(): void {
    this.correct = this.sound.add('correct');
    this.wrong = this.sound.add('wrong');
    this.move = this.sound.add('move');
  }

  setupAnimations(): void {
    this.anims.create({
      key: 'idle-start',
      frames: this.anims.generateFrameNumbers('node-sprites', { start: 0, end: 16 }),
      frameRate: 10,
      repeat: 0,
    });

    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('node-sprites', { start: 17, end: 26 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'parent-start',
      frames: this.anims.generateFrameNumbers('node-sprites', { start: 27, end: 32 }),
      frameRate: 10,
      repeat: 0,
    });

    this.anims.create({
      key: 'parent',
      frames: this.anims.generateFrameNumbers('node-sprites', { start: 33, end: 37 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'sans',
      frames: this.anims.generateFrameNumbers('node-sprites', { start: 39, end: 83 }),
      frameRate: 15,
      repeat: 0,
    });

    this.anims.create({
      key: 'eyes',
      frames: this.anims.generateFrameNumbers('node-sprites', { start: 84, end: 87 }),
      frameRate: 8,
      repeat: -1,
    });
  }

  doTrieInitTasks(): void {
    this.root = new TrieNode('0', this.add.sprite(getGameWidth(this) / 2, getGameHeight(this) / 6, 'node'));
    this.root.gameObject.play('sans').once('animationcomplete', () => {
      this.root.gameObject.play('eyes');
    });
    this.root.text = this.add.text(this.root.gameObject.x, this.root.gameObject.y, '', {
      fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
    });
    this.runner = this.root;
    this.playerPointer = this.root;
    InTestMode = !!localStorage.getItem('Test Mode');
  }

  setupHud(): void {
    if (localStorage.getItem('words')) {
      this.words = localStorage.getItem('words').split(',');
    }

    this.currentWord = this.add.text(1650, 30, `Current Word: ${this.words[0]}`, {
      fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
    });

    this.currentLetter = this.add.text(1650, 60, `Current Letter: ${this.words[0][0]} at position 0`, {
      fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
    });

    this.scoreText = this.add.text(1650, 90, `Score: ${this.score}`, {
      fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
    });

    this.highScoreText = this.add.text(1650, 120, `High Score: ${this.highScore}`, {
      fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
    });

    this.currentWord.setScrollFactor(0);
    this.currentLetter.setScrollFactor(0);
    this.scoreText.setScrollFactor(0);
    this.highScoreText.setScrollFactor(0);

    this.currentLetter.setDepth(2);
    this.currentWord.setDepth(2);
    this.scoreText.setDepth(2);
    this.highScoreText.setDepth(2);
  }

  setChildLineColor(isParent: boolean): void {
    if (this.childChoices.length > 0) {
      this.playerPointer.lines[this.childChoices[this.playerPointerChildIndex].val].strokeColor = isParent
        ? 0x00ff00
        : 0xff0000;
    }
  }

  setChildChoices(): void {
    this.childChoices = Object.values(this.playerPointer.children);
    this.childChoices.sort((a, b) => {
      return a.gameObject.x <= b.gameObject.x ? -1 : 1;
    });
    Object.values(this.playerPointer.lines).forEach((line) => {
      line.strokeColor = 0xff0000;
    });
  }

  setupInputHandlers(): void {
    this.input.keyboard.on('keydown_W', () => {
      if (!this.playerPointer.parent) {
        return;
      }
      this.setChildLineColor(false);
      this.playerPointer.deactivateParentMode();
      this.playerPointer = this.playerPointer.parent;
      this.setChildChoices();
      this.playerPointerChildIndex = 0;
      this.playerPointer.activateParentMode();
      this.setChildLineColor(true);
      this.move.play();
    });

    this.input.keyboard.on('keydown_A', () => {
      this.setChildLineColor(false);
      if (this.playerPointerChildIndex == 0) {
        this.playerPointerChildIndex = this.childChoices.length - 1;
      } else {
        this.playerPointerChildIndex--;
      }
      this.setChildLineColor(true);
      this.move.play();
    });

    this.input.keyboard.on('keydown_S', () => {
      if (this.childChoices.length == 0) {
        return;
      }

      this.setChildLineColor(false);
      this.playerPointer.deactivateParentMode();
      this.playerPointer = this.childChoices[this.playerPointerChildIndex];
      this.setChildChoices();
      this.playerPointerChildIndex = 0;
      this.playerPointer.activateParentMode();
      this.setChildLineColor(true);
      this.move.play();
    });

    this.input.keyboard.on('keydown_D', () => {
      this.setChildLineColor(false);
      if (this.playerPointerChildIndex == this.childChoices.length - 1) {
        this.playerPointerChildIndex = 0;
      } else {
        this.playerPointerChildIndex++;
      }
      this.setChildLineColor(true);
      this.move.play();
    });

    this.input.keyboard.on('keydown_Z', () => {
      this.cameras.main.zoom -= 0.1;
    });

    this.input.keyboard.on('keydown_X', () => {
      this.cameras.main.zoom += 0.1;
    });

    this.input.keyboard.on('keydown_H', () => {
      this.highScoreText.visible = !this.scoreText.visible;
      this.currentLetter.visible = !this.scoreText.visible;
      this.currentWord.visible = !this.scoreText.visible;
      this.scoreText.visible = !this.scoreText.visible;
    });

    this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.shiftKey.addListener('down', () => {
      this.addNextLetter();
    });
  }

  addNextLetter(): void {
    this.reached = false;
    let char = this.words[this.wordIndex][this.index];

    // Traverse trie till insertion point reached
    while (this.index < this.words[this.wordIndex].length && this.runner.children.hasOwnProperty(char)) {
      this.runner = this.runner.children[char];
      char = this.words[this.wordIndex][++this.index];
    }

    // Make sure an insertion point was actually reached (didn't just reach the end of the word)
    if (this.index < this.words[this.wordIndex].length) {
      if (this.runner == this.playerPointer || InTestMode) {
        this.runner = this.runner.addChild(char, this);
        this.index++;
        this.correct.play();
        this.score += (3 * 1000) / (Date.now() - this.lastAddTime);
        this.score = Math.ceil(this.score);
        if (this.score > this.highScore) {
          localStorage.setItem('hs', this.score.toString());
          this.highScore = this.score;
        }
      } else {
        this.wrong.play();
        this.score -= (3 * 1000) / (Date.now() - this.lastAddTime);
        this.score = Math.floor(this.score);
      }
      this.scoreText.text = `Score: ${this.score}`;
      this.highScoreText.text = `High Score: ${this.highScore}`;
    }

    this.setChildChoices();
    this.playerPointerChildIndex = 0;
    this.setChildLineColor(true);

    if (this.index == this.words[this.wordIndex].length) {
      this.wordIndex++;
      this.index = 0;
      this.runner = this.root;
    }

    this.currentWord.text = `Current Word: ${this.words[this.wordIndex]}`;
    this.currentLetter.text = `Current Letter: ${this.words[this.wordIndex][this.index]} at position ${this.index}`;
  }

  public create(): void {
    this.setupAudio();
    this.setupAnimations();
    this.doTrieInitTasks();
    this.setupHud();
    this.setupInputHandlers();
    this.lastAddTime = Date.now();
    // setInterval(() => {
    //   if (this.wordIndex < this.words.length) this.addNextLetter();
    // }, 1000);
  }

  public update(): void {
    this.root.update();
    const camera = this.cameras.main;
    const currPos = new Phaser.Math.Vector2(camera.scrollX, camera.scrollY);
    const destination = new Vector2(
      this.playerPointer.gameObject.x - getGameWidth(this) / 2,
      this.playerPointer.gameObject.y - getGameHeight(this) / 2,
    );
    const newPosition = currPos.lerp(destination, 0.05);
    if (newPosition.fuzzyEquals(destination, 0.001)) {
      this.reached = true;
    }
    camera.setScroll(newPosition.x, newPosition.y);
  }

  words: string[] = [
    'ceromanus',
    'bromanus',
    'rubicon',
    'ceromane',
    'borubicon',
    'cromulus',
    'berubicundus',
    'coromane',
    'cerubicundus',
    'caromanus',
    'crubens',
    'arubicon',
    'baromulus',
    'crubicundus',
    'berubicon',
    'aromanus',
    'orubens',
    'corubicundus',
    'barubicon',
    'arubens',
    'eromulus',
    'coruber',
    'orubicon',
    'corubicon',
    'romulus',
    'orubicundus',
    'aromulus',
    'cromane',
    'barubicundus',
    'caromulus',
    'oromane',
    'cerubens',
    'aruber',
    'rubens',
    'bromulus',
    'caromane',
    'baromane',
    'oromanus',
    'erubicundus',
    'eromanus',
    'aromane',
    'carubicundus',
    'eruber',
    'bromane',
    'crubicon',
    'rubicundus',
    'coromanus',
    'caruber',
    'baromanus',
    'oromulus',
    'beromanus',
    'beromane',
    'coromulus',
    'ceromulus',
    'brubicundus',
    'cromanus',
    'eromane',
    'erubens',
    'borubens',
    'erubicon',
    'arubicundus',
    'borubicundus',
    'boromane',
    'carubicon',
    'corubens',
    'bruber',
    'ruber',
    'romane',
    'boruber',
    'baruber',
    'beruber',
    'beromulus',
    'berubens',
    'boromanus',
    'brubens',
    'cerubicon',
    'barubens',
    'boromulus',
    'cruber',
    'oruber',
    'brubicon',
    'ceruber',
    'carubens',
    'romanus',
  ];
}
