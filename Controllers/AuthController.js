import UserService from "../Services/UserService.js";
import UserM from "../models/UserModel.js";

// Register User
async function register(req, res) {
  try {
    const { 
      fullname, 
      email, 
      phoneNumber, 
      password 
    } = req.body;

    // Check if user already exists (email or phone)
    const existingUser = await UserM.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingUser) {
      return res.status(409).json({
        status: false,
        response: "Email or Phone Number already used",
      });
    }

    // Create new user
    const createUser = new UserM({
      fullname,
      email,
      phoneNumber,
      password,
    });

    await createUser.save();
    return res.status(201).json({
      status: true,
      response: "User Registered",
    });

  } catch (error) {
    console.error("Error during user registration:", error);

    // Handle specific error related to unique fields
    if (error.keyPattern) {
      return res.status(409).json({
        status: false,
        response: Object.keys(error.keyPattern)[0] + " already used",
      });
    } else {
      return res.status(500).json({
        status: false,
        response: "Internal Server Error",
      });
    }
  }
}

// Login User
async function login(req, res) {
  try {
    const { data, password } = req.body;

    // Retrieve user by email or phone (depending on data passed)
    const user = await UserService.checkuser(data);

    if (!user) {
      return res.status(404).json({
        status: false,
        token: "",
        error: "User does not exist",
      });
    }

    // Compare passwords
    const isMatch = await UserService.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: false,
        token: "",
        error: "Invalid password",
      });
    }

    // Generate token with user data (don't include password)
    const tokenData = { _id: user._id, fullname: user.fullname };
    const token = await UserService.generateToken(tokenData, process.env.JWT_SECRET, "90d");

    // Return the user info along with the token
    return res.status(200).json({
      status: true,
      token: token, // Only send the token back to the client
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      token: "",
      error: error.message,
    });
  }
}

export default { register, login };
