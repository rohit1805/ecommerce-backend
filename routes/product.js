const express = require("express")
const prisma = require("../db/db")
const { route } = require("./admin")
const { userAuthMiddleware } = require("../middleware/authentication")

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
router.post("/addtocart", userAuthMiddleware, async(req, res) => {
    const username = req.username;
    const {productId} = req.body;

    try {
        const product = await prisma.product.findUnique({
            where : { id : productId } 
        })

        if(!product){
            return res.status(404).json({
                msg : "Product not found"
            })
        }

        const user = await prisma.user.findUnique({
            where : {username : username}
        });

        if(!user){
            return res.status(404).json({
                msg : "user not found when adding product to the cart"
            })
        }
        

        // First lets check if this product already exists in the cart and if it exists then update the 
        const existingProduct = await prisma.cart.findFirst({
            where : {
                     userId : user.id ,
                     productId : productId   
            }
        })

        if(existingProduct){
            try {
                console.log("if else ", existingProduct.id);
                const newQuantity = existingProduct.quantity + 1;
                const updatedProduct = await prisma.cart.update({
                    where : {
                        id : existingProduct.id
                    },
                    data : {
                        quantity : newQuantity
                    }
                });

                console.log(updatedProduct);
                return res.status(200).json({
                    msg : "Product quantity updated successfully."
                })
            } catch (error) {
                console.log("Error updating the existing product into the cart : ", error);
                return res.status(500).json({
                    msg : "Error while updating the product quantity."
                })
            }
        }

        // lets add the product into the cart
        const cart = await prisma.cart.create({
            data : {
                userId : user.id,
                productId : productId,
                quantity : 1,
                price : product.price
            }
        })

        console.log("New Cart Item : ", cart);
        res.status(200).json({
            msg : "Product added to the cart."
        })
    } catch (error) {
        console.log("Error while adding product to the cart : ", error);
        return res.status(500).json({
            msg : "Failed to add the product to cart."
        })
    }
})

//Endpoint to remove product from the cart
router.post("/removefromcart", userAuthMiddleware, async (req, res) => {
    const username = req.username;
    const {productId} = req.body;

    try {
        const product = await prisma.product.findUnique({
            where : { id : productId } 
        })

        if(!product){
            return res.status(404).json({
                msg : "Product not found"
            })
        }

        const user = await prisma.user.findUnique({
            where : {username : username}
        });

        if(!user){
            return res.status(404).json({
                msg : "user not found when adding product to the cart"
            })
        }

        const cartitem = await prisma.cart.findFirst({
            where : {
                userId : user.id,
                productId : productId
            }
        })

        if(cartitem){
            try {
                const deletedProduct = await prisma.cart.delete({
                    where : {
                        id : cartitem.id
                    },
                    select : {
                        productId : true
                    }
                })

                console.log("Deleted User : ",deletedProduct);
                return res.status(200).json({
                    msg : "Product removed from the cart successfully."
                })

                
            } catch (error) {
                console.log("Error in removing the product for the cart : ", error);
                return res.status(500).json({
                    msg : "Failed to remove product from the cart."
                })
            }
        }

        return res.status(404).json({
            msg : "Product not found in the cart."
        })

    } catch (error) {
        console.log("Error while removing the product", error);
        res.status(500).json({
            msg : "Failed to remove the product."
        })
    }
})


//Endpoint to remove product from the cart
router.post("/removeonefromcart", userAuthMiddleware, async (req, res) => {
    const username = req.username;
    const {productId} = req.body;

    try {
        const product = await prisma.product.findUnique({
            where : { id : productId } 
        })

        if(!product){
            return res.status(404).json({
                msg : "Product not found"
            })
        }

        const user = await prisma.user.findUnique({
            where : {username : username}
        });

        if(!user){
            return res.status(404).json({
                msg : "user not found when adding product to the cart"
            })
        }

        const cartitem = await prisma.cart.findFirst({
            where : {
                userId : user.id,
                productId : productId
            }
        })

        if(cartitem && cartitem.quantity > 1){
            try {
                const deletedProduct = await prisma.cart.update({
                    where : {
                        id : cartitem.id
                    },
                    data : {
                        quantity : cartitem.quantity - 1
                    },
                    select : {
                        quantity : true
                    }
                })

                console.log("Remaining quantity : ",deletedProduct.quantity);
                return res.status(200).json({
                    msg : "One quantity of product removed from the cart successfully."
                })

                
            } catch (error) {
                console.log("Error in removing one quantity of the product for the cart : ", error);
                return res.status(500).json({
                    msg : "Failed to remove product from the cart."
                })
            }
        }

        if(cartitem && cartitem.quantity == 1){

            try {
                const deletedProduct = await prisma.cart.delete({
                    where : {
                        id : cartitem.id
                    },
                    select : {
                        productId : true
                    }
                })

                console.log("Deleted product id : ",deletedProduct.productId);
                return res.status(200).json({
                    msg : "Product removed from the cart successfully."
                })

                
            } catch (error) {
                console.log("Error in removing the product for the cart : ", error);
                return res.status(500).json({
                    msg : "Failed to remove product from the cart."
                })
            }

        }

        return res.status(404).json({
            msg : "Product not found in the cart."
        })

    } catch (error) {
        console.log("Error while removing one quantity of the product", error);
        res.status(500).json({
            msg : "Failed to remove the product."
        })
    }
})

module.exports = router;