import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CarouselControl = ({ darkMode }) => {
  const [slides, setSlides] = useState([]);
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);

  const baseURL = "https://cervical.praispranav.com";
  const bgCard = darkMode
    ? "bg-dark text-white border-light"
    : "bg-light text-dark border";
  const previewBg = darkMode ? "bg-secondary text-white" : "bg-light text-dark";

  useEffect(() => {
    const key = localStorage.getItem("apiKey");
    if (!key) {
      toast.error("API Key not found in localStorage");
      return;
    }
    setApiKey(key);
  }, []);

  useEffect(() => {
    if (apiKey) fetchSlides();
  }, [apiKey]);

  const fetchSlides = async () => {
    try {
      const res = await axios.get(`${baseURL}/day-template/get-slide`, {
        headers: { "x-api-key": apiKey },
      });

      const formatted = res.data.map((slide) => ({
        ...slide,
        imageFile: null,
        preview: slide.image ? `${baseURL}/static/${slide.image}` : "",
        align: slide.align || "left",
      }));

      setSlides(formatted);
    } catch (error) {
      toast.error("Failed to load slides");
    }
  };

  const handleSlideChange = (index, field, value) => {
    const updated = [...slides];
    updated[index][field] = value;
    setSlides(updated);
  };

  const addNewSlide = () => {
    setSlides([
      ...slides,
      {
        heading: "",
        subHeading: "",
        image: "",
        imageCaption: "",
        order: slides.length,
        showButton: true,
        buttonText: "",
        buttonLink: "",
        imageFile: null,
        preview: "",
        align: "left",
      },
    ]);
  };

  const removeSlide = (index) => {
    setSlides(slides.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const uploadPromises = slides.map(async (slide, index) => {
        let filename = slide.image;

        if (slide.imageFile) {
          const formData = new FormData();
          formData.append("file", slide.imageFile);

          const uploadRes = await axios.post(
            `${baseURL}/day-template/upload/local`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                "x-api-key": apiKey,
              },
            }
          );

          filename = uploadRes.data.filename;
        }

        const payload = {
          heading: slide.heading,
          subHeading: slide.subHeading,
          image: filename,
          imageCaption: slide.imageCaption,
          order: index,
          showButton: slide.showButton,
          buttonText: slide.buttonText,
          buttonLink: slide.buttonLink,
          align: slide.align,
        };

        if (slide._id) {
          return axios.patch(
            `${baseURL}/day-template/update-slider`,
            { ...payload, _id: slide._id },
            {
              headers: { "x-api-key": apiKey },
            }
          );
        } else {
          return axios.post(`${baseURL}/day-template/add-slide`, payload, {
            headers: { "x-api-key": apiKey },
          });
        }
      });

      await Promise.all(uploadPromises);
      toast.success("Carousel updated successfully");
      await fetchSlides();
    } catch (error) {
      toast.error("Failed to save carousel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`card card-style shadow-sm p-3 ${bgCard}`}>
      <ToastContainer position="top-right" autoClose={3000} />
      <h3 className="mb-4">Slide Control</h3>

      {slides.map((slide, index) => (
        <div
          key={slide._id || index}
          className={`border rounded p-3 mb-4 ${previewBg}`}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5>Slide {index + 1}</h5>
            {slides.length > 1 && (
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => removeSlide(index)}
              >
                Remove
              </button>
            )}
          </div>

          <input
            className="form-control mb-2"
            placeholder="Heading"
            value={slide.heading}
            onChange={(e) =>
              handleSlideChange(index, "heading", e.target.value)
            }
          />

          <input
            className="form-control mb-2"
            placeholder="Sub Heading"
            value={slide.subHeading}
            onChange={(e) =>
              handleSlideChange(index, "subHeading", e.target.value)
            }
          />

          <input
            type="file"
            accept="image/*"
            className="form-control mb-2"
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onloadend = () => {
                handleSlideChange(index, "preview", reader.result);
                handleSlideChange(index, "imageFile", file);
                handleSlideChange(index, "image", "");
              };
              reader.readAsDataURL(file);
            }}
          />

          {slide.preview && (
            <img
              src={slide.preview}
              alt={`Slide ${index + 1}`}
              style={{
                width: "250px",
                height: "250px",
                objectFit: "cover",
                borderRadius: "8px",
                marginBottom: "10px",
              }}
            />
          )}

          <input
            className="form-control mb-2"
            placeholder="Image Caption"
            value={slide.imageCaption}
            onChange={(e) =>
              handleSlideChange(index, "imageCaption", e.target.value)
            }
          />

          <div className="mb-2">
            <label className="form-label">Align:</label>
            <select
              className="form-select"
              value={slide.align}
              onChange={(e) => handleSlideChange(index, "align", e.target.value)}
            >
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </div>

          <div className="d-flex align-items-center justify-content-between mb-2">
            <strong>Show Button:</strong>
            <div className="form-check form-switch">
              <input
                type="checkbox"
                className="form-check-input"
                checked={slide.showButton}
                onChange={() =>
                  handleSlideChange(index, "showButton", !slide.showButton)
                }
              />
              <label className="form-check-label">
                {slide.showButton ? "Visible" : "Hidden"}
              </label>
            </div>
          </div>

          {slide.showButton && (
            <>
              <input
                className="form-control mb-2"
                placeholder="Button Text"
                value={slide.buttonText}
                onChange={(e) =>
                  handleSlideChange(index, "buttonText", e.target.value)
                }
              />
              <input
                className="form-control mb-2"
                placeholder="Button Link"
                value={slide.buttonLink}
                onChange={(e) =>
                  handleSlideChange(index, "buttonLink", e.target.value)
                }
              />
            </>
          )}
        </div>
      ))}

      <div className="d-flex justify-content-between mt-3">
        <button
          className="btn btn-secondary"
          onClick={addNewSlide}
          disabled={loading}
        >
          + Add Slide
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Saving...
            </>
          ) : (
            "Update Carousel"
          )}
        </button>
      </div>
    </div>
  );
};

export default CarouselControl;
