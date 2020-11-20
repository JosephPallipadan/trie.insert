const Vector2 = Phaser.Math.Vector2;
const HorizontalDistance = 75;
const VerticalDistance = 100;

const XTopAdjustment = 0;
const YTopAdjustment = 0;
const LevelSeparation = 100;
const MaxDepth = Infinity;
const SiblingSeparation = 75;
const SubtreeSeparation = 100;

export default class TrieNode {
  val: string;
  children: Record<string, TrieNode>;
  childCount: number;
  lastAddedChild: TrieNode;
  lines: Record<string, Phaser.GameObjects.Line>; // Line from this object to child corresponding to letter
  gameObject: Phaser.GameObjects.Sprite;
  moveTo: Phaser.Math.Vector2;
  root: TrieNode;
  parent: TrieNode;
  text: Phaser.GameObjects.Text;
  scaler = 1;
  scaleDirection = 1;

  constructor(val: string, gameObject: Phaser.GameObjects.Sprite, parent: TrieNode = null) {
    this.val = val;
    this.gameObject = gameObject;
    this.children = {};
    this.lines = {};
    this.moveTo = new Vector2(gameObject.x, gameObject.y);
    this.childCount = 0;
    this.lastAddedChild = null;
    this.parent = parent;
    this.root = val == '' ? this : parent.root;

    gameObject.setDepth(1);
    gameObject.play('idle-start').once('animationcomplete', () => {
      this.gameObject.play('idle');
    });
  }

  // Translate node and every single descendant of node horizontally by xOffset using a bfs.
  static translateAlongWithDescendants(node: TrieNode, xOffset: number): void {
    const nodes = [node];
    while (nodes.length > 0) {
      const child = nodes.pop();
      child.moveTo.x += xOffset;
      nodes.push(...Object.values(child.children));
    }
  }

  // Get the left most or right most node in the subtree rooted at this node.
  static getOutermostNode(node: TrieNode, searchLeftWards: boolean): TrieNode {
    const children = Object.values(node.children);
    if (children.length == 0) {
      return node;
    }
    let farthest = children[0];
    children.forEach((child) => {
      const factor = searchLeftWards ? -1 : 1;
      farthest = child.gameObject.x * factor > farthest.gameObject.x * factor ? child : farthest;
    });
    return TrieNode.getOutermostNode(farthest, searchLeftWards);
  }

  addChild(val: string, scene: Phaser.Scene): TrieNode {
    const child = new TrieNode(
      val,
      scene.add.sprite(this.gameObject.x, this.gameObject.y + VerticalDistance, 'node'),
      this,
    );
    child.text = scene.add.text(child.gameObject.x - 3, child.gameObject.y - 7, val, {
      fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, sans serif',
    });
    child.text.setDepth(2);
    this.children[child.val] = child;
    this.childCount++;

    // If this child was even numbered, horizontal shifting needs to happen.
    if (this.childCount % 2 == 0) {
      // At this point, both the last added child and the newly added will be occupying the same spots.
      // This makes it so that they will not violate the conditions for translation in the forthcoming loop
      // while at the same time will move to their correct positions eventually.

      const lastAddTranslationFactor =
        Math.abs(
          this.lastAddedChild.gameObject.x - TrieNode.getOutermostNode(this.lastAddedChild, false).gameObject.x,
        ) /
          HorizontalDistance +
        1;

      child.moveTo.x += HorizontalDistance;
      TrieNode.translateAlongWithDescendants(this.lastAddedChild, -HorizontalDistance * lastAddTranslationFactor);

      let runner = child;
      while (runner.val != '') {
        const siblings = Object.values(runner.parent.children);
        if (siblings.length > 1) {
          siblings.forEach((node) => {
            if (node.gameObject.x < runner.gameObject.x - 10) {
              TrieNode.translateAlongWithDescendants(node, -HorizontalDistance * lastAddTranslationFactor);
            } else if (node.gameObject.x > runner.gameObject.x + 10) {
              TrieNode.translateAlongWithDescendants(node, HorizontalDistance * lastAddTranslationFactor);
            }
          });
        }
        runner = runner.parent;
      }
    }
    this.lastAddedChild = child;

    const x1 = this.gameObject.x;
    const y1 = this.gameObject.y;
    const x2 = child.gameObject.x;
    const y2 = child.gameObject.y;
    this.lines[child.val] = scene.add.line(0, 0, x1, y1, x2, y2, 0xff0000).setOrigin(0, 0);

    // child.gameObject.setDepth(1);
    return child;
  }

  update(): void {
    // this.gameObject.angle += 1;w
    // this.scaler += 0.002 * this.scaleDirection;
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
