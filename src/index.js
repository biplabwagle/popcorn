import React, { useState } from "react";
import ReactDOM from "react-dom/client";
// import StarRating from "./StarRating";
import "./index.css";
import App from "./App";

// function Test() {
//   const [movRate, setMovRate] = useState(0);
//   return (
//     <div>
//       <StarRating maxRating={10} defaultRating={2} onSetRating={setMovRate} />
//       <p>This movie was rated {movRate}</p>
//     </div>
//   );
// }
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
    {/* <StarRating
      maxRating={5}
      messages={["Terrible", "Bad", "Okay", "Good", "Terrific"]}
      defaultRating={3}
    /> */}
    {/* <Test /> */}
  </React.StrictMode>
);
