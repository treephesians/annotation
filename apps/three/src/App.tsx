import { Button } from "@repo/ui/button";
import "./App.css";

function App() {
  return (
    <div className="app">
      <h1>Vite + React</h1>
      <p className="subtitle">모노레포 Vite 앱</p>
      <Button appName="Vite">시작하기</Button>
    </div>
  );
}

export default App;
