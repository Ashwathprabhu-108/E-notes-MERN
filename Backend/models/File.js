import mongoose from "mongoose"

const fileSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },

    tags: [{
        type: String,
        trim: true,
        required: true,
    }],

    category: {
        type: String,
        enum: ["Academic", "Technology", "Business", "Science", "Arts & Humanities", "Law", "Medical", "Other"],
        required: true,
    },

    thumbnail: {
        url: String,
        public_id: String,
    },

    document: {
        url: String,
        public_id: String,
        name: String,
        format: String,
    },

    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    downloadCount: {
        type: Number,
        default: 0,
    },

}, { timestamps: true })

export default mongoose.model("File", fileSchema);