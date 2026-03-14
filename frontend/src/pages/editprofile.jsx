import { useEffect, useState } from "react";
import "./editprofile.css";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";

const API_URL = "http://localhost:5000/api";
const DEFAULT_AVATAR = "https://via.placeholder.com/120";

export default function EditProfile() {
  const [profilePicPreview, setProfilePicPreview] = useState(DEFAULT_AVATAR);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/users/me/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            navigate("/signin");
          }
          return;
        }

        const data = await response.json();
        const user = data.user || {};

        setFullName(user.name || "");
        setUsername(user.username || "");
        setBio(user.bio || "");
        setProfilePicPreview(
          user.profilePic
            ? user.profilePic.startsWith("http")
              ? user.profilePic
              : `http://localhost:5000${user.profilePic}`
            : DEFAULT_AVATAR
        );
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfilePicFile(file);
    const previewUrl = URL.createObjectURL(file);
    setProfilePicPreview(previewUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/signin");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("name", fullName);
      formData.append("username", username);
      formData.append("bio", bio);
      if (profilePicFile) {
        formData.append("profilePic", profilePicFile);
      }

      const response = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      alert("Profile updated successfully!");
      navigate("/account");
    } catch (error) {
      console.error("Update profile failed", error);
      alert(error.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-container">
        <Navigation />
        <div style={{ textAlign: "center", padding: "50px" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="edit-container">
      <Navigation />
      <h2 className="edit-title">Edit Profile</h2>

      <form onSubmit={handleSubmit}>
        {/* Profile Photo */}
        <div className="edit-photo-wrapper">
          <img
            src={profilePicPreview}
            alt="profile"
            className="edit-photo"
          />

          <label className="edit-photo-button">
            Change Photo
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={submitting}
              hidden
            />
          </label>
        </div>

        {/* Form Fields */}
        <input
          type="text"
          className="edit-input"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={submitting}
          required
        />

        <input
          type="text"
          className="edit-input"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={submitting}
          required
        />

        <textarea
          className="edit-textarea"
          placeholder="Bio"
          rows="3"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          disabled={submitting}
        ></textarea>

        {/* Save Button */}
        <button type="submit" className="edit-save-button" disabled={submitting}>
          {submitting ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
