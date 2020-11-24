import ECOTree from './ECOTree.js';

const Vector2 = Phaser.Math.Vector2;

let idTracker = 1;

const actualTree = new ECOTree('myTree', 'bla');
actualTree.add(0, -1, 'Apex Node');

interface ECONode {
  XPosition: number;
  YPosition: number;
}

export class TrieNode {
  val: string;
  children: Record<string, TrieNode>;
  root: TrieNode;
  parent: TrieNode;

  id: number;
  actual: ECONode;

  text: Phaser.GameObjects.Text;
  lines: Record<string, Phaser.GameObjects.Line>; // Line from this object to child corresponding to letter
  gameObject: Phaser.GameObjects.Sprite;
  moveTo: Phaser.Math.Vector2;

  scaler = 1;
  scaleDirection = 1;

  constructor(val: string, gameObject: Phaser.GameObjects.Sprite, parent: TrieNode = null) {
    this.val = val;
    this.gameObject = gameObject;
    this.children = {};
    this.lines = {};
    this.moveTo = new Vector2(gameObject.x, gameObject.y);
    this.parent = parent;
    this.id = idTracker++;
    this.root = val == '0' || val == '' ? this : parent.root;

    this.actual = actualTree.add(this.id, parent?.id || 0);
    actualTree._positionTree();

    gameObject.setDepth(1);
    gameObject.play('idle-start').once('animationcomplete', () => {
      this.gameObject.play('idle');
    });
  }

  setMoveTo(): void {
    this.moveTo.x = this.actual.XPosition;
    this.moveTo.y = this.actual.YPosition;

    Object.values(this.children).forEach((child) => {
      child.setMoveTo();
    });
  }

  addChild(val: string, scene: Phaser.Scene): TrieNode {
    const child = new TrieNode(val, scene.add.sprite(this.gameObject.x, this.gameObject.y, 'node'), this);
    child.text = scene.add.text(child.gameObject.x - 3, child.gameObject.y - 7, val, {
      fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, sans serif',
    });
    child.text.setDepth(2);
    this.children[child.val] = child;

    const x1 = this.gameObject.x;
    const y1 = this.gameObject.y;
    const x2 = child.gameObject.x;
    const y2 = child.gameObject.y;
    this.lines[child.val] = scene.add.line(0, 0, x1, y1, x2, y2, 0xff0000).setOrigin(0, 0);

    this.root.setMoveTo();

    return child;
  }

  update(): void {
    this.scaler += 0.002 * this.scaleDirection;
    this.gameObject.scale = this.scaler;
    if (this.scaler >= 1.1) {
      this.scaleDirection = -1;
    } else if (this.scaler <= 1) {
      this.scaleDirection = 1;
    }
    const currPos = new Phaser.Math.Vector2(this.gameObject.x, this.gameObject.y);
    if (!this.moveTo.fuzzyEquals(currPos)) {
      const newPosition = currPos.lerp(this.moveTo, 0.1);
      this.gameObject.setPosition(newPosition.x, newPosition.y);
      this.text.setPosition(newPosition.x - 3, newPosition.y - 7);
    }

    Object.values(this.children).forEach((child) => {
      child.update();
      const line = this.lines[child.val];
      line.setTo(this.gameObject.x, this.gameObject.y, child.gameObject.x, child.gameObject.y);
    });
  }

  activateParentMode(): void {
    this.gameObject.play('parent-start').once('animationcomplete', () => {
      this.gameObject.play('parent');
    });
  }

  deactivateParentMode(): void {
    this.gameObject.play('idle');
  }
}
