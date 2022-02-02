require('dotenv').config()
const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const bcrypt = require("bcryptjs");

require("./db/conn");
const Register = require("./models/registers");

app.use(express.json());
app.use(express.urlencoded({extended : false}));

const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public")
const templates_path = path.join(__dirname, "../templates/views")
const partials_path = path.join(__dirname, "../templates/partials")

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", templates_path);
hbs.registerPartials(partials_path);

console.log(process.env.SECRET_KEY);

app.get("/", (req, res) => {
    res.render("index");
})

app.get("/register", (req, res) => {
    res.render("register");
})

// create a new user in our database
app.post("/register", async (req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;

        if(password === cpassword) {
            const registerEmployee = new Register({
                firstname : req.body.firstname,
                lastname : req.body.lastname,
                email : req.body.email,
                gender : req.body.gender,
                phone : req.body.phone,
                age : req.body.age,
                password : password,
                confirmpassword : cpassword
            })

            console.log(`the success part ${registerEmployee}`);

            const token = await registerEmployee.generateAuthToken();
            console.log(`the token part ${token}`);


            const registered = await registerEmployee.save();
            console.log("the page part" + registered);

            res.status(201).render("index");

        } else {
            res.send(`password are not matching`);
        }

    } catch(err) {
        res.status(400).send(err);
        console.log(`the error part page`);
    }
})

//login validation
app.get("/login", (req, res) => {
    res.render("login");
})

app.post("/login", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        // console.log(`${email} and password is ${password}`);
        const useremail = await Register.findOne({email: email});

        const isMatch = await bcrypt.compare(password, useremail.password);

        // middleware
        const token = await useremail.generateAuthToken();
        console.log(`the token part ${token}`); 
        
        if(isMatch) {
            res.status(201).render("index");
        } else {
            res.send("Invalid password");
        }

    } catch(err) {
        res.status(400).send("Invalid login details");
        // console.log(err);
    }
})

app.listen(port, () => {
    console.log(`server is live at port no ${port}`);
})
