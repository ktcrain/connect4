import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.scss";
import GameGrid from "../GameGrid";
import Room from "../Room";
import Header from "../Header";
import { BoardContextProvider } from "../GameGrid/hooks/context";
import { BoardContextProvider as RoomContextProvider } from "../Room/hooks/context";

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="App-Main">
          <Switch>
            <Route exact path="/">
              <BoardContextProvider>
                <GameGrid />
              </BoardContextProvider>
            </Route>
            <Route path="/room/:slug?">
              <RoomContextProvider>
                <Room />
              </RoomContextProvider>
            </Route>
          </Switch>
        </main>
      </div>
    </Router>
  );
}

export default App;
