import { render } from "preact";
import { App } from "./App";
import "./styles/reset.css";
import "./styles/colors.css";
import "./styles/utility.css";

const root = document.getElementById("app");
if (root) {
  render(<App />, root);
}
