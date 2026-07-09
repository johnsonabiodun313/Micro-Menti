const supabase = require("../config/supabase");

exports.createPresentation = async (req, res) => {
  const { title } = req.body;
  const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
  const { data, error } = await supabase
    .from("presentations")
    .insert([{ room_code: roomCode, title: title }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ session: data[0] });
};

exports.archivePresentation = async (req, res) => {
  const { room_code } = req.params;
  const { final_snapshot } = req.body;
  const { data, error } = await supabase
    .from("presentations")
    .update({ final_snapshot })
    .eq("room_code", room_code)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ session: data[0] });
};
