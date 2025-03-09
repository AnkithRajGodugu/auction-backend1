const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("No or invalid Authorization header:", authHeader);
    return res.status(401).json({ 
      error: "Authentication required. Please provide a token in 'Bearer <token>' format." 
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    console.warn("No token found after 'Bearer' in header:", authHeader);
    return res.status(401).json({ error: "Token missing after 'Bearer' in Authorization header." });
  }

  // Verify JWT_SECRET exists
  const SECRET_KEY = process.env.JWT_SECRET;
  if (!SECRET_KEY) {
    console.error("JWT_SECRET is not defined in environment variables.");
    return res.status(500).json({ error: "Server configuration error: JWT_SECRET is missing." });
  }

  try {
    // Verify and decode token
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log("Token decoded successfully:", decoded); // Debug: { id, email, iat, exp }

    // Validate required fields in decoded payload
    if (!decoded.id || !decoded.email) {
      console.warn("Decoded token missing required fields:", decoded);
      return res.status(401).json({ 
        error: "Invalid token: Missing required fields (id or email)." 
      });
    }

    // Attach decoded user data to request
    req.user = { id: decoded.id, email: decoded.email }; // Explicitly set expected fields
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message, err.stack);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ 
        error: "Token has expired", 
        details: `Expired at: ${new Date(err.expiredAt).toISOString()}` 
      });
    } else if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        error: "Invalid token", 
        details: "Token format or signature is invalid." 
      });
    }
    return res.status(401).json({ 
      error: "Token verification failed", 
      details: err.message 
    });
  }
};

module.exports = authMiddleware;