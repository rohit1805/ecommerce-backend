const express = require("express")
const prisma = require("../db/db")
const { route } = require("./admin")
const { authMiddleware } = require("../middleware/authentication")

const router = express.Router()

router.get("/", (req, res) => {
    res.send("this is product's route")
})

//endpoint to get all the product in the database
router.get("/allproducts", async(req, res) => {
    try {
        const products = await prisma.product.findMany({
            include : {
                images: true
            }
        });

        res.status(200).json(products)
    } catch (error) {
        console.log("Error while fetching the products : ", error);
        res.status(500).json({Error : "Failed to fetch the products."})
    }

})

//endpoint to get a particular product with given product id.
router.get("/allproducts/:id", async(req, res) => {
    const productId = req.params.id;
    console.log("productID : ",productId);
    try {
        const product = await prisma.product.findUnique({
            where: {
                id : parseInt(productId)
            },
            include : {
                images: true
            }
        });

        res.status(200).json(product)
    } catch (error) {
        console.log("Error while fetching the particular product using productId : ", error);
        res.status(500).json({Error : "Failed to fetch the product."})
    }

})

//endpoint to fetch the products related to men (men-clothing)
router.get("/mens-clothing", async(req, res) => {
    try {
        const product = await prisma.product.findMany({
            where: {
                category : "men"
            },
            include : {
                images: true
            }
        });

        res.status(200).json(product)
    } catch (error) {
        console.log("Error while fetching the products related to men categroy : ", error);
        res.status(500).json({Error : "Failed to fetch the product."})
    }

})


//endpoint to fetch the products related to women (women-clothing)
router.get("/womens-clothing", async(req, res) => {
    try {
        const product = await prisma.product.findMany({
            where: {
                category : "women"
            },
            include : {
                images: true
            }
        });

        res.status(200).json(product)
    } catch (error) {
        console.log("Error while fetching the products related to women categroy : ", error);
        res.status(500).json({Error : "Failed to fetch the product."})
    }

})

//endpoint to fetch the products related to kids (kids-clothing)
router.get("/kids-clothing", async(req, res) => {
    try {
        const product = await prisma.product.findMany({
            where: {
                category : "kid"
            },
            include : {
                images: true
            }
        });

        res.status(200).json(product)
    } catch (error) {
        console.log("Error while fetching the products related to kids categroy : ", error);
        res.status(500).json({Error : "Failed to fetch the product."})
    }
})

//endpoint to add product to cart
router.post("/addtocart/:id"), authMiddleware, async(req, res) => {
    
}

module.exports = router;