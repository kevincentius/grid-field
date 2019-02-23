import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.css']
})
export class GridComponent implements OnInit {

  cols = 16;
  cellHeight = 80;
  rows = 0;

  tiles = []; /*[{
    pos: { x: 5, y: 0, w: 2, h: 2 },
    viewModel: this.randomColor()
  }, {
    pos: { x: 5, y: 3, w: 1, h: 1 },
    viewModel: this.randomColor()
  }, {
    pos: { x: 3, y: 6, w: 3, h: 2 },
    viewModel: this.randomColor()
  }];*/

  overlayTiles: number[][] = [];

  constructor() { }

  ngOnInit() {
    this.updateOverlay();
  }

  randomColor() {
    return 'rgb('
    + Math.floor(Math.random() * 255) + ','
    + Math.floor(Math.random() * 255) + ','
    + Math.floor(Math.random() * 255) + ')';
  }



  /****************************************************************
   * Field operations
   ****************************************************************/
  sortTiles() {
    this.tiles.sort((a, b) => { return a.pos.y - b.pos.y; });
  }

  addTile(i, j) {
    let tile = {
      pos: { x: j, y: i, w: Math.min(4, this.cols - j), h: 4 },
      viewModel: this.randomColor()
    };
    this.tiles.push(tile);
    this.pushDown(tile);
  }

  pullUp() {
    this.sortTiles();

    let colY = [];
    for (let i = 0; i < this.cols; i++) colY.push(0);

    for (let tile of this.tiles) {
      let ty = 0;
      for (let ix = 0; ix < tile.pos.w; ix++) {
        let cx = tile.pos.x + ix;
        ty = Math.max(ty, colY[cx]);
      }

      tile.pos.y = ty;

      for (let ix = 0; ix < tile.pos.w; ix++) {
        let cx = tile.pos.x + ix;
        colY[cx] = ty + tile.pos.h;
      }
    }
    this.updateOverlay();
  }

  pushDown(exceptTile) {
    for (let tile of this.tiles) {
      if (tile != exceptTile && tile.pos.y + tile.pos.h > exceptTile.pos.y) {
        tile.pos.y += 100;
      }
    }
    this.pullUp();
  }

  updateMaxY() {
    this.rows = 4;
    for (let tile of this.tiles) {
      this.rows = Math.max(this.rows, tile.pos.y + tile.pos.h + 4);
    }
  }

  updateOverlay() {
    this.updateMaxY();
    let fillMatrix = [];
    for (let i = 0; i < this.rows; i++) {
      let row = [];
      for (let j = 0; j < this.cols; j++) {
        row.push(-1);
      }
      fillMatrix.push(row);
    }

    for (let tileIndex = 0; tileIndex < this.tiles.length; tileIndex++) {
      let tile = this.tiles[tileIndex];
      for (let i = 0; i < tile.pos.h; i++) {
        for (let j = 0; j < tile.pos.w; j++) {
          fillMatrix[tile.pos.y + i][tile.pos.x + j] = tileIndex;
        }
      }
    }

    this.overlayTiles = fillMatrix;
  }



  /****************************************************************
   * Drag Handlers
   ****************************************************************/
  tileDragged = -1;
  tileResized = -1;

  dragHeader(tileIndex) {
    this.tileDragged = tileIndex;
  }

  dragEndHeader(e) {
    this.tileDragged = -1;
  }

  dragResize(tileIndex) {
    this.tileResized = tileIndex;
  }

  dragEndResize(e) {
    this.tileResized = -1;
  }

  dragOverOv(e, i, j) {
    if (this.tileDragged != -1) {
      // check if tile will not end up outside of x-bound
      if (j + this.tiles[this.tileDragged].pos.w <= this.cols) {
        e.preventDefault();
      }
    } else if (this.tileResized != -1) {
      // check if width/height is positive
      let tile = this.tiles[this.tileResized];
      if (i >= tile.pos.y && j >= tile.pos.x) {
        e.preventDefault();
      }
    }
  }

  dragLeaveOv(e, i, j) {

  }

  dragDropOv(e, i, j) {
    console.log(i, j);
    if (this.tileDragged != -1) {
      e.preventDefault();
      this.tiles[this.tileDragged].pos.y = i;
      this.tiles[this.tileDragged].pos.x = j;
      this.pushDown(this.tiles[this.tileDragged]);
    } else if (this.tileResized != -1) {
      let tile = this.tiles[this.tileResized];
      tile.pos.h = i + 1 - tile.pos.y;
      tile.pos.w = j + 1 - tile.pos.x;
      this.pushDown(this.tiles[this.tileResized]);
    }
  }

}
