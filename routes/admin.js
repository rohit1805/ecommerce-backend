const express = require("express")
const {adminAuthMiddleware} = require('../middleware/authentication')
const prisma = require("../db/db")
const multer = require("multer")
const router = express.Router()
const path = require("path")
const cloudinary = require("cloudinary").v2;
const fs = require("fs")


//cloudinary configuration
cloudinary.config({
    cloud_name: 'dlbiw2uy5', 
    api_key: '593582386484499', 
    api_secret: "vtqBeBbM1TzTnbWvlmU7dgwNHx0" 
});

router.get("/", (req, res) => {
    res.send("this is admin's route")
})


const storage = multer.diskStorage({
    destination : function (req, file, cb) {
        cb(null, "./public/uploads")
    },
    filename : function(req, file, cb) {
        cb(null, Date.now()+"-"+file.originalname+path.extname(file.originalname))
    }
})

const upload = multer({storage : storage});

const uploadMiddleware = upload.array('productImages', 5)


//Endpoint to add the product and images related to that product in the database 
router.post("/addproduct", uploadMiddleware, adminAuthMiddleware,async (req, res) => {

    // const user = await prisma.user.findUnique({
    //     where : {
    //         username : req.username
    //     }
    // })

    // if(!user.isAdmin){
    //     return res.status(401).json({
    //         msg : "You are not authorized as admin."
    //     })
    // }

    const {name, description, price, category, stock} = req.body;

    //Extracting the product id 
    let productId = undefined;

    //save the product details along with image URLs to the database
    try {
        const product = await prisma.product.create({
            data : {
                name,
                description,
                price : parseFloat(price), 
                category, 
                stock : parseInt(stock)
            }
        })
        productId = product.id;
    } catch (error) {
        console.log("Error while adding the product in the database : ", error);
        return res.status(500).json({
            msg : "Product info not added."
        })
    }

    //upload files to cloudinary
    const uploadedImages = await Promise.all(req.files.map(file => cloudinary.uploader.upload(file.path)));

    //delete temporay files from the local backend
    req.files.forEach(file => fs.unlinkSync(file.path));

    //Extract images urls from the cloudinary response
    const imageUrls = uploadedImages.map(image => image.url);
    // console.log(imageUrls);

    const productImagesData = imageUrls.map(imageUrl => ({
        imageUrl,
        productId
    }));

    // console.log("Product images data : ", productImagesData);
    
    //save the product image urls in productImages table using the productId
    try {
        const productImages = await prisma.productImage.createMany({
            data: productImagesData
        });
        // console.log(productImages);
        res.status(200).json({
            msg: `Product details (Product ID : ${productId}) and ${productImages.count} images added successfully in the database.`
        });
    } catch (error) {
        console.log("Error while adding the product images in the database: ", error);
        res.status(500).json({
            msg: "Product images not added."
        });
    }
})

// Endpoint to update the product details
// router.put("/updateproduct", authMiddleware, async(req,res) => {

// })

module.exports = router;