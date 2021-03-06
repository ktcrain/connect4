import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.scss";
import GameGrid from "../GameGrid";
import Header from "../Header";
import { BoardContextProvider } from "../GameGrid/hooks/context";
import { BoardContextProvider as RoomContextProvider } from "../Room/hooks/context";

const Room = lazy(() => import("../Room"));

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="App-Main">
          <Suspense fallback="null">
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
          </Suspense>
        </main>
      </div>
    </Router>
  );
}

export default App;
