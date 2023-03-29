import { Request, Response } from 'express';
import {User} from '../models/user.model';
import {generateToken} from "../middlewares/user.mw";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registration = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send('Please provide a username and password');
    }

    // Check if the user already exists in the database
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).send('Email already taken');
    }

    // Hash the password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user in the database
    const newUser = new User({
        email,
        password: hashedPassword
    });
    await newUser.save();

    // Create a JWT token for the new user
    const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET || "secret");

    res.send(token);
};

export const findAll = async (req: Request, res: Response) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
};

export const findOne = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            res.status(404).send('User not found.');
        } else {
            res.json(user);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const user = await
            User.findByIdAndUpdate(req.params.userId, req.body, {
                new: true,
                useFindAndModify: false
            });
        if (!user) {
            res.status(404).send('User not found.');
        } else {
            res.json(user);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const user = await User.findByIdAndRemove(req.params.userId, {
            useFindAndModify: false
        });
        if (!user) {
            res.status(404).send('User not found.');
        } else {
            res.json(user);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.checkPassword(password)) {
        res.status(401).send('Invalid email or password');
    } else {
        const token = generateToken(user.id, user.email);
        res.json({ token });
    }
}

