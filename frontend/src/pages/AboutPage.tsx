const AboutPage = () => {
  return (
      <div className="container mt-4">
        <h2>About</h2>
        <p>
        The Greenhouse System is a full stack application built with the MERN stack.
        It allows you to monitor and control the environmental conditions in your greenhouse(s) remotely using your computer or smart phone.
        </p>
        <h3>Features:</h3>
        <ul>
          <li>Fetches real-time temperature, humidity, and light data from the Arduino ESP32's sensors</li>
          <li>Displays the data as charts, allowing you to easily monitor the conditions in your greenhouse</li>
          <li>Sends push notifications to your smart device if the conditions in the greenhouse are outside of the correct limits for more than two minutes</li>
          <li>Provides CRUD (Create, Read, Update, Delete) operations, enabling you to manipulate the greenhouse data through the base URL</li>
          <li>Allows you to view charts for all greenhouses based on the greenhouse ID</li>
        </ul>
        <p>
          See <a rel="stylesheet" href="http://127.0.0.1:5500/wwwroot/index.html">Docs</a> for more info on how to use the API.
        </p>
      </div>
  )
}

export default AboutPage;