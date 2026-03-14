import { useState } from "react";
import "./upload.css";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";

const API_URL = "http://localhost:5000/api";

export default function Upload() {
  const [imagePreview, setImagePreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // When user selects an image:
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file)); // preview
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert("Please select an image first!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please sign in to upload posts!");
      navigate("/signin");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("caption", caption);

      const response = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert("Post uploaded successfully!");
        navigate("/home");
      } else {
        alert(data.message || "Failed to upload post");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <Navigation />
      <div className="upload-shell">
        <h2 className="upload-title">Upload Photo</h2>

        <form onSubmit={handleSubmit}>
          {/* Image Preview */}
          {imagePreview ? (
            <img src={imagePreview} className="upload-preview" alt="preview" />
          ) : (
            <div className="upload-placeholder">
              Select an image to preview
            </div>
          )}

          {/* File Input */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="upload-input"
            required
            disabled={loading}
          />

          {/* Caption */}
          <textarea
            className="upload-caption"
            placeholder="Write a caption..."
            rows="3"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={loading}
          ></textarea>

          {/* Submit Button */}
          <button type="submit" className="upload-button" disabled={loading}>
            {loading ? "Uploading..." : "Post"}
          </button>
        </form>
      </div>
    </div>
  );
}
