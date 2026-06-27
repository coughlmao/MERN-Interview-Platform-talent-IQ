import express, {Router} from 'express'

import { getStreamToken } from '../controllers/chatController.js'
import { protectRoute } from '../middlewares/protectRoute.js'

const router: Router = express.Router()

router.get('/token', protectRoute, getStreamToken)

export default router