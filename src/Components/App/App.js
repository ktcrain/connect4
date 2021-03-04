import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import "./App.scss";
import GameGrid from "../GameGrid";
import Header from "../Header";
import { BoardContextProvider } from "../GameGrid/hooks/context";
function App() {
  return (
    <Router>
      <div className="App">
        <main>
          <BoardContextProvider>
            <Header />
            <Switch>
              <Route path="/">
                <GameGrid />
              </Route>
              <Route path="/room">
                <GameGrid />
              </Route>
            </Switch>
          </BoardContextProvider>
        </main>
      </div>
    </Router>
  );
}

export default App;
