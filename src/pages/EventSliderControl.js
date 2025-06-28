import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";

const baseURL = "https://cervical.praispranav.com";

const EventSliderControl = ({ darkMode }) => {
  const [events, setEvents] = useState([]);
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);

  const cardClass = darkMode
    ? "bg-dark text-white border-light"
    : "bg-white text-dark border";
  const formClass = darkMode ? "bg-secondary text-white" : "bg-light";

  useEffect(() => {
    const key = localStorage.getItem("apiKey");
    if (!key) {
      toast.error("API key not found");
      return;
    }
    setApiKey(key);
  }, []);

  useEffect(() => {
    if (apiKey) fetchEvents();
  }, [apiKey]);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${baseURL}/day-template/get-events`, {
        headers: { "x-api-key": apiKey },
      });
      const data = res.data.map((e) => {
        const dateObj = new Date(e.eventDate);
        return {
          ...e,
          preview: `${baseURL}/static/${e.image}`,
          imageFile: null,
          eventDate: moment(dateObj).format("YYYY-MM-DD"),
          eventTime: moment(dateObj).format("hh:mm"),
        };
      });
      setEvents(data);
    } catch {
      toast.error("Failed to fetch events");
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...events];
    updated[index][field] = value;
    setEvents(updated);
  };

  const handleImageChange = (index, file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      handleChange(index, "imageFile", file);
      handleChange(index, "preview", reader.result);
      handleChange(index, "image", "");
    };
    reader.readAsDataURL(file);
  };

  const addNewEvent = () => {
    setEvents([
      ...events,
      {
        heading: "",
        subHeading: "",
        image: "",
        eventDate: new Date().toISOString().split("T")[0],
        eventTime: "09:00",
        imageFile: null,
        preview: "",
      },
    ]);
  };

  const deleteEvent = async (id) => {
    try {
      await axios.delete(`${baseURL}/day-template/delete-event`, {
        headers: { "x-api-key": apiKey },
        data: { _id: id },
      });
      toast.success("Deleted successfully");
      fetchEvents();
    } catch {
      toast.error("Delete failed");
    }
  };

  const saveEvents = async () => {
    setLoading(true);
    try {
      for (let event of events) {
        let filename = event.image;

        if (event.imageFile) {
          const formData = new FormData();
          formData.append("file", event.imageFile);
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
          heading: event.heading,
          subHeading: event.subHeading,
          image: filename,
          eventDate: new Date(
            `${event.eventDate}T${event.eventTime}:00`
          ).toISOString(),
        };

        if (event._id) {
          await axios.patch(
            `${baseURL}/day-template/update-event`,
            {
              ...payload,
              _id: event._id,
            },
            { headers: { "x-api-key": apiKey } }
          );
        } else {
          await axios.post(`${baseURL}/day-template/create-event`, payload, {
            headers: { "x-api-key": apiKey },
          });
        }
      }

      toast.success("Events saved!");
      fetchEvents();
    } catch (e) {
      toast.error("Error saving events");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`card p-4 mb-5 ${cardClass}`}>
      <ToastContainer position="top-right" autoClose={3000} />
      <h3 className="mb-4">Events Control</h3>

      {events.map((event, index) => (
        <div
          key={event._id || index}
          className={`p-3 mb-4 rounded border ${formClass}`}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5>Event {index + 1}</h5>
            {event._id && (
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => deleteEvent(event._id)}
              >
                Delete
              </button>
            )}
          </div>

          <input
            className="form-control mb-2"
            placeholder="Heading"
            value={event.heading}
            onChange={(e) => handleChange(index, "heading", e.target.value)}
          />
          <input
            className="form-control mb-2"
            placeholder="Subheading"
            value={event.subHeading}
            onChange={(e) => handleChange(index, "subHeading", e.target.value)}
          />
          <div className="row">
            <div className="col-md-6 mb-2">
              <input
                type="date"
                className="form-control"
                value={event.eventDate || ""}
                onChange={(e) =>
                  handleChange(index, "eventDate", e.target.value)
                }
              />
            </div>
            <div className="col-md-6 mb-2">
              <input
                type="time"
                className="form-control"
                value={event.eventTime || ""}
                onChange={(e) =>
                  handleChange(index, "eventTime", e.target.value)
                }
              />
            </div>
          </div>

          <input
            type="file"
            accept="image/*"
            className="form-control mb-2"
            onChange={(e) => handleImageChange(index, e.target.files[0])}
          />
          {event.preview && (
            <img
              src={event.preview}
              alt={`preview-${index}`}
              className="mb-2 rounded"
              style={{ width: "200px", height: "150px", objectFit: "cover" }}
            />
          )}
        </div>
      ))}

      <div className="d-flex justify-content-between mt-4">
        <button
          className="btn btn-secondary"
          onClick={addNewEvent}
          disabled={loading}
        >
          + Add Event
        </button>
        <button
          className="btn btn-primary"
          onClick={saveEvents}
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
            "Save Events"
          )}
        </button>
      </div>
    </div>
  );
};

export default EventSliderControl;
