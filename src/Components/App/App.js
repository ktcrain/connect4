import "./App.scss";
import GameGrid from "../GameGrid";
import { BoardContextProvider } from "../GameGrid/hooks/context";
function App() {
  return (
    <div className="App">
      <main>
        <BoardContextProvider>
          <GameGrid />
        </BoardContextProvider>
      </main>
    </div>
  );
}

export default App;
