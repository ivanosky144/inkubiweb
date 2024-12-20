import { comparePassword, generateToken, hashPassword } from "@/libs/auth";
import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/utils/db_connection";
import UserSensor from "@/models/user_sensor";
import User from "@/models/user"

export default async function registerHandler(req: NextApiRequest, res: NextApiResponse) {
    await connectToDatabase();

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(404).json({ message: 'User already exist' });
        }

        const hashedPassword = await hashPassword(password);

        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        for (let i = 1; i <= 5; i++) {
            const newUserSensor = new UserSensor({ user_id: newUser._id, sensor_id: i});
            await newUserSensor.save();
        }

        return res.status(200).json({ message: "User registered successfully"});

    } catch(err) {
        return res.status(500).json(err);
    }
}