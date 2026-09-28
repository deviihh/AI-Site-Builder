import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";

const createToken = (userId: string) =>
  jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: "7d" });

export const register = async (req: Request, res: Response) => {
  try {
    const { name, password } = req.body;
    const email = String(req.body.email || "").toLowerCase().trim();

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    res.status(201).json({
      token: createToken(user.id),
      user: { id: user.id, name: user.name, email: user.email, credits: user.credits },
    });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    const email = String(req.body.email || "").toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password || "", user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      token: createToken(user.id),
      user: { id: user.id, name: user.name, email: user.email, credits: user.credits },
    });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      user: { id: user.id, name: user.name, email: user.email, credits: user.credits },
    });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};