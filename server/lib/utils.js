// lib/utils.js

import jwt from "jsonwebtoken";

// ✅ Function now accepts userId as a parameter
export const generateToken = (userId) => {
  // ✅ userId is now passed and used properly
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d", // ✅ Optional: Set token expiry
  });
  return token;
};
