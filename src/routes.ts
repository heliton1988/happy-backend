import { Router } from 'express';
import multer from 'multer';

import uploadConfig from './config/uploads';

import OrphanagesController from './controllers/OrphanagesController';
import UserController from './controllers/UserController';
import SessionController from './controllers/SessionController';

const routes = Router();
const upload = multer(uploadConfig);

routes.get('/orphanages', OrphanagesController.index);
routes.get('/orphanages/:id', OrphanagesController.show);
routes.post('/orphanages', upload.array('images'), OrphanagesController.create);

routes.post('/users', UserController.create);

routes.post('/session', SessionController.create);

export default routes;
