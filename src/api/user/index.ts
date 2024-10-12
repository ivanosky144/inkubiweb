import { connectToDatabase } from "@/utils/db_connection";
import user from "@/models/user";
import type { NextApiRequest, NextApiResponse } from "next";
import authMiddleware from "@/middleware/auth_middleware";

async function handleUserRequests(req: NextApiRequest, res: NextApiResponse) {
    await connectToDatabase();

    switch(req.method) {
        case 'GET':
            return getAllUsers(res);
        default:
            return
    }
}

async function getAllUsers(res: NextApiResponse) {
    const users = await user.find();
    return res.status(200).json(users);
}

export default authMiddleware(handleUserRequests);
