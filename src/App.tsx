import { useEffect, useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:4000';

interface Item {
  id: number;
  name: string;
}

function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState<string>('');

  useEffect(() => {
    axios.get<Item[]>(`${API}/items`)
      .then(res => setItems(res.data));

    const ws = new WebSocket('ws://localhost:4000');

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === 'INSERT') {
        setItems(prev => [...prev, msg.data]);
      }

      if (msg.type === 'UPDATE') {
        setItems(prev =>
          prev.map(item =>
            item.id === msg.data.id ? msg.data : item
          )
        );
      }

      if (msg.type === 'DELETE') {
        setItems(prev =>
          prev.filter(item => item.id !== msg.id)
        );
      }
    };

    return () => ws.close();
  }, []);

  const addItem = async () => {
    if (!name) return;
    await axios.post(`${API}/items`, { name });
    setName('');
  };

  const updateItem = async (id: number) => {
    const newName = prompt('New name');
    if (newName) {
      await axios.put(`${API}/items/${id}`, { name: newName });
    }
  };

  const deleteItem = async (id: number) => {
    await axios.delete(`${API}/items/${id}`);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Real-time CRUD (WebSocket)</h2>

      <input
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <button onClick={addItem}>Add</button>

      <ul>
        {items.map(item => (
          <li key={item.id}>
            {item.name}
            <button onClick={() => updateItem(item.id)}>Edit</button>
            <button onClick={() => deleteItem(item.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
