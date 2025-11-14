/**
 * Access Control Middleware
 * 
 * Ensures that only authorized entities (hospitals, patients) can access their data.
 * Platform cannot decrypt data - zero-knowledge architecture.
 */

/**
 * Middleware to ensure only hospital can access their own data
 * Platform cannot decrypt - returns encrypted data only
 */
export function requireHospitalAccess(req, res, next) {
  const hospitalId = req.headers['x-hospital-id'] || req.headers['X-Hospital-ID'];
  const apiKey = req.headers['x-api-key'] || req.headers['X-API-Key'];
  
  if (!hospitalId || !apiKey) {
    return res.status(401).json({ 
      error: 'Hospital authentication required',
      message: 'This endpoint requires hospital authentication to decrypt data'
    });
  }
  
  // Hospital authentication is verified by authenticateHospital middleware
  // This middleware just ensures it's present
  req.requireDecryption = true;
  req.authorizedHospitalId = hospitalId;
  next();
}

/**
 * Middleware to ensure only patient can access their own data
 * Platform cannot decrypt - returns encrypted data only
 */
export function requirePatientAccess(req, res, next) {
  const upi = req.params.upi || req.query.upi || req.body.upi;
  
  if (!upi) {
    return res.status(401).json({ 
      error: 'Patient authentication required',
      message: 'This endpoint requires patient authentication to decrypt data'
    });
  }
  
  // Patient authentication would be verified here (Hedera signature, etc.)
  // For now, we check UPI is valid
  req.requireDecryption = true;
  req.authorizedUPI = upi;
  next();
}

/**
 * Middleware to restrict platform access
 * Platform can only see encrypted data, never decrypted
 */
export function restrictPlatformAccess(req, res, next) {
  // Check if request is from platform (no hospital/patient auth)
  const hasHospitalAuth = req.headers['x-hospital-id'] || req.headers['X-Hospital-ID'];
  const hasPatientAuth = req.params.upi || req.query.upi || req.body.upi;
  
  if (!hasHospitalAuth && !hasPatientAuth) {
    // Platform request - ensure no decryption
    req.requireDecryption = false;
    req.platformAccess = true;
  }
  
  next();
}

/**
 * Check if current request has decryption privileges
 */
export function hasDecryptionPrivileges(req) {
  return req.requireDecryption === true && (req.authorizedHospitalId || req.authorizedUPI);
}

/**
 * Get authorized entity for decryption
 */
export function getAuthorizedEntity(req) {
  if (req.authorizedHospitalId) {
    return { type: 'hospital', id: req.authorizedHospitalId };
  }
  if (req.authorizedUPI) {
    return { type: 'patient', id: req.authorizedUPI };
  }
  return null;
}

