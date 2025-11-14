/**
 * Researcher API Routes
 * 
 * Routes for researcher registration, verification, and data marketplace access.
 */

import express from 'express';
import { registerResearcher, verifyResearcher, rejectResearcherVerification } from '../services/researcher-registry-service.js';
import { 
  createResearcher, 
  getResearcher, 
  getResearcherByEmail,
  researcherExists,
  updateResearcher,
  getAllResearchers
} from '../db/researcher-db.js';
import { verifyAdminToken, extractTokenFromHeader } from '../services/admin-auth-service.js';

const router = express.Router();

/**
 * Admin authentication middleware
 */
async function authenticateAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers['x-admin-token'];
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Please provide a valid admin token'
      });
    }

    const admin = await verifyAdminToken(token);
    req.admin = admin;
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    return res.status(401).json({
      error: 'Unauthorized',
      message: error.message || 'Invalid admin token'
    });
  }
}

/**
 * @swagger
 * /api/researcher/register:
 *   post:
 *     summary: Register a new researcher
 *     description: Register a new researcher account. Creates a Hedera account automatically. Verification is required before purchasing datasets.
 *     tags: [Researcher]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - organizationName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "researcher@example.com"
 *                 description: Researcher's email address
 *               organizationName:
 *                 type: string
 *                 example: "Medical Research Institute"
 *                 description: Name of the research organization
 *               contactName:
 *                 type: string
 *                 example: "Dr. Jane Smith"
 *                 description: Contact person's name (optional)
 *               country:
 *                 type: string
 *                 example: "United States"
 *                 description: Country of the organization (optional)
 *     responses:
 *       200:
 *         description: Researcher registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 researcher:
 *                   $ref: '#/components/schemas/Researcher'
 *                 message:
 *                   type: string
 *                   example: "Researcher registered successfully"
 *       400:
 *         description: Bad request - missing required fields or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */
/**
 * POST /api/researcher/register
 * Register a new researcher
 */
