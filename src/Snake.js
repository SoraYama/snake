import React from 'react';
import flatten from 'lodash/flatten';

import './Snake.css';
import { getRandomInt } from './utils';

const CELL_SIZE = 20;
const BEAN_TOKEN = -1;

const Directions = {
  UP: 'U',
  DOWN: 'D',
  RIGHT: 'R',
  LEFT: 'L',
};

const DirectionText = {
  'U': '↑',
  'D': '↓',
  'R': '→',
  'L': '←',
}

const Status = {
  READY: 0,
  PLAYING: 1,
  GAME_OVER: 2,
  WIN: 3,
};

const StatusText = {
  0: 'Ready',
  1: 'Playing',
  2: 'Game Over',
  3: 'Win',
};

const BtnText = {
  0: 'start',
  1: 'pause',
  2: 'reset',
  3: 'reset',
};

class Snake extends React.Component {
  static defaultProps = {
    size: 5,
    speed: 1,
  };

  constructor(props) {
    super(props);

    const { size } = props;
    if (size < 5) {
      throw new Error('map size must not less then 5');
    }

    const map = Array(size)
      .fill('')
      .map(() => Array(size).fill(0));
    // const map = [
    //   [1, 2, 3, 4, 5, 6],
    //   [12, 11, 10, 9, 8, 7],
    //   [13, 14, 15, 16, 17, 18],
    //   [24, 23, 22, 21, 20, 19],
    //   [25, 26, 27, 28, 29, 30],
    //   [0, 0, 34, 33, 32, 31],
    // ];

    this.state = {
      map,
      status: Status.READY,
      direction: Directions.RIGHT,
    };
  }

  init() {
    const { size } = this.props;
    const { map } = this.state;
    const INIT_SNAKE_LENGTH = 2;
    const [snakeInitPositionX, snakeInitPositionY] = [
      Math.min(getRandomInt(size), size - INIT_SNAKE_LENGTH - 1),
      getRandomInt(size),
    ];
    for (let i = snakeInitPositionX; i < snakeInitPositionX + INIT_SNAKE_LENGTH; i++) {
      map[snakeInitPositionY][i] = i - snakeInitPositionX + 1;
    }
    const [beanX, beanY] = this.getNextBeanPosition();
    map[beanY][beanX] = BEAN_TOKEN;
    this.setState({ map });
  }

  get snakeLength() {
    const { size } = this.props;
    const { map } = this.state;
    let len = 0;
    for (let j = 0; j < size; j++) {
      for (let i = 0; i < size; i++) {
        if (map[j][i] > 0) {
          len++;
        }
      }
    }
    return len;
  }

  get snakeHead() {
    const { size } = this.props;
    const { map } = this.state;
    const len = this.snakeLength;
    for (let j = 0; j < size; j++) {
      for (let i = 0; i < size; i++) {
        if (map[j][i] === len) {
          return [i, j]
        }
      }
    }
    return [0, 0];
  }

  move() {
    const { size } = this.props;
    const { map, status } = this.state;

    if (status !== Status.PLAYING) {
      return;
    }

    const [nextX, nextY] = this.getNextHeadPosition();
    const nextCell = map[nextY]?.[nextX];

    if (nextCell === undefined || nextCell > 0) {
      this.setState({
        status: Status.GAME_OVER,
      });
      return;
    }
    if (nextCell === BEAN_TOKEN) {
      const curLen = this.snakeLength + 1;
      map[nextY][nextX] = curLen;
      if (curLen === size ** 2) {
        this.setState({ map, status: Status.WIN });
        return;
      }
      const [nextBeanX, nextBeanY] = this.getNextBeanPosition();
      map[nextBeanY][nextBeanX] = BEAN_TOKEN;
      this.setState({ map });
      return;
    }

    const [headX, headY] = this.snakeHead;
    const headCell = map[headY][headX];

    for (let j = 0; j < size; j++) {
      for (let i = 0; i < size; i++) {
        const cell = map[j][i];
        if (cell === 0 || cell === BEAN_TOKEN) {
          continue;
        }
        map[j][i] = Math.max(0, map[j][i] - 1);
      }
    }
    map[nextY][nextX] = headCell;
    this.setState({
      map,
    });
  }

