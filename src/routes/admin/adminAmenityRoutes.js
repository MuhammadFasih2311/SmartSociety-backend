import express from 'express';
import { authMiddleware, authorize } from '../../middleware/auth.js';
import {
  getAllAmenities,
  getAmenityById,
  createAmenity,
  updateAmenity,
  deleteAmenity,
  updateAmenityStatus,
  getAmenityStats
} from '../../controllers/admin/adminAmenityController.js';

const router = express.Router();

router.use(authMiddleware);
router.use(authorize('admin'));


router.get('/stats', getAmenityStats);        
router.get('/', getAllAmenities);             
router.post('/', createAmenity);             
router.put('/:id', updateAmenity);       
router.patch('/:id/status', updateAmenityStatus);  
router.delete('/:id', deleteAmenity);        
router.get('/:id', getAmenityById);        

export default router;