router.post('/register', async (req, res) => {
  try {
    const { email, organizationName, contactName, country } = req.body;
    
    if (!email || !organizationName) {
      return res.status(400).json({ 
        error: 'Email and organization name are required' 
      });
    }
    
    // Registration number and verification documents should only be submitted during verification, not registration
    
    const researcher = await registerResearcher(
      { email, organizationName, contactName, country },
      async (email) => {
        return await researcherExists(email);
      },
      async (researcherRecord) => {
        return await createResearcher(researcherRecord);
      }
    );
    
    res.json({
      message: 'Researcher registered successfully',
      researcher: {
        ...researcher,
        // Always prompt for verification
        verificationPrompt: true,
        verificationMessage: 'Please verify your account to access full features and better pricing.'
      }
    });
  } catch (error) {
    console.error('Error registering researcher:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/researcher/:researcherId
 * Get researcher information
 */
router.get('/:researcherId', async (req, res) => {
  try {
    const { researcherId } = req.params;
    const researcher = await getResearcher(researcherId);
    
    if (!researcher) {
      return res.status(404).json({ error: 'Researcher not found' });
    }
    
    // Always include verification prompt if not verified
    const response = {
      ...researcher,
      verificationPrompt: researcher.verificationStatus !== 'verified',
      verificationMessage: researcher.verificationStatus !== 'verified' 
        ? 'Please verify your account to access full features and better pricing.'
        : null
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching researcher:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/researcher/email/:email
 * Get researcher by email
 */
router.get('/email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const researcher = await getResearcherByEmail(email);
    
    if (!researcher) {
      return res.status(404).json({ error: 'Researcher not found' });
    }
    
    // Always include verification prompt if not verified
    const response = {
      ...researcher,
      verificationPrompt: researcher.verificationStatus !== 'verified',
      verificationMessage: researcher.verificationStatus !== 'verified' 
        ? 'Please verify your account to access full features and better pricing.'
        : null
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching researcher:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/researcher/:researcherId/verify
 * Submit verification documents (researcher action)
 */
router.post('/:researcherId/verify', async (req, res) => {
  try {
    const { researcherId } = req.params;
    const { documents } = req.body;
    
    if (!documents) {
      return res.status(400).json({ 
        error: 'Verification documents are required' 
      });
    }
    
    // Validate that at least one document is provided
    const hasOrganizationDoc = documents.organizationDocuments && 
      (documents.organizationDocuments.startsWith('data:') || 
       documents.organizationDocuments.startsWith('http://') || 
       documents.organizationDocuments.startsWith('https://'));
    
    const hasResearchLicense = documents.researchLicense && 
      (documents.researchLicense.startsWith('data:') || 
       documents.researchLicense.startsWith('http://') || 
       documents.researchLicense.startsWith('https://'));
    
    const hasAdditionalDocs = documents.additionalDocuments && 
      (documents.additionalDocuments.startsWith('data:') || 
       documents.additionalDocuments.startsWith('http://') || 
       documents.additionalDocuments.startsWith('https://'));
    
    if (!hasOrganizationDoc && !hasResearchLicense && !hasAdditionalDocs) {
      return res.status(400).json({ 
        error: 'At least one verification document is required. Please provide either a file upload or a URL link to the document.' 
      });
    }
    
    // Update researcher with verification documents
    await updateResearcher(researcherId, {
      verificationDocuments: typeof documents === 'string' ? documents : JSON.stringify(documents),
      verificationStatus: 'pending' // Reset to pending for admin review
    });
    
    res.json({
      message: 'Verification documents submitted successfully. Admin will review your application.',
      researcherId,
      verificationStatus: 'pending'
    });
  } catch (error) {
    console.error('Error submitting verification:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/researcher/:researcherId/verification-status
 * Get verification status
 */
router.get('/:researcherId/verification-status', async (req, res) => {
  try {
    const { researcherId } = req.params;
    const researcher = await getResearcher(researcherId);
    
    if (!researcher) {
      return res.status(404).json({ error: 'Researcher not found' });
    }
    
    let verificationDocuments = null;
    let hasDocuments = false;
    if (researcher.verificationDocuments) {
      try {
        verificationDocuments = typeof researcher.verificationDocuments === 'string' 
          ? JSON.parse(researcher.verificationDocuments) 
          : researcher.verificationDocuments;
        
        // Check if documents are actually submitted (not empty object)
        hasDocuments = verificationDocuments && 
          Object.keys(verificationDocuments).length > 0 && 
          (verificationDocuments.organizationDocuments || 
           verificationDocuments.researchLicense || 
           verificationDocuments.additionalDocuments);
      } catch (e) {
        verificationDocuments = { raw: researcher.verificationDocuments };
        hasDocuments = false;
      }
    }
    
    // Determine verification message based on status and whether documents were submitted
    let verificationMessage = null;
    if (researcher.verificationStatus === 'verified') {
      verificationMessage = null; // No prompt needed
    } else if (researcher.verificationStatus === 'rejected') {
      // Check if there's a specific rejection reason
      let rejectionReason = null;
      if (verificationDocuments && typeof verificationDocuments === 'object') {
        rejectionReason = verificationDocuments.rejectionReason;
      }
      
      if (rejectionReason) {
        verificationMessage = `Your verification was rejected: ${rejectionReason}. Please submit new documents to verify your account.`;
      } else {
        verificationMessage = 'Your verification was rejected. Please submit new documents to verify your account.';
      }
    } else if (hasDocuments) {
      verificationMessage = 'Your verification is pending review. Please wait for admin approval.';
    } else {
      verificationMessage = 'Please verify your account to access full features and better pricing.';
    }
    
    res.json({
      researcherId: researcher.researcherId,
      verificationStatus: researcher.verificationStatus,
      accessLevel: researcher.accessLevel,
      verifiedAt: researcher.verifiedAt,
      verifiedBy: researcher.verifiedBy,
      verificationDocuments: verificationDocuments,
      verificationPrompt: researcher.verificationStatus !== 'verified',
      verificationMessage: verificationMessage
    });
  } catch (error) {
    console.error('Error fetching verification status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin-only routes below
router.use(authenticateAdmin);

/**
 * GET /api/researcher/admin/researchers
 * List all researchers (admin only)
 */
router.get('/admin/researchers', async (req, res) => {
  try {
    const researchers = await getAllResearchers();
    
    res.json({
      total: researchers.length,
      researchers: researchers.map(r => ({
        ...r,
        verificationPrompt: r.verificationStatus !== 'verified'
      }))
    });
  } catch (error) {
    console.error('Error fetching researchers:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/researcher/admin/researchers/:researcherId
 * Get detailed researcher information (admin only)
 */
router.get('/admin/researchers/:researcherId', async (req, res) => {
  try {
    const { researcherId } = req.params;
    const researcher = await getResearcher(researcherId);
    
    if (!researcher) {
      return res.status(404).json({ error: 'Researcher not found' });
    }
    
    let verificationDocuments = null;
    if (researcher.verificationDocuments) {
      try {
        verificationDocuments = typeof researcher.verificationDocuments === 'string' 
          ? JSON.parse(researcher.verificationDocuments) 
          : researcher.verificationDocuments;
      } catch (e) {
        verificationDocuments = { raw: researcher.verificationDocuments };
      }
    }
    
    res.json({
      ...researcher,
      verificationDocuments: verificationDocuments
    });
  } catch (error) {
    console.error('Error fetching researcher:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/researcher/admin/researchers/:researcherId/verify
 * Approve researcher verification (admin only)
 */
router.post('/admin/researchers/:researcherId/verify', async (req, res) => {
  try {
    const { researcherId } = req.params;
    const adminId = req.admin.username;
    
    const researcher = await verifyResearcher(
      researcherId,
      adminId,
      async (id, updates) => {
        return await updateResearcher(id, updates);
      }
    );
    
    res.json({
      message: 'Researcher verified successfully',
      researcher: {
        ...researcher,
        verificationPrompt: false
      }
    });
  } catch (error) {
    console.error('Error verifying researcher:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/researcher/admin/researchers/:researcherId/reject
 * Reject researcher verification (admin only)
 */
router.post('/admin/researchers/:researcherId/reject', async (req, res) => {
  try {
    const { researcherId } = req.params;
    const { reason } = req.body;
    const adminId = req.admin.username;
    
    const researcher = await rejectResearcherVerification(
      researcherId,
      adminId,
      reason || 'Verification documents did not meet requirements',
      async (id, updates) => {
        return await updateResearcher(id, updates);
      }
    );
    
    res.json({
      message: 'Researcher verification rejected',
      researcher: {
        ...researcher,
        verificationPrompt: true,
        verificationMessage: 'Your verification was rejected. Please submit new documents.'
      }
    });
  } catch (error) {
    console.error('Error rejecting researcher:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

