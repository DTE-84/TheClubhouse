import { RequestHandler } from "express";
import axios from "axios";

const RAPIDAPI_KEY =
  process.env.RAPIDAPI_KEY || process.env.GOLF_COURSE_API_KEY;
const BASE_URL = "https://golf-course-api.p.rapidapi.com";

export const handleSearch: RequestHandler = async (req, res) => {
  const { lat, lng, radius, q } = req.query;

  try {
    let response;

    if (q) {
      console.log(`⛳ API: Searching courses for query: "${q}"`);
      response = await axios.get(`${BASE_URL}/search`, {
        params: { name: q },
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY,
          "x-rapidapi-host": "golf-course-api.p.rapidapi.com",
          "Content-Type": "application/json",
        },
      });
    } else if (lat && lng) {
      console.log(
        `⛳ API: Searching courses near ${lat}, ${lng} within ${radius}mi`,
      );
      response = await axios.get(`${BASE_URL}/search`, {
        params: { lat, lng, radius },
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY,
          "x-rapidapi-host": "golf-course-api.p.rapidapi.com",
          "Content-Type": "application/json",
        },
      });
    } else {
      return res
        .status(400)
        .json({ error: "Latitude/Longitude or Search Query (q) is required" });
    }

    res.json(response.data);
  } catch (error: any) {
    console.error("❌ API Error:", error.message);
    res.status(error.response?.status || 500).json({
      error: "Failed to fetch courses from provider",
      details: error.message,
    });
  }
};

export const handleGetCourse: RequestHandler = async (req, res) => {
  const { id } = req.params;

  // Validate course ID to avoid using arbitrary user input in the request path
  if (typeof id !== "string" || !/^[A-Za-z0-9_-]+$/.test(id)) {
    return res.status(400).json({ error: "Invalid course ID format" });
  }

  try {
    const response = await axios.get(`${BASE_URL}/course/${id}`, {
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": "golf-course-api.p.rapidapi.com",
        "Content-Type": "application/json",
      },
    });

    res.json(response.data);
  } catch (error: any) {
    console.error("❌ API Error:", error.message);
    res.status(error.response?.status || 500).json({
      error: "Failed to fetch course details",
      details: error.message,
    });
  }
};
