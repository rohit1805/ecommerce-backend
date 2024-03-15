const express = require("express");
const app = express();
const cors = require("cors");
const port = 3000;
const userRoute = require("./routes/user")
const productRoute = require("./routes/product")
const adminRoute = require("./routes/admin")

app.use(express.json());
app.use(cors());

app.use("/user", userRoute);
app.use("/product", productRoute);
app.use("/admin", adminRoute);

app.get("/", (req, res) => {
    res.send("E-commerce")
})

app.listen(port, (req, res) => {
    console.log(`server running on https://localhost:${port}`);
})