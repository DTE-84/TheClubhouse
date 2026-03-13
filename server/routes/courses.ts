import { RequestHandler } from "express";
import axios from "axios";

const GOLF_COURSE_API_KEY = process.env.GOLF_COURSE_API_KEY || process.env.VITE_GOLF_COURSE_API_KEY;
const BASE_URL = "https://api.golfcourseapi.com/v1";

export const handleSearch: RequestHandler = async (req, res) => {
  const { lat, lng, radius, q } = req.query;

  try {
    let response;
    
    if (q) {
      console.log(`⛳ API: Searching courses for query: "${q}"`);
      response = await axios.get(`${BASE_URL}/search`, {
        params: { search_query: q },
        headers: {
          'Authorization': GOLF_COURSE_API_KEY,
          'Accept': 'application/json'
        }
      });
    } else if (lat && lng) {
      console.log(`⛳ API: Searching courses near ${lat}, ${lng} within ${radius}mi`);
      response = await axios.get(`${BASE_URL}/courses`, {
        params: { lat, lng, radius },
        headers: {
          'Authorization': GOLF_COURSE_API_KEY,
          'Accept': 'application/json'
        }
      });
    } else {
      return res.status(400).json({ error: "Latitude/Longitude or Search Query (q) is required" });
    }

    res.json(response.data);
  } catch (error: any) {
    console.error("❌ API Error:", error.message);
    res.status(error.response?.status || 500).json({
      error: "Failed to fetch courses from provider",
      details: error.message
    });
  }
};

export const handleGetCourse: RequestHandler = async (req, res) => {
  const { id } = req.params;

  try {
    const response = await axios.get(`${BASE_URL}/courses/${id}`, {
      headers: {
        'Authorization': GOLF_COURSE_API_KEY,
        'Accept': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error: any) {
    console.error("❌ API Error:", error.message);
    res.status(error.response?.status || 500).json({
      error: "Failed to fetch course details",
      details: error.message
    });
  }
};
