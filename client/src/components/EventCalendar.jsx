import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { axiosInstance } from "../lib/axios";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { getSocket } from "../socket/socket.client.js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const localizer = momentLocalizer(moment);

const CreateEventModal = ({ data, onChange, onSubmit, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
      <h2 className="text-xl font-semibold mb-4">Create Event</h2>

      <input
        className="w-full border p-2 mb-2 rounded"
        type="text"
        placeholder="Title"
        value={data.title}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
      />
      <textarea
        className="w-full border p-2 mb-2 rounded"
        placeholder="Description"
        value={data.description}
        onChange={(e) => onChange({ ...data, description: e.target.value })}
      />
      <input
        className="w-full border p-2 mb-2 rounded"
        type="text"
        placeholder="Location"
        value={data.location}
        onChange={(e) => onChange({ ...data, location: e.target.value })}
      />

      <label className="block text-sm font-medium mb-1">Start Time:</label>
      <DatePicker
        selected={data.start}
        onChange={(date) => onChange({ ...data, start: date })}
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={15}
        dateFormat="MMMM d, yyyy h:mm aa"
        className="w-full border p-2 mb-2 rounded"
      />

      <label className="block text-sm font-medium mb-1">End Time:</label>
      <DatePicker
        selected={data.end}
        onChange={(date) => onChange({ ...data, end: date })}
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={15}
        dateFormat="MMMM d, yyyy h:mm aa"
        className="w-full border p-2 mb-4 rounded"
      />

      <button
        onClick={onSubmit}
        className="bg-blue-500 hover:bg-blue-600 text-white w-full py-2 rounded mb-2"
      >
        Create Event
      </button>

      <button
        onClick={onClose}
        className="w-full py-2 border border-gray-300 rounded hover:bg-gray-100"
      >
        Cancel
      </button>
    </div>
  </div>
);

const EventCalendar = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [authUser, setAuthUser] = useState(null); 
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEventData, setNewEventData] = useState({
    title: "",
    description: "",
    location: "",
    start: null,
    end: null,
  });


  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        setAuthUser(res.data.user);
      } catch (err) {
        console.error("Auth fetch failed", err);
      }
    };
    fetchMe();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axiosInstance.get("/events");
        const formatted = res.data.events.map(evt => ({
          ...evt,
          title: `${evt.title} (by ${evt.creator.name})`,
          start: new Date(evt.startTime),
          end: new Date(evt.endTime),
        }));
        setEvents(formatted);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      }
    };

    fetchEvents();

  }, []);

  useEffect(() => {
    if (!authUser) return;

    const socket = getSocket();

    const handleEventUpdated = ({ eventId, attendees }) => {
      console.log("📡 Received eventUpdated for", eventId);
      setEvents(prevEvents =>
        prevEvents.map(event =>
          event._id === eventId ? { ...event, attendees } : event
        )
      );
      setSelectedEvent(prev =>
        prev?._id === eventId ? { ...prev, attendees } : prev
      );
    };

    socket.on("eventUpdated", handleEventUpdated);

    return () => {
      socket.off("eventUpdated", handleEventUpdated);
    };
  }, [authUser]);

  const handleSelectSlot = ({ start, end }) => {
    setNewEventData({ title: "", description: "", location: "", start, end });
    setShowCreateModal(true);
  };

  const handleCreateEvent = async () => {
    const { title, description, location, start, end } = newEventData;
    if (!title || !start || !end) return alert("Please fill out all required fields.");
    try {
      const res = await axiosInstance.post("/events", {
        title,
        description,
        location,
        startTime: start,
        endTime: end,
      });
      const newEvent = res.data.event;
      setEvents(prev => [
        ...prev,
        {
          ...newEvent,
          title: `${newEvent.title} (by You)`,
          start: new Date(newEvent.startTime),
          end: new Date(newEvent.endTime),
        },
      ]);
      setShowCreateModal(false);
    } catch (err) {
      console.error("Failed to create event:", err);
      alert("Error creating event");
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  const isJoined = () => {
    return selectedEvent?.attendees?.some(a => a._id === authUser?._id);
  };

  const handleJoinOrLeave = async () => {
    if (!selectedEvent) return;
    try {
      const url = `/events/${selectedEvent._id}/${isJoined() ? "leave" : "join"}`;
      await axiosInstance.post(url);

      const updatedEvents = events.map(e =>
        e._id === selectedEvent._id
          ? {
              ...e,
              attendees: isJoined()
                ? e.attendees.filter(a => a._id !== authUser._id)
                : [...(e.attendees || []), authUser],
            }
          : e
      );
      setEvents(updatedEvents);
      setSelectedEvent(null);
    } catch (err) {
      console.error("Failed to update attendance", err);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-100 p-6">
    <div className="bg-white p-4 rounded-xl shadow-md">
      <Calendar
        localizer={localizer}
        events={events}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "80vh" }}
      />
    </div>

      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
            <h2 className="text-xl font-semibold mb-2">{selectedEvent.title}</h2>
            <p className="text-sm mb-1"><strong>Description:</strong> {selectedEvent.description || "None"}</p>
            <p className="text-sm mb-1"><strong>Location:</strong> {selectedEvent.location || "Not specified"}</p>
            <p className="text-sm mb-1"><strong>Time:</strong> {moment(selectedEvent.start).format("LLL")} – {moment(selectedEvent.end).format("LLL")}</p>
            <p className="text-sm mb-2"><strong>Attendees:</strong> {selectedEvent.attendees?.map(a => a.name).join(", ") || "None yet"}</p>
            {authUser && selectedEvent.creator._id !== authUser._id && (
              <button
                className={`mt-4 w-full py-2 rounded ${
                  isJoined() ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
                } text-white`}
                onClick={handleJoinOrLeave}
              >
                {isJoined() ? "Leave Event" : "Join Event"}
              </button>
            )}
            <button
              className="mt-2 w-full py-2 border border-gray-300 rounded hover:bg-gray-100"
              onClick={() => setSelectedEvent(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {showCreateModal && (
  <CreateEventModal
    data={newEventData}
    onChange={setNewEventData}
    onSubmit={handleCreateEvent}
    onClose={() => setShowCreateModal(false)}
  />
)}
    </div>
  );
};

export default EventCalendar;
