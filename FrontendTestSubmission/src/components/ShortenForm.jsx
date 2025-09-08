import React, { useState } from "react";

export default function ShortenForm() {
  const [url, setUrl] = useState("");
  const [shortcode, setShortcode] = useState("");
  const [validity, setValidity] = useState("30");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const backendBase = "http://localhost:3000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!url) {
      setError("Please enter a URL");
      return;
    }

    setLoading(true);
    try {
      const body = { url };
      if (shortcode) body.shortcode = shortcode;
      if (validity) body.validity = Number(validity);

      const res = await fetch(`${backendBase}/shorturls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Server error");
      } else {
        setResult(data);
        setUrl("");
        setShortcode("");
        setValidity("30");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Create Short URL</h2>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Long URL</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/long-path"
          />
        </div>

        <div className="field row">
          <div style={{ flex: 1 }}>
            <label>Custom Shortcode (optional)</label>
            <input
              type="text"
              value={shortcode}
              onChange={(e) => setShortcode(e.target.value)}
              placeholder="e.g. myCode123"
            />
          </div>
          <div style={{ width: 120 }}>
            <label>Validity (minutes)</label>
            <input
              type="number"
              value={validity}
              onChange={(e) => setValidity(e.target.value)}
              min="1"
            />
          </div>
        </div>

        <div className="field">
          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Short Link"}
          </button>
        </div>
      </form>

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="result">
          <div>
            <strong>Short Link:</strong>{" "}
            <a href={result.shortLink} target="_blank" rel="noreferrer">
              {result.shortLink}
            </a>
          </div>
          <div className="small">Expires at: {result.expiry}</div>
        </div>
      )}
    </div>
  );
}
