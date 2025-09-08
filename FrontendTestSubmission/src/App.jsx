import React from "react";
import ShortenForm from "./components/ShortenForm";
import RetrieveForm from "./components/RetrieveForm";

export default function App() {
  return (
    <div className="container">
      <h1>URL Shortener</h1>
      <ShortenForm />
      <hr />
      <RetrieveForm />
    </div>
  );
}
