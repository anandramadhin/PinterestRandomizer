import { useEffect, useState } from "react";
import "./App.css";

const STORAGE_KEY = "pinterest-randomizer-state";

function loadSavedState() {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);

    if (!savedState) {
      return {
        selectedBoardId: "",
        displayedPins: []
      };
    }

    return JSON.parse(savedState);
  } catch (error) {
    console.error("Could not load saved app state:", error);

    return {
      selectedBoardId: "",
      displayedPins: []
    };
  }
}

function App() {
  const [savedState] = useState(loadSavedState);

  const [boards, setBoards] = useState([]);
  const [selectedBoardId, setSelectedBoardId] = useState(
    savedState.selectedBoardId || ""
  );
  const [pins, setPins] = useState([]);
  const [displayedPins, setDisplayedPins] = useState(
    savedState.displayedPins || []
  );
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

        setSelectedBoardId(currentBoardId => {
          const savedBoardStillExists = data.some(
            board => board.id === currentBoardId
          );

          if (savedBoardStillExists) {
            return currentBoardId;
          }

          return data.length > 0 ? data[0].id : "";
        });
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

        setDisplayedPins(currentPins => {
          const savedPinsAreValid =
            currentPins.length > 0 &&
            currentPins.every(savedPin =>
              data.some(
                availablePin =>
                  availablePin.id === savedPin.id &&
                  availablePin.boardId === selectedBoardId
              )
            );

          if (!savedPinsAreValid) {
            return chooseRandomPins(data);
          }

          return currentPins.map(savedPin => {
            const updatedPin = data.find(
              pin => pin.id === savedPin.id
            );

            return {
              ...updatedPin,
              isKept: Boolean(savedPin.isKept)
            };
          });
        });
      } catch (err) {
        console.error(err);
        setError("Could not load the pins.");
      }
    }

    loadPins();
  }, [selectedBoardId]);

  useEffect(() => {
    if (!selectedBoardId) {
      return;
    }

    const appState = {
      selectedBoardId,
      displayedPins
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(appState)
    );
  }, [selectedBoardId, displayedPins]);

  function chooseRandomPins(pinList, amount = 3) {
    const shuffledPins = [...pinList];

    for (
      let index = shuffledPins.length - 1;
      index > 0;
      index--
    ) {
      const randomIndex = Math.floor(
        Math.random() * (index + 1)
      );

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

      const replacement =
        replacementPins[replacementIndex];

      replacementIndex += 1;

      return replacement;
    });

    setDisplayedPins(updatedPins);
  }

  function handleBoardChange(event) {
    setDisplayedPins([]);
    setSelectedBoardId(event.target.value);
  }

return (
  <main className="app">
    <header className="app-header">
      <p className="eyebrow">Inspiration generator</p>
      <h1>Pinterest Randomizer</h1>
      <p className="subtitle">
        Choose a board, keep the images you like, and
        randomize the rest.
      </p>
    </header>

    <section className="controls">
      <div className="board-control">
        <label htmlFor="board-select">
          Choose a board
        </label>

        <select
          id="board-select"
          value={selectedBoardId}
          onChange={handleBoardChange}
        >
          {boards.map(board => (
            <option key={board.id} value={board.id}>
              {board.name}
            </option>
          ))}
        </select>
      </div>

      <button
        className="randomize-button"
        type="button"
        onClick={randomizePins}
        disabled={
          pins.length === 0 ||
          displayedPins.length === 0 ||
          displayedPins.every(pin => pin.isKept)
        }
      >
        Randomize unlocked images
      </button>
    </section>

    {error && (
      <p className="error-message">
        {error}
      </p>
    )}

    <section className="pin-grid">
      {displayedPins.map((pin, index) => (
        <article
          className={`pin-card ${
            pin.isKept ? "pin-card-kept" : ""
          }`}
          key={pin.id}
        >
          <div className="image-container">
            <img
              src={pin.imageUrl}
              alt={pin.title}
            />

            <span className="slot-number">
              {index + 1}
            </span>

            {pin.isKept && (
              <span className="kept-badge">
                Kept
              </span>
            )}
          </div>

          <div className="pin-card-content">
            <h2>{pin.title}</h2>

            <button
              className={
                pin.isKept
                  ? "keep-button release-button"
                  : "keep-button"
              }
              type="button"
              onClick={() => toggleKeep(pin.id)}
            >
              {pin.isKept ? "Release" : "Keep image"}
            </button>
          </div>
        </article>
      ))}
    </section>

    {displayedPins.length === 0 && !error && (
      <p className="empty-message">
        Choose a board to begin.
      </p>
    )}
  </main>
);
}

export default App;