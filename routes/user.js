const express = require("express")
const prisma = require("../db/db")
const jwt = require("jsonwebtoken")
const JWT_SECRET = require("../config")
const { userAuthMiddleware } = require("../middleware/authentication");
const router = express.Router()

router.get("/", (req, res) => {
    res.send("this is user's route")
})



router.post("/signup" , async(req, res) => {
    const { username, email, password, isAdmin } = req.body;

    const usernameExists = await prisma.user.findUnique({
        where : {
            username : username
        }
    })

    if(usernameExists){
        return res.status(400).json({
            msg : "Username already taken, give different username."
        })
    }

    const emailExists = await prisma.user.findUnique({
        where : {
            email : email
        }
    })

    if(emailExists){
        return res.status(400).json({
            msg : "Email already exists, use different email ID."
        })
    }

    const newUser = await prisma.user.create({
        data : {
            username : username,
            email : email,
            password : password,
            isAdmin : isAdmin
        }
    })

    if(newUser){
        const token = jwt.sign(newUser.username, JWT_SECRET)
        return res.status(200).json({
            msg : "new user created successfully",
            token : token
        });
    } else {
        return res.send("user not created")
    }
})

router.post("/login", async (req,res) => {
    const {username, password} = req.body;

    const user = await prisma.user.findUnique({
        where : {
            username : username
        }
    })

    if(user){
        if(user.password == password){
            const token = jwt.sign(user.username, JWT_SECRET)
            return res.status(200).json({
                msg : "Logging Successfull.",
                token : token
            })
        } else {
            return res.status(400).json({
                msg : "Wrong password."
            })
        }
    } else {
        return res.status(400).json({
            msg : "User not found, check your username."
        })
    }
})


router.put("/updateProfile", userAuthMiddleware, async (req, res) => {
    const {firstName, lastName, address} = req.body;
    // console.log(req.username);
    const user = await prisma.user.update({
        where : {
            username : req.username
        },
        data : {
            firstName : firstName,
            lastName : lastName,
            address : address
        }
    })

    if(user){
        // console.log(user);
        return res.status(200).json({
            msg : "Profile updated succesfully"
        })
    } else {
        return res.status(404).json({
            msg : "user not found"
        })
    }
})

//Endpoint for user to view the products present in the cart
router.post("/showcart", userAuthMiddleware, async (req, res) => {
    const username = req.username;
    try {
        const user = await prisma.user.findUnique({
            where : {
                username : username
            }
        })

        if(!user){
            return res.status(404).json({
                msg:"User not found."
            })
        }

        const cartItems = await prisma.cart.findMany({
            where : {
                userId : user.id
            },
            include : {
                product : {
                    include : {
                        images : {
                            take : 1
                        }
                    }
                }
            }
        })

        res.status(200).json({
            Products : cartItems
        })
    } catch (error) {
        console.log("Error while fetching the products form the cart.", error);
        return res.status(500).json({
            msg : "Failed to load cart products"
        })
    }
})


// Endpoint to show wishlist products
router.post("/showwishlist", userAuthMiddleware, async (req, res) => {
    const username = req.username;
    try {
        const user = await prisma.user.findUnique({
            where : {
                username : username
            }
        })

        if(!user){
            return res.status(404).json({
                msg:"User not found."
            })
        }

        const wishlistedProduct = await prisma.likedProducts.findMany({
            where : {
                userId : user.id
            },
            include : {
                product : {
                    include : {
                        images : {
                            take : 1
                        }
                    }
                }
            }
        })

        res.status(200).json({
            Wishlisted_Products : wishlistedProduct
        })
    } catch (error) {
        console.log("Error while fetching the wishlist products :", error);
        return res.status(500).json({
            msg : "Failed to load wishlisted products"
        })
    }
})

module.exports = router;