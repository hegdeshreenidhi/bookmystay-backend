import React from "react";
import { Link } from "react-router-dom";



const Hero = () => {
  return (
    <div
      className='flex flex-col items-center justify-center 
      px-6 md:px-16 lg:px-24 xl:px-32 text-white 
      bg-[url("/src/assets/heroimage.png")] 
      bg-no-repeat bg-cover bg-center h-screen text-center'
    >
      {/* White rectangle behind heading */}
    <Link 
  to="/rooms" 
  className="mb-14 text-4xl font-semibold bg-white text-black px-6 py-3 rounded-md shadow-lg hover:bg-gray-200 transition"
>
  Book your premium hotel
</Link>

      {/* Spaced-out text */}
      <p className="mb-14 text-lg tracking-[0.5em]">
        WHERE COMFORT MEETS LUXURY
      </p>

      <p className="max-w-2xl">
        Discover a haven of comfort and elegance where modern luxury meets warm hospitality. 
        Nestled in the heart of <u>Kumta</u>, 
        our hotel offers beautifully designed rooms and suites,
        each thoughtfully crafted to provide relaxation and convenience.
      </p>
      

    </div>
  );
};

export default Hero;