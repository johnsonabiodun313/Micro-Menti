// controllers/participantController.js
const supabase = require("../config/supabase");

exports.validateRoom = async (req, res) => {
  // 1. Convert the incoming URL parameter to uppercase immediately
  const room_code = req.params.room_code.toUpperCase();

  const { data, error } = await supabase
    .from("presentations")
    .select("*")
    .eq("room_code", room_code)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: "Room not found or inactive." });
  }

  return res.status(200).json({ message: "Room is active" });
};
