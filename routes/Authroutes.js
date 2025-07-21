// A route module for registering users

const crypto = require('crypto')
const express = require('express')
const router = express.Router();

//POST route for storing newly created user profiles with hashed passwords
router.post(`/register/:user`, async(req,res) =>{
    /* We expect the client to send a JSON in the format:
            {
               name: USER_NAME, 
               password: USER_PASS,
               date: DATE_CREATED
            } 
       with the name field being the username, the password field being the user password, and the date field being the date the profile was created.
    */
   try{
      const id = crypto.randomBytes(16).toString("hex") // Generates a 128-bit value, which will be our users UUID in the database
      
      const salt = await bcrypt.genSalt() // Gererate a salt prefix to our user's password
      const hash = await bcrypt.hash(req.body.password, salt) //Generates a hashed version of user passwords that are compared when users login to ensure security
      console.log(saltRounds) // Logs salt segment
      console.log(hash) // Logs hashed version of user password

      const user = {name : req.body.name, pass: hash}
      const createUserQuery = 'INSERT INTO UserTable (id,username,password,dateCreated) VALUES ($1,$2,$3,$4)' // Insert query for storing user profile info

      con.query(createUserQuery, [id,user.name,user.pass,req.body.date], (err,result) =>{
         if(err){ res.status(500).send("Error occurred while saving user profile") }
         else{
            console.log(result)
            res.status(201).send("User profile created and saved")
         }
      })
   }catch{res.status(500).send("Could not save user profile")}
})

//POST route for loging in user profiles with appropriate login inputs from client
router.post('/login/:username', async(req,res)=> {
   /* Run the assumption the request has a body that contains:
         {
            password: USER_PASS
         }
   */
   try{
      con.query('SELECT salt, password FROM UserTable WHERE username = $1;', [username], async(err,result)=> { // Retrieve the hashed password and the salt prefix
         
         // If the username doesn't exist in the database
         if(result.rows.length === 0) return res.status(404).json({ message: 'User not found' })

         const {salt,pass} = result.rows[0] // Separate destructure the tuple into their respective variables

         if (await bcrypt.compare(salt + req.body.password, pass)) res.status(200).send("Success! Log in approved")
         else res.status(401).send("Incorrect password")
      })
   } catch{ res.status(500).send() }
})

module.exports = router