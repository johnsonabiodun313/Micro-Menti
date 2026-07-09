const express = require("express");
const router = express.Router();
const hostController = require("../controllers/hostController");
const participantController = require("../controllers/participantController");

// Host Flow
router.post("/", hostController.createPresentation);
router.post("/:room_code/archive", hostController.archivePresentation);

// Participant Flow
router.get("/:room_code", participantController.validateRoom);

module.exports = router;
