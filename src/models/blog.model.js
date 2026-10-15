
import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },

    date: {
        type: Date,
        required: true,
    },

    permalink: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },

    content: {
        type: String,
        required: true,
    },

    image: {
        type: String,
        default: "",
    },

    imageFileId: {
        type: String,
        default: "",
    },

    metaTitle: {
        type: String,
        default: "",
        trim: true,
    },

    metaDescription: {
        type: String,
        default: "",
        trim: true,
    },
}, { timestamps: true, });

const Blog = mongoose.models.Blog || mongoose.model("Blog", blogSchema);
export default Blog;