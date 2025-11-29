import User from "../models/User.js";

// Admin creates user
export const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "User already exists" });

  const user = await User.create({ name, email, password, role });
  res.status(201).json({ message: "User created", user });
};

// Activate/Deactivate user
export const toggleActive = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.active = !user.active;
  await user.save();
  res.status(200).json({ message: "User status updated", user });
};

// Reassign role
export const changeRole = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.role = req.body.role;
  await user.save();
  res.status(200).json({ message: "User role updated", user });
};

// Get all users
export const getUsers = async (req, res) => {
  const users = await User.find();
  res.status(200).json(users);
};



// controllers/userController.js
// import User from "../models/User.js";

// Get all RMs
export const getRMs = async (req, res) => {
  try {
    const rms = await User.find({ role: "rm" }).select("_id name");
    res.json(rms);
  } catch (err) {
    console.error("Failed to fetch RMs:", err);
    res.status(500).json({ message: "Server error" });
  }
};