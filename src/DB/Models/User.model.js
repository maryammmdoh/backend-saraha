import mongoose from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../Common/Enums/user.enums.js";
const userSchema = new mongoose.Schema(
    {
        userName: 
        { 
            type: String, 
            required: true 
        },
        email: 
        { 
            type: String, 
            required: true, 
            unique: true 
        },
        password: 
        { 
            type: String, 
            required: function() {
                return this.provider === ProviderEnum.System;
            } 
        },
        phone: 
        { 
            type: String 
        },
        DOB:  Date ,
        gender: 
        { 
            type: String,
            enum: Object.values(GenderEnum), 
            default: GenderEnum.Male
        },
        role:
        {
            type: String,
            enum: Object.values(RoleEnum),
            default: RoleEnum.User
        },
        confirmEmail: 
        { 
            type: Boolean, 
            default: false 
        },
        provider:
        {
            type: String,
            enum: Object.values(ProviderEnum),
            default: ProviderEnum.System
        },
        profileImage: String,
        coverImage: {
            type: [String],
            default: [],
        },
        profileVisitCount: {
            type: Number,
            default: 0,
        },
        changeCreditTime: Date,
    },
    
    { 
        timestamps: true 
    }
);

const UserModel = mongoose.model("User", userSchema);
export default UserModel;
