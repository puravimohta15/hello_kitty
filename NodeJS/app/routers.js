var express = require("express");
var router = express.Router();
//alert("gg");
console.log("cherry");
const  credential = {
    email : "admin@gmail.com",
    password : "admin123"
}
// login user
router.post('/login', (req, res)=>{
    if(req.body.email == credential.email && req.body.password == credential.password){
        req.session.user = req.body.email;
        console.log("cherry");
        res.redirect('C:\Users\User\Desktop\login new\hello kitty\html\index.html');
        res.end("Login Successful...!");
    }else{
        res.redirect('\login new\hello kitty\html\index.html');
        res.end("Invalid Username")
    }
});

// route for dashboard
router.get('/dashboard', (req, res) => {
    if(req.session.user){
        res.render('dashboard', {user : req.session.user})
    }else{
        res.send("Unauthorize User")
    }
})

// route for logout
router.get('/logout', (req ,res)=>{
    req.session.destroy(function(err){
        if(err){
            console.log(err);
            res.send("Error")
        }else{
            res.render('base', { title: "Express", logout : "logout Successfully...!"})
        }
    })
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Check if user exists and credentials match
    const user = await collection.findOne({ email, password });
    if (user) {
        req.session.user = email; // Store user in session
        res.redirect('/dashboard'); // Redirect to dashboard on successful login
    } else {
        res.send('Invalid Credentials'); // Handle invalid credentials
    }
});


module.exports = router;