import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/Apierrors.js";
import { Apiresponse } from "../Utils/Apiresponse.js";

const healthcheck = asyncHandler(async (req, res) => {
    try {
        res.status(200)
        .json(new Apiresponse(200,{},"Everything is working fine till now"));
    } catch (error) {
        throw new ApiError("500","something went wrong");
    }
})

export {
    healthcheck
    }
    