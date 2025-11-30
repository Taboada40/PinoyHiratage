import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/Header";
import "../../styles/customer/review.css";

const Review = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const productId = location.state?.productId; // get productId from state

  if (!productId) {
    return (
      <div className="review-page">
        <Header showNav={true} />
        <p style={{ padding: "50px", textAlign: "center" }}>
          No product selected for review.
        </p>
      </div>
    );
  }

  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [message, setMessage] = useState("");

  const tags = [
    "Excellent","Amazing","High Quality","Well-Made",
    "Loved it","Highly Recommended","Satisfied","Great Value",
    "Comfortable","Very Good","Medium","Bad Product"
  ];

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const resizeImage = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 1200;
        canvas.height = 1200;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, 1200, 1200);
        canvas.toBlob((blob) => {
          const resizedFile = new File([blob], file.name, { type: file.type });
          resolve({ file: resizedFile, preview: URL.createObjectURL(resizedFile) });
        }, file.type);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    let newFiles = [...mediaFiles];
    let error = "";

    for (const file of files) {
      const isVideo = file.type.startsWith("video");
      const hasVideoAlready = newFiles.some(f => f.file.type.startsWith("video"));

      if (isVideo && hasVideoAlready) {
        error = "Only 1 video is allowed.";
        continue;
      }

      if (newFiles.length >= 5) {
        error = "Maximum 5 files allowed.";
        continue;
      }

      if (isVideo) {
        newFiles.push({ file, preview: URL.createObjectURL(file) });
      } else {
        const resizedImage = await resizeImage(file);
        newFiles.push(resizedImage);
      }
    }

    if (error) {
      setMessage(error);
      setTimeout(() => setMessage(""), 3000);
    }

    setMediaFiles(newFiles);
  };

  const removeFile = (index) => {
    URL.revokeObjectURL(mediaFiles[index].preview);
    const updatedFiles = [...mediaFiles];
    updatedFiles.splice(index, 1);
    setMediaFiles(updatedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating) {
      setMessage("Please select a rating.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    const formData = new FormData();
    formData.append("productId", productId);
    formData.append("rating", rating);
    formData.append("description", description);
    formData.append("tags", JSON.stringify(selectedTags));

    mediaFiles.forEach((item, index) => {
      formData.append("mediaFiles", item.file);
    });

    try {
      const response = await fetch(`http://localhost:8080/api/products/${productId}/reviews`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to submit review");

      alert("Review submitted!");
      navigate(`/product/${productId}`);
    } catch (err) {
      console.error(err);
      setMessage("Failed to submit review. Please try again.");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="review-page">
      <Header showNav={true} />
      <div className="review-card">
        <h2 className="review-title">Leave a Review</h2>

        {/* Star Rating */}
        <div className="stars">
          {[1,2,3,4,5].map(star => (
            <span
              key={star}
              className={star <= rating ? "star filled" : "star"}
              onClick={() => setRating(star)}
            >
              ★
            </span>
          ))}
        </div>

        {/* Tags */}
        <div className="tags-container">
          {tags.map(t => (
            <div
              key={t}
              className={`tag ${selectedTags.includes(t) ? "selected" : ""}`}
              onClick={() => toggleTag(t)}
            >
              {t}
            </div>
          ))}
        </div>

        {/* Description */}
        <textarea
          className="review-textarea"
          placeholder="Write your review here..."
          value={description}
          maxLength={300}
          onChange={(e) => setDescription(e.target.value)}
        />
        <p className="char-count">{description.length}/300</p>

        {/* Media Upload */}
        <div className="upload-box">
          <label>Upload Images/Videos (max 5 files, 1 video only):</label>
          <input type="file" accept="image/*,video/*" multiple onChange={handleFileUpload} />

          {message && <p style={{ color: "red", marginTop: "6px" }}>{message}</p>}

          <div className="preview-container">
            {mediaFiles.map((item, index) => {
              const { file, preview } = item;
              const isVideo = file.type.startsWith("video");

              return (
                <div key={index} className="preview-card">
                  {isVideo ? <video src={preview} controls /> : <img src={preview} alt="preview" />}
                  <button className="remove-btn" onClick={() => removeFile(index)}>×</button>
                </div>
              );
            })}
          </div>
        </div>

        <button className="btn-submit" onClick={handleSubmit}>Submit Review</button>
      </div>
    </div>
  );
};

export default Review;
