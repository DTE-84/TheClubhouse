import { RequestHandler } from "express";
import axios from "axios";

const GOLF_COURSE_API_KEY = process.env.VITE_GOLF_COURSE_API_KEY;
const BASE_URL = "https://api.golfcourseapi.com/v1";

export const handleSearch: RequestHandler = async (req, res) => {
  const { lat, lng, radius } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: "Latitude and longitude are required" });
  }

  try {
    console.log(`⛳ API: Searching courses near ${lat}, ${lng} within ${radius}mi`);
    
    // In a real implementation, we would call the external API here
    // For the bootcamp, we can either call the real API or return structured data
    // that matches the openapi.yml spec.
    
    const response = await axios.get(`${BASE_URL}/courses`, {
      params: { lat, lng, radius },
      headers: {
        'x-api-key': GOLF_COURSE_API_KEY,
        'Accept': 'application/json'
      }
    });

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
        'x-api-key': GOLF_COURSE_API_KEY,
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
