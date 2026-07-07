const supabase = require("../config/supabase");

exports.validateRoom = async (req, res) => {
  const { room_code } = req.params;
  const { data, error } = await supabase
    .from("presentations")
    .select("*")
    .eq("room_code", room_code)
    .single();
  if (error || !data) return res.status(404).json({ error: "Room not found." });
  return res.status(200).json({ session: data });
};
