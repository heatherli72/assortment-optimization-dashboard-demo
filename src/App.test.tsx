import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders dashboard cover and framework statement", () => {
  render(<App />);
  expect(screen.getByRole("heading", { name: /assortment optimization analytics/i })).toBeInTheDocument();
  expect(screen.getByText(/A practical navigation model for finding value concentration/i)).toBeInTheDocument();
});
