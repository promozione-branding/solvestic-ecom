import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            trim: true,
            default: "",
        },
        mobile: {
            type: String,
            trim: true,
            default: "",
        },
        addressLine1: {
            type: String,
            trim: true,
            default: "",
        },
        addressLine2: {
            type: String,
            trim: true,
            default: "",
        },
        city: {
            type: String,
            trim: true,
            default: "",
        },
        state: {
            type: String,
            trim: true,
            default: "",
        },
        country: {
            type: String,
            trim: true,
            default: "India",
        },
        pincode: {
            type: String,
            trim: true,
            default: "",
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        // Store mobile numbers in E.164 format, e.g. +919876543210.
        mobile: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },

        password: {
            type: String,
            select: false,
        },

        addresses: {
            type: [addressSchema],
            default: [],
        },

        // Set true only after successful Firebase phone verification.
        mobileVerified: {
            type: Boolean,
            default: false,
        },

        emailVerified: {
            type: Boolean,
            default: false,
        },

        // Firebase Auth UID, when the account is linked to Firebase.
        firebaseUid: {
            type: String,
            default: null,
        },

        status: {
            type: String,
            enum: ["active", "blocked"],
            default: "active",
        },

        lastLoginAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ mobile: 1 }, { unique: true });

const User =
    mongoose.models.User || mongoose.model("User", userSchema);

export default User;