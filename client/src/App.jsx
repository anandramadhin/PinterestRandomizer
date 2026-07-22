import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [boards, setBoards] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBoards() {
      try {
        const response = await fetch("http://localhost:3000/api/boards");

        if (!response.ok) {
          throw new Error(`Server returned status ${response.status}`);
        }

        const data = await response.json();
        setBoards(data);
      } catch (err) {
        console.error(err);
        setError("Could not load the Pinterest boards.");
      }
    }

    loadBoards();
  }, []);

  return (
    <main>
      <h1>Pinterest Randomizer</h1>

      {error ? (
        <p>{error}</p>
      ) : (
        <select>
          {boards.map((board) => (
            <option key={board.id} value={board.id}>
              {board.name}
            </option>
          ))}
        </select>
      )}
    </main>
  );
}

export default App;