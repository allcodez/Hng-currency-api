import { Router } from 'express';
import { CountryController } from '../controllers/country.controller';

const router = Router();
const controller = new CountryController();

router.get('/status', (req, res) => controller.getStatus(req, res));

router.post('/countries/refresh', (req, res) => controller.refreshCountries(req, res));

router.get('/countries/image', (req, res) => controller.getSummaryImage(req, res));

router.get('/countries', (req, res) => controller.getAllCountries(req, res));

router.get('/countries/:name', (req, res) => controller.getCountryByName(req, res));

router.delete('/countries/:name', (req, res) => controller.deleteCountry(req, res));

export default router;