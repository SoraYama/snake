import React from 'react';

import './App.css';
import Snake from './Snake';

class App extends React.Component {
  state = {
    size: 15,
    speed: 2,
    snakeSize: 15,
    snakeSpeed: 2,
    unmount: false,
  }

  handleSpeedChange = (e) => {
    this.setState({
      speed: e.target.value,
    })
  }

  handleSizeChange = (e) => {
    this.setState({
      size: e.target.value,
    })
  }

  handleClick = () => {
    const { speed, size } = this.state;

    this.setState({
      snakeSize: +size,
      snakeSpeed: +speed,
      unmount: true,
    }, () => {
      this.setState({
        unmount: false,
      })
    })
  }

  render() {
    const { speed, size, snakeSize, snakeSpeed, unmount } = this.state;

    return (
      <div className="page-container">
        <p>Use "W A S D" or "↑ ↓ ← →" to control direction.</p>
        <div className="form-row">
          <label>Size</label>
          <input onChange={this.handleSizeChange} value={size}></input>
        </div>
        <div className="form-row">
          <label>Speed</label>
          <input onChange={this.handleSpeedChange} value={speed}></input>
        </div>
        <button onClick={this.handleClick}>reset</button>
        {unmount ? null : <Snake size={snakeSize} speed={snakeSpeed} />}
      </div>
    );
  }
}

export default App;
