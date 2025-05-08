import React from "react";
import EventCalendar from "../components/EventCalendar"; 
import Header from "../components/Header"

const EventPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-orange-100 overflow-hidden">
      <Header />
      <h1 className="text-2xl font-bold mb-4 text-center">Your Events</h1>
      <EventCalendar />
    </div>
  );
};

export default EventPage;
