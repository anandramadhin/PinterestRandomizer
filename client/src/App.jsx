import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [boards, setBoards] = useState([]);
  const [selectedBoardId, setSelectedBoardId] = useState("");
  const [pins, setPins] = useState([]);
  const [displayedPins, setDisplayedPins] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBoards() {
      try {
        const response = await fetch(
          "http://localhost:3000/api/boards"
        );

        if (!response.ok) {
          throw new Error(
            `Server returned status ${response.status}`
          );
        }

        const data = await response.json();

        setBoards(data);

        if (data.length > 0) {
          setSelectedBoardId(data[0].id);
        }
      } catch (err) {
        console.error(err);
        setError("Could not load the boards.");
      }
    }

    loadBoards();
  }, []);

  useEffect(() => {
    if (!selectedBoardId) {
      return;
    }

    async function loadPins() {
      try {
        setError("");

        const response = await fetch(
          `http://localhost:3000/api/pins?boardId=${selectedBoardId}`
        );

        if (!response.ok) {
          throw new Error(
            `Server returned status ${response.status}`
          );
        }

        const data = await response.json();
        setPins(data);
        setDisplayedPins(chooseRandomPins(data));
      } catch (err) {
        console.error(err);
        setError("Could not load the pins.");
      }
    }

    loadPins();
  }, [selectedBoardId]);

//The function below shouold choose random pins from the board
function chooseRandomPins(pinList, amount = 3) {
  const shuffledPins = [...pinList];

  for (let index = shuffledPins.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [shuffledPins[index], shuffledPins[randomIndex]] = [
      shuffledPins[randomIndex],
      shuffledPins[index]
    ];
  }

  return shuffledPins.slice(0, amount).map(pin => ({
    ...pin,
    isKept: false
  }));
}

function randomizePins() {
  const currentUnlockedIds = new Set(
    displayedPins
      .filter(pin => !pin.isKept)
      .map(pin => pin.id)
  );

  const keptIds = new Set(
    displayedPins
      .filter(pin => pin.isKept)
      .map(pin => pin.id)
  );

  const unlockedCount = displayedPins.filter(
    pin => !pin.isKept
  ).length;

  let availablePins = pins.filter(
    pin =>
      !keptIds.has(pin.id) &&
      !currentUnlockedIds.has(pin.id)
  );

  if (availablePins.length < unlockedCount) {
    availablePins = pins.filter(
      pin => !keptIds.has(pin.id)
    );
  }

  const replacementPins = chooseRandomPins(
    availablePins,
    unlockedCount
  );

  let replacementIndex = 0;

  const updatedPins = displayedPins.map(pin => {
    if (pin.isKept) {
      return pin;
    }

    const replacement = replacementPins[replacementIndex];
    replacementIndex += 1;

    return replacement;
  });

  setDisplayedPins(updatedPins);
}


function toggleKeep(pinId) {
  setDisplayedPins(currentPins =>
    currentPins.map(pin =>
      pin.id === pinId
        ? {
            ...pin,
            isKept: !pin.isKept
          }
        : pin
    )
  );
}
  return (
    <main>
      <h1>Pinterest Randomizer</h1>

      <label htmlFor="board-select">Choose a board</label>

      <select
        id="board-select"
        value={selectedBoardId}
        onChange={event =>
          setSelectedBoardId(event.target.value)
        }
      >
        {boards.map(board => (
          <option
            key={board.id}
            value={board.id}
          >
            {board.name}
          </option>
        ))}
      </select>

      {error && <p>{error}</p>}

      <section>
        {displayedPins.map(pin => (
          <article key={pin.id}>
            <img
              src={pin.imageUrl}
              alt={pin.title}
              width="250"
            />

            <h2>{pin.title}</h2>

            <button
              type="button"
              onClick={() => toggleKeep(pin.id)}
            >
              {pin.isKept ? "Release" : "Keep"}
            </button>
          </article>
        ))}
      </section>
            <button
              type="button"
              onClick={randomizePins}
              disabled={
                pins.length === 0 ||
                displayedPins.every(pin => pin.isKept)
              }
            >
              Randomize
            </button>
    </main>
  );
}

export default App;