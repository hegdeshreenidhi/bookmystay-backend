import React from "react";

const AboutPage = () => {
  return (
    <div className="px-6 md:px-20 py-30">
      <h1 className="text-4xl font-bold text-center mb-10">About Us</h1>

      <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto">
        Welcome to <b>Reserve My Escape</b>. We provide luxury and comfort for
        travelers who want a relaxing stay. Our hotel booking platform helps
        guests discover beautiful rooms, enjoy premium services, and create
        unforgettable memories.
      </p>

      <div className="grid md:grid-cols-3 gap-10 mt-16">
        <div className="shadow-lg p-6 rounded-xl text-center">
          <h2 className="text-xl font-semibold mb-3">Luxury Rooms</h2>
          <p className="text-gray-600">
            Spacious rooms with modern interiors and world-class comfort.
          </p>
        </div>

        <div className="shadow-lg p-6 rounded-xl text-center">
          <h2 className="text-xl font-semibold mb-3">Best Locations</h2>
          <p className="text-gray-600">
            Our hotels are located in beautiful destinations around the world.
          </p>
        </div>

        <div className="shadow-lg p-6 rounded-xl text-center">
          <h2 className="text-xl font-semibold mb-3">24/7 Service</h2>
          <p className="text-gray-600">
            Our staff is available anytime to make your stay comfortable.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;