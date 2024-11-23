import {Router} from "express";
import { loginUser , logoutUser , registerUser , refreshAccessToken , updateUserAvatar} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import {verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    // accepting file from user : avatar and image
    //it is a middleware
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name : "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)
router.route("/login").post(loginUser)  

// secured routes (user should be logged in for this)

router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-Token").post(refreshAccessToken)
router.route("/updateavatar").post(
    upload.fields([
        {
            id: "id",
            maxCount: 1 
        },
        {
            name: "avatar",
            maxCount: 1
        }
    ]),updateUserAvatar
)

export default router