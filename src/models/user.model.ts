import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface UserInterface extends Document {
    email: string;
    password: string;
    checkPassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<UserInterface>({
    email: { type: String, required: true },
    password: { type: String, required: true },
});

UserSchema.pre<UserInterface>('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.methods.checkPassword = async function (password: string) {
    return bcrypt.compare(password, this.password);
};

export const User = model<UserInterface>('User', UserSchema);
