import { Heap } from "./heap.js";
import { disabledActions, drawMatrix, enabledActions  } from "./client.js";

var _: any;

const gamePhaseGoal = [
  [0,1,2],
  [3,4,5],
  [6,7,8]
]

drawMatrix(gamePhaseGoal);

export interface MatrixPosition {
  line: number;
  column: number;
}

export class State {
  gamePhase: number[][] = [];
  g: number = 0;
  parent: State | null = null;
  blankPosition: MatrixPosition = { line: 0, column: 0 };

  private swap(one: MatrixPosition, two: MatrixPosition) {
    const temp = this.gamePhase[one.line][one.column]
    this.gamePhase[one.line][one.column] = this.gamePhase[two.line][two.column]
    this.gamePhase[two.line][two.column] = temp;
  }

  private generateNewState() {
    const state = new State();
    state.gamePhase = _.cloneDeep(this.gamePhase);
    state.parent = this;
    
    return state;
  }

  heuristic() {
    let estimate = 0;

    for (let i = 0; i < gamePhaseGoal.length; i++) {
      for (let j = 0; j < gamePhaseGoal[i].length; j++) {
        if (gamePhaseGoal[i][j] != this.gamePhase[i][j]) {
          estimate += 1;
        }
      }
    }

    return estimate;
  }

  f() {
    return this.g + this.heuristic();
  }

  isGoal() {
    for (let i = 0; i < gamePhaseGoal.length; i++) {
      for (let j = 0; j < gamePhaseGoal[i].length; j++) {
        if (this.gamePhase[i][j] != gamePhaseGoal[i][j]) {
          return false;
        }
      }
    }

    return true;
  }

  private moveTop() {
    if (this.blankPosition.line > 0) {
      const state = this.generateNewState();
      state.blankPosition = { line: this.blankPosition.line - 1, column: this.blankPosition.column }
      state.swap(this.blankPosition, state.blankPosition);
      return state;
    }
  }

  private moveBottom() {
    if (this.blankPosition.line < (this.gamePhase.length - 1)) {
      const state = this.generateNewState();
      state.blankPosition = { line: this.blankPosition.line + 1, column: this.blankPosition.column }
      state.swap(this.blankPosition, state.blankPosition);
      return state;
    }
  }

  private moveLeft() {
    if (this.blankPosition.column > 0) {
      const state = this.generateNewState();
      state.blankPosition = { line: this.blankPosition.line, column: this.blankPosition.column - 1};
      state.swap(this.blankPosition, state.blankPosition);
      return state;
    }
  }

  private moveRight() {
    if (this.blankPosition.column < (this.gamePhase[this.blankPosition.line].length - 1)) {
      const state = this.generateNewState();
      state.blankPosition = { line: this.blankPosition.line, column: this.blankPosition.column + 1 };
      state.swap(this.blankPosition, state.blankPosition);
      return state;
    }
  }

  neighbors(): State[] {
    const neighbors = [];
    
    const moveTop = this.moveTop();
    if (moveTop) neighbors.push(moveTop);

    const moveBottom = this.moveBottom();
    if (moveBottom) neighbors.push(moveBottom);

    const moveLeft = this.moveLeft();
    if (moveLeft) neighbors.push(moveLeft);

    const moveRight = this.moveRight();
    if (moveRight) neighbors.push(moveRight);

    return neighbors;
  }
}

export async function sleep(time: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time)
  })
}

export function compare(nodeOne: State, nodeTwo: State) {
  return nodeOne.f() > nodeTwo.f();
}

export async function reconstructPath(state: State) {
  let states: State[] = [];
  let current = _.cloneDeep(state);
  while (current.parent) {
    states.push(current);
    current = _.cloneDeep(current.parent);
  }
  states = states.reverse();
  console.log(states);
  for (let i = 0; i < states.length; i++) {
    await sleep(200)
    drawMatrix(states[i].gamePhase);
  }
  enabledActions();
}

export function randomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffleState(state: State): State {
  const neighbors = state.neighbors();
  return neighbors[randomNumber(0, neighbors.length - 1)];
}

export function withoutSolution(startState: State, lastState: State) {
  alert('Nao encontrei a solucao!');
  enabledActions();
}

export function aStar(startState: State) {
  disabledActions();
  const edge = new Heap<State>(compare);
  const visited: any = {};
  edge.add(startState);
  let trys = 0;

  while (edge.length() > 0) {
    const current = edge.remove();
    visited[current.gamePhase.toString()] = true;
    trys += 1;
    
    if (trys > 180000) {
      return withoutSolution(startState, current);
    }

    if (current.isGoal()) {
      return reconstructPath(current);
    }

    for (const neighbor of current.neighbors()) {
      if (!visited[neighbor.gamePhase.toString()]) {
        neighbor.g = current.g + 1;
        edge.add(neighbor);
      }
    }
  }
}

export function getStartState() {
  let startState = new State();
  startState.gamePhase = _.cloneDeep(gamePhaseGoal);
  startState.blankPosition = {line: 0, column: 0}

  for (let i = 0; i < randomNumber(40, 200); i++) {
    startState = shuffleState(startState);
    startState.parent = null;
  }

  drawMatrix(startState.gamePhase);

  return startState;
}

export function main(lodash: any) {
  _ = lodash;
}