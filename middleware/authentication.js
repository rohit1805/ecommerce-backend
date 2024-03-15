const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config");
const prisma = require("../db/db");

function userAuthMiddleware(req, res, next){
    const authHeader = req.headers.authorization;
    // console.log(authHeader);
    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(400).json({
            msg : "Wrong authorization token."
        })
    }

    const authHeaderArray = authHeader.split(" ");
    const token = authHeaderArray[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // console.log(decoded);
        req.username = decoded;
        next();
    } catch(err) {
        return res.status(400).json({
            msg : "Invalid authorization token, you are not authenticated."
        })
    }
}

async function adminAuthMiddleware(req, res, next) { 
    const authHeader = req.headers.authorization;
    // console.log(authHeader);
    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(400).json({
            msg : "Wrong authorization token."
        })
    }

    const authHeaderArray = authHeader.split(" ");
    const token = authHeaderArray[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // console.log(decoded);
        req.username = decoded;

        const user = await prisma.user.findUnique({
            where : {
                username : req.username
            }
        })
    
        if(!user.isAdmin){
            return res.status(401).json({
                msg : "You are not authorized as admin."
            })
        } else {
            next();
        }

        
    } catch(err) {
        return res.status(400).json({
            msg : "Invalid authorization token, you are not authenticated."
        })
    }

}

module.exports = {
    userAuthMiddleware,
    adminAuthMiddleware
}