  getNextHeadPosition(nextDirection) {
    const { direction } = this.state;
    const [headX, headY] = this.snakeHead;
    switch (nextDirection || direction) {
      case Directions.DOWN:
        return [headX, headY + 1];
      case Directions.UP:
        return [headX, headY - 1];
      case Directions.RIGHT:
        return [headX + 1, headY];
      case Directions.LEFT:
        return [headX - 1, headY];
      default:
        return [headX, headY];
    }
  }

  getNextBeanPosition() {
    const { size } = this.props;
    const { map } = this.state;
    let i, j;
    let skipedEmptyCount = 0;
    let [lastEmptyX, lastEmptyY] = [0, 0];
    for (j = 0; j < size; j++) {
      for (i = 0; i < size; i++) {
        if (map[j][i] !== 0) {
          continue;
        }
        if (Math.random() < 1 / (this.emptyBlockLen - skipedEmptyCount)) {
          return [i, j];
        } else {
          skipedEmptyCount++;
          [lastEmptyX, lastEmptyY] = [i, j];
        }
      }
    }
    return [lastEmptyX, lastEmptyY];
  }

  get emptyBlockLen() {
    const { map } = this.state;
    return flatten(map).filter((val) => val === 0).length;
  }

  listner = (e) => {
    if (e.key === ' ') {
      this.handleClickBtn();
      return;
    }

    let nextDirection = this.state.direction;

    switch (e.key) {
      case 'd':
      case 'ArrowRight':
        if (nextDirection !== Directions.LEFT) {
          nextDirection = Directions.RIGHT;
        }
        break;
      case 'w':
      case 'ArrowUp':
        if (nextDirection !== Directions.DOWN) {
          nextDirection = Directions.UP;
        }
        break;
      case 'a':
      case 'ArrowLeft':
        if (nextDirection !== Directions.RIGHT) {
          nextDirection = Directions.LEFT;
        }
        break;
      case 's':
      case 'ArrowDown':
        if (nextDirection !== Directions.UP) {
          nextDirection = Directions.DOWN;
        }
        break;
      default:
        return;
    }

    const [nextX, nextY] = this.getNextHeadPosition(nextDirection);
    const [headX, headY] = this.snakeHead;
    const { map } = this.state;

    if (map[nextY]?.[nextX] === map[headY][headX] - 1) {
      return;
    }

    this.setState({
      direction: nextDirection,
    })
  };

  registerEventListener() {
    window.addEventListener('keydown', this.listner);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.listner);
  }

  interval = null;

  start() {
    if (this.state.status !== Status.READY) {
      return;
    }
    const { speed } = this.props;
    clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.move();
    }, 1000 / speed);
    this.setState({ status: Status.PLAYING });
  }

  pause() {
    clearInterval(this.interval);
    this.setState({ status: Status.READY });
  }

  reset() {
    const { size } = this.props;
    const { map } = this.state;

    clearInterval(this.interval);

    for (let j = 0; j < size; j++) {
      for (let i = 0; i < size; i++) {
        map[j][i] = 0;
      }
    }
    this.init();
    this.setState({ map, status: Status.READY, direction: Directions.RIGHT });
  }

  componentDidMount() {
    this.init();
    this.registerEventListener();
  }

  handleClickBtn = () => {
    const { status } = this.state;
    if (status === Status.READY) {
      this.start();
    } else if (status === Status.PLAYING) {
      this.pause();
    } else {
      this.reset();
    }
  };

  render() {
    const { size, isDebug } = this.props;
    const { map, status, direction } = this.state;
    const [headX, headY] = this.snakeHead;

    return (
      <div className="wrapper">
        <h2>{StatusText[status]}</h2>
        <h5>(current direction: {DirectionText[direction]})</h5>
        <button className="start-btn" onClick={this.handleClickBtn}>
          {BtnText[status]}
        </button>
        <div className="container" style={{ width: size * CELL_SIZE }}>
          {map.map((row, rowIndex) => (
            <div key={rowIndex} className="row">
              {row.map((cell, cellIndex) => (
                <div
                  key={cellIndex}
                  className={`cell${cell === BEAN_TOKEN ? ' bean' : ''}${cell > 0 ? ' snake' : ''}${
                    rowIndex === headY && cellIndex === headX ? ' head' : ''
                  }`}
                  style={{ height: CELL_SIZE, width: CELL_SIZE }}
                >
                  {isDebug ? cell : null}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default Snake;
