

import React, { useState } from "react";
import WelcomePage from "./components/WelcomePage";
import CapturePage from "./components/CapturePage";

function App() {
  const [start, setStart] = useState(false);

  return (
    <div>
      {!start ? (
        <WelcomePage onStart={() => setStart(true)} />
      ) : (
        <CapturePage />
      )}
    </div>
  );
}

export default App;

