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
        //console.log("cherry");
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
router.get('/reset-password', (req, res) => {
    res.render('reset-password', { email: req.query.email });  // Simulate email being passed in the query
});

// Handle reset password submission
router.post('/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;

    // Update the password in the database
    const result = await collection.updateOne({ email }, { $set: { password: newPassword } });

    if (result.modifiedCount === 1) {
        res.render('login', { message: 'Password successfully reset! Please log in.' });
    } else {
        res.render('reset-password', { error: 'Error resetting password. Please try again.' });
    }
});

module.exports = router;