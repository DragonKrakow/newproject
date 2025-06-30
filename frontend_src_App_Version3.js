import React, { useState } from "react";

const API = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

function App() {
  const [images, setImages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [moderation, setModeration] = useState(null);
  const [platform, setPlatform] = useState("Twitter");
  const [post, setPost] = useState("");
  const [teaser, setTeaser] = useState("");
  const [chat, setChat] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [email, setEmail] = useState("");
  const [subResult, setSubResult] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");

  // Fetch images from Google Drive
  const fetchImages = async () => {
    const res = await fetch(`${API}/drive/images`);
    setImages(await res.json());
  };

  // Moderate selected image
  const checkImage = async (img) => {
    setSelected(img);
    setModeration(null);
    setPost("");
    setTeaser("");
    const res = await fetch(`${API}/moderation/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: img.webViewLink }),
    });
    setModeration(await res.json());
  };

  // Generate post
  const handlePostGen = async () => {
    const res = await fetch(`${API}/social/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageDesc: selected.name, platform }),
    });
    const data = await res.json();
    setPost(data.post);
  };

  // Generate teaser
  const handleTeaserGen = async () => {
    const res = await fetch(`${API}/teaser/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageDesc: selected.name }),
    });
    const data = await res.json();
    setTeaser(data.teaser);
  };

  // Chat
  const sendChat = async () => {
    setChat([...chat, { from: "user", text: chatInput }]);
    const res = await fetch(`${API}/chat/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: chatInput }),
    });
    const data = await res.json();
    setChat((c) => [...c, { from: "ai", text: data.reply }]);
    setChatInput("");
  };

  // Subscribe
  const subscribe = async () => {
    const res = await fetch(`${API}/subscription/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setSubResult(data.message);
  };

  // Generate image from prompt
  const handleImageGen = async () => {
    setGeneratedImage("");
    const res = await fetch(`${API}/image/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: imagePrompt }),
    });
    const data = await res.json();
    setGeneratedImage(data.image);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>AI Social Gemini + Google Drive</h1>
      <button onClick={fetchImages}>Load My Drive Images</button>
      <div style={{ display: "flex", gap: 20 }}>
        <div>
          <h2>Images</h2>
          {images.map((img) => (
            <div key={img.id} style={{ margin: 10 }}>
              <img src={img.thumbnailLink || img.webContentLink || img.webViewLink} alt={img.name} width={100} /><br />
              {img.name}
              <button onClick={() => checkImage(img)}>Moderate</button>
            </div>
          ))}
        </div>
        <div>
          <h2>Selected Image</h2>
          {selected && (
            <>
              <img src={selected.webViewLink} alt={selected.name} width={200} /><br />
              {moderation && (
                <div>
                  <b>Moderation:</b> {moderation.approved ? "Approved" : `Blocked (${moderation.reason})`}
                </div>
              )}
              {moderation && moderation.approved && (
                <>
                  <div>
                    <label>
                      Platform:
                      <select value={platform} onChange={e => setPlatform(e.target.value)}>
                        <option>Twitter</option>
                        <option>Instagram</option>
                        <option>Facebook</option>
                      </select>
                    </label>
                    <button onClick={handlePostGen}>Generate Post</button><br />
                    {post && <div><b>Post:</b> {post}</div>}
                  </div>
                  <button onClick={handleTeaserGen}>Generate Teaser</button>
                  {teaser && <div><b>Teaser:</b> {teaser}</div>}
                </>
              )}
            </>
          )}
        </div>
        <div>
          <h2>Chat Assistant</h2>
          <div style={{ border: "1px solid #ccc", minHeight: 100, padding: 10 }}>
            {chat.map((c, i) => (
              <div key={i} style={{ color: c.from === "ai" ? "blue" : "black" }}>
                <b>{c.from}:</b> {c.text}
              </div>
            ))}
          </div>
          <input value={chatInput} onChange={e => setChatInput(e.target.value)} />
          <button onClick={sendChat}>Send</button>
        </div>
        <div>
          <h2>Subscribe</h2>
          <input
            placeholder="Your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <button onClick={subscribe}>Subscribe</button>
          {subResult && <div>{subResult}</div>}
        </div>
        <div>
          <h2>Generate Image (Gemini/Imagen)</h2>
          <input value={imagePrompt} onChange={e => setImagePrompt(e.target.value)} placeholder="Describe your image" style={{ width: 300 }} />
          <button onClick={handleImageGen}>Generate Image</button>
          {generatedImage && (
            generatedImage.startsWith("http") ? (
              <img src={generatedImage} alt="Generated" style={{ width: 300, marginTop: 10 }} />
            ) : (
              <img src={generatedImage} alt="Generated" style={{ width: 300, marginTop: 10 }} />
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default App;