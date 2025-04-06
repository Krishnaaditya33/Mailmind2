// In about.js
import React from 'react';
import NavBar from '../components/NavBar'; // Correct import

const About = () => {
  return (
    <div>
      <NavBar /> {/* Using the NavBar component */}
      <h1>About Page</h1>
      {/* Your content */}
    </div>
  );
};

export default About;
