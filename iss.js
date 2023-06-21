// iss.js
const request = require('request');

/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */
const fetchMyIP = function(callback) {
  request('https://api.ipify.org?format=json', (error, response, body) => {
    if (error) return callback(error, null);

    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching IP: ${body}`), null);
      return;
    }

    const ip = JSON.parse(body).ip;
    callback(null, ip);
  });
};


const fetchCoordsByIP = (ip, callback) => {
  const url = `https://freegeoip.app/json/${ip}`;

  request(url, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }

    // const parsedBody = JSON.parse(body);
    // // check if "success" is true or not
    // if (!parsedBody.success) {
    //   const message = `Success status was ${parsedBody.success}. Server message says: ${parsedBody.message} when fetching for IP ${parsedBody.ip}`;
    //   callback(Error(message), null);
    //   return;
    // }

    if (response.statusCode !== 200) {
      const errorMessage = `Unexpected status code: ${response.statusCode}`;
      callback(errorMessage, null);
      return;
    }

    try {
      const data = JSON.parse(body);
      const coords = {
        latitude: data.latitude,
        longitude: data.longitude
      };
      callback(null, coords);
    } catch (parseError) {
      callback(parseError, null);
    }
  });
};



const fetchISSFlyOverTimes = (coords, callback) => {
  const { latitude, longitude } = coords;
  const url = `http://api.open-notify.org/iss-pass.json?lat=${latitude}&lon=${longitude}`;

  request(url, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }

    if (response.statusCode !== 200) {
      callback(Error(`Unexpected status code: ${response.statusCode}`), null);
      return;
    }

    try {
      const data = JSON.parse(body);
      const flyOverTimes = data.response;
      callback(null, flyOverTimes);
    } catch (parseError) {
      callback(parseError, null);
    }
  });
};


const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      callback(error, null);
      return;
    }

    fetchCoordsByIP(ip, (error, loc) => {
      if (error) {
        callback(error, null);
        return;
      }

      fetchISSFlyOverTimes(loc, (error, nextPasses) => {
        if (error) {
          callback(error, null);
          return;
        }

        callback(null, nextPasses);
      });
    });
  });





  
};






module.exports = { fetchMyIP, fetchCoordsByIP, fetchISSFlyOverTimes, nextISSTimesForMyLocation };