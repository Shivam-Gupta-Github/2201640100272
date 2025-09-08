import React, { useState } from "react";

export default function RetrieveForm() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");

  const backendBase = "http://localhost:3000";

  const handleRetrieve = async (e) => {
    e.preventDefault();
    setError("");
    setInfo(null);

    if (!code) {
      setError("Please enter shortcode");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${backendBase}/shorturls/${encodeURIComponent(code)}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Not found");
      } else {
        setInfo(data);
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Retrieve / Test Shortcode</h2>
      <form onSubmit={handleRetrieve}>
        <div className="field">
          <label>Shortcode</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="abcd123"
          />
        </div>
        <div className="field">
          <button disabled={loading}>
            {loading ? "Checking..." : "Check / Open"}
          </button>
        </div>
      </form>

      {error && <div className="error">{error}</div>}

      {info && (
        <div className="result">
          <div>
            <strong>Original URL:</strong>{" "}
            <a href={info.url} target="_blank" rel="noreferrer">
              {info.url}
            </a>
          </div>
          {info.expiresAt && (
            <div className="small">Expires at: {info.expiresAt}</div>
          )}
          {info.clicks != null && (
            <div className="small">Clicks: {info.clicks}</div>
          )}
        </div>
      )}
    </div>
  );
}
