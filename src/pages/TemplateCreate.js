import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const TemplateCreate = ({ darkMode }) => {
  const [file, setFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    radioButtonText: "",
  });

  const [nameCoordinate, setNameCoordinate] = useState({ x: "", y: "" });
  const [dateTimeCoordinate, setDateTimeCoordinate] = useState({
    x: "",
    y: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const templatesPerPage = 6;

  const themeCard = darkMode
    ? "bg-dark text-white border-light"
    : "bg-light text-dark border";
  const inputBg = darkMode ? "bg-secondary text-white" : "";

  const baseURL = "https://cervical.praispranav.com";

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${baseURL}/day-template/get-template`, {
        headers: {
          "x-api-key": localStorage.getItem("apiKey"),
        },
      });

      const text = await res.text();
      let data = [];
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.warn("JSON parse error:", err);
      }

      const validTemplates = data.filter(
        (t) => t.name && t.radioButtonText && t.file
      );
      setTemplates(validTemplates.reverse());
    } catch (err) {
      console.error("Failed to fetch templates", err);
    }
  };

  const indexOfLast = currentPage * templatesPerPage;
  const indexOfFirst = indexOfLast - templatesPerPage;
  const currentTemplates = templates.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(templates.length / templatesPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      const fileURL = URL.createObjectURL(uploadedFile);
      setFile(uploadedFile);
      setPreviewURL(fileURL);

      if (uploadedFile.type.includes("image")) {
        setFileType("image");
      } else if (uploadedFile.type === "application/pdf") {
        setFileType("pdf");
      } else {
        setFileType(null);
        setPreviewURL(null);
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({ name: "", radioButtonText: "" });
    setFile(null);
    setPreviewURL(null);
    setFileType(null);
    setNameCoordinate({ x: "", y: "" });
    setDateTimeCoordinate({ x: "", y: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.radioButtonText || !file) {
      return toast.error("Please fill all required fields.");
    }

    try {
      setLoading(true);

      const uploadForm = new FormData();
      uploadForm.append("file", file);

      const uploadRes = await fetch(`${baseURL}/day-template/upload/template`, {
        method: "POST",
        headers: {
          "x-api-key": localStorage.getItem("apiKey"),
        },
        body: uploadForm,
      });

      let uploadData = {};
      const uploadText = await uploadRes.text();
      if (uploadText) {
        try {
          uploadData = JSON.parse(uploadText);
        } catch (err) {
          console.warn("Upload response not JSON", err);
        }
      }

      if (!uploadRes.ok || !uploadData.filename) {
        throw new Error("File upload failed.");
      }

      const body = {
        name: formData.name,
        radioButtonText: formData.radioButtonText,
        file: uploadData.filename,
        nameCoordinate: {
          x: Number(nameCoordinate.x),
          y: Number(nameCoordinate.y),
        },
        dateTimeCoordinate: {
          x: Number(dateTimeCoordinate.x),
          y: Number(dateTimeCoordinate.y),
        },
      };

      const saveRes = await fetch(`${baseURL}/day-template/add-template`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": localStorage.getItem("apiKey"),
        },
        body: JSON.stringify(body),
      });

      const saveText = await saveRes.text();
      let saveData = {};
      if (saveText) {
        try {
          saveData = JSON.parse(saveText);
        } catch (err) {
          console.warn("Save response not JSON:", err);
        }
      }

      if (!saveRes.ok) {
        throw new Error("Template save failed.");
      }

      toast.success("Template saved successfully!");
      resetForm();
      fetchTemplates();
    } catch (err) {
      console.error("Error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`card card-style shadow-sm p-3 ${themeCard}`}>
      <h3 className="mb-4 d-flex align-items-center">Create Template</h3>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Radio Button Text:</label>
          <input
            type="text"
            name="radioButtonText"
            className={`form-control ${inputBg}`}
            placeholder="Enter radio text"
            value={formData.radioButtonText}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label>Template Name:</label>
          <input
            type="text"
            name="name"
            className={`form-control ${inputBg}`}
            placeholder="Template name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label>Upload File (Image):</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={handleFileUpload}
          />
        </div>

        {previewURL && (
          <div className="mb-3">
            <label>Preview:</label>
            <div
              className={`position-relative border rounded p-2 text-center ${
                darkMode ? "bg-secondary" : ""
              }`}
            >
              {fileType === "image" && (
                <img
                  src={previewURL}
                  alt="Preview"
                  className="img-fluid"
                  style={{ maxHeight: "300px", opacity: loading ? 0.5 : 1 }}
                />
              )}
              {fileType === "pdf" && (
                <embed
                  src={previewURL}
                  type="application/pdf"
                  width="100%"
                  height="300px"
                  style={{ opacity: loading ? 0.5 : 1 }}
                />
              )}
              {loading && (
                <div
                  className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                  style={{ background: "rgba(255,255,255,0.6)", zIndex: 10 }}
                >
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Uploading...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mb-3">
          <label>Name Coordinate (X, Y):</label>
          <div className="d-flex gap-2">
            <input
              type="number"
              className={`form-control ${inputBg}`}
              placeholder="X"
              value={nameCoordinate.x}
              onChange={(e) =>
                setNameCoordinate({ ...nameCoordinate, x: e.target.value })
              }
            />
            <input
              type="number"
              className={`form-control ${inputBg}`}
              placeholder="Y"
              value={nameCoordinate.y}
              onChange={(e) =>
                setNameCoordinate({ ...nameCoordinate, y: e.target.value })
              }
            />
          </div>
        </div>

        <div className="mb-3">
          <label>Date/Time Coordinate (X, Y):</label>
          <div className="d-flex gap-2">
            <input
              type="number"
              className={`form-control ${inputBg}`}
              placeholder="X"
              value={dateTimeCoordinate.x}
              onChange={(e) =>
                setDateTimeCoordinate({
                  ...dateTimeCoordinate,
                  x: e.target.value,
                })
              }
            />
            <input
              type="number"
              className={`form-control ${inputBg}`}
              placeholder="Y"
              value={dateTimeCoordinate.y}
              onChange={(e) =>
                setDateTimeCoordinate({
                  ...dateTimeCoordinate,
                  y: e.target.value,
                })
              }
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-success w-100"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Template"}
        </button>
      </form>

      <hr className="my-5" />

      {templates.length > 0 && (
        <div>
          <h4 className="mb-3">Live Template Previews</h4>
          <div className="row">
            {currentTemplates.map((template) => (
              <div key={template._id} className="col-md-6 col-lg-4 mb-4">
                <div className={`card h-100 shadow-sm ${themeCard}`}>
                  <div className="card-body">
                    <h5 className="card-title">{template.name}</h5>
                    <p>
                      <strong>Radio:</strong> {template.radioButtonText}
                    </p>
                    <p>
                      <strong>Name Coord:</strong> X:{" "}
                      {template.nameCoordinate?.x}, Y:{" "}
                      {template.nameCoordinate?.y}
                    </p>
                    <p>
                      <strong>Date Coord:</strong> X:{" "}
                      {template.dateTimeCoordinate?.x}, Y:{" "}
                      {template.dateTimeCoordinate?.y}
                    </p>

                    {template.file.toLowerCase().endsWith(".pdf") ? (
                      <div className="text-center mt-2">
                        <p className="text-muted">PDF File</p>
                        <a
                          href={`${baseURL}/static/${template.file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-primary btn-sm"
                        >
                          View PDF
                        </a>
                      </div>
                    ) : (
                      <div className="text-center">
                        <img
                          src={`${baseURL}/templates/${template.file}`}
                          alt={template.name}
                          className="img-fluid rounded"
                          style={{ maxHeight: "200px", objectFit: "contain" }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <nav>
                <ul className="pagination">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      Previous
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <li
                      key={i}
                      className={`page-item ${
                        currentPage === i + 1 ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TemplateCreate;
