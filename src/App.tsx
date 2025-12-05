import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { writeText, readText } from "@tauri-apps/plugin-clipboard-manager";
import { getItems, addItem } from "@yzzo/api/tauriApi";
import { Item } from "@yzzo/models/Item";
import { useClipboardEventWatcher } from "@yzzo/hooks/clipboardWatcher";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const clipboardText = useClipboardEventWatcher();

  useEffect(() => {
    (async () => {
      const existingItems = await getItems();
      setItems(existingItems);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const updatedItems = await getItems();
      setItems(updatedItems);
    })();
  }, [clipboardText]);

  async function copySomething() {
    await writeText("Hello from Tauri!");
  }

  async function pasteSomething() {
    const text = await readText();
    setGreetMsg(text);
    addItem(text);
  }

  return (
    <main className="container">
      <h1>Welcome to Tauri + React</h1>

      <div className="row">
        <a href="https://vite.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <button type="submit" onClick={copySomething}>
        Copy
      </button>
      <button type="submit" onClick={pasteSomething}>
        Paste
      </button>
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>
      <p>{greetMsg}</p>
      <h2>Items:</h2>
      <ul>
        {items.map((item, idx) => (
          <li key={idx}>{item.content}</li>
        ))}
      </ul>
    </main>
  );
}

export default App;
