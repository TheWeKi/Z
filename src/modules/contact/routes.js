import express from "express";
import { contact } from "./contact.controller.js";

const contact_routes = express.Router();

contact_routes.post('/', contact)

export default contact_routes;