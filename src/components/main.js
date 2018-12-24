import React from "react";
import "./portfolio.css"
import Board from "./board"

class Main extends React.Component {

  render() {
    return (
        <div>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <Board/>
        </div>
              );
  }
}

export default Main;
