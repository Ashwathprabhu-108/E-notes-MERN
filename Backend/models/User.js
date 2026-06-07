import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: false, 
        default: null,
    },
        googleId: {
        type: String,
        default: null,   
    },
    provider: {
        type: String,
        enum: ["local", "google"],
        default: "local",
    },

    myFiles: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "File" 
    }],

    savedFiles: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "File" 
    }],

    downloads: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "File" 
    }],

    isDisabled: {
        type: Boolean,
        default: false,
    },


}, { timestamps: true })

export default mongoose.model("User", userSchema);