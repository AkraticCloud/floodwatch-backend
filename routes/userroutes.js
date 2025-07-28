// A route module for registering users

const bcrypt = require("bcrypt")
const con = require("../database/client")
const express = require('express');
const router = express.Router();

require('dotenv').config()

/* We expect the client to send a JSON in the format:
            {
               name: USER_NAME, 
               password: USER_PASS,
            } 
       with the name field being the username, and password being the plain text password. 
       All specific additions are mentioned in their respective routes.
*/

//POST route for storing newly created user profiles with hashed passwords
router.post(`/register`, async(req,res) =>{
    
   try{
      
      const salt = await bcrypt.genSalt() // Gererate a salt prefix to our user's password
      const hash = await bcrypt.hash(req.body.password, salt) //Generates a hashed version of user passwords that are compared when users login to ensure security

      const user = {name: req.body.name, pass: hash}
      const createUserQuery = 'INSERT INTO floodwatch_prototype.usertable (username,password) VALUES ($1,$2)' // Insert query for storing user profile info

      con.query(createUserQuery, [user.name,user.pass], (err,result) =>{
         if(err){ 
            console.log("SQL Error: " + err)
            res.status(500).send("Error occurred while saving user profile")
         }
         else{
            console.log(result)
            res.status(201).send("User profile created and saved")
         }
      })
   }catch{res.status(500).send("Could not save user profile")}
})

//POST route for loging in user profiles with appropriate login inputs from client
router.post('/login', async(req,res)=> {
   try{
       // Retrieve the hashed password and the salt prefix
      con.query('SELECT password FROM floodwatch_prototype.usertable WHERE username = $1;', [req.body.name], async(err,result)=> {
         
         // If the username doesn't exist in the database
         if(result.rows.length === 0) {
            console.log(err)
            return res.status(404).send("User not found")
         }

         console.log("User found")
         let json = JSON.stringify(result.rows[0]);
         json = JSON.parse(json)

         const pass = json.password

         console.log(pass)

         if (await bcrypt.compare(req.body.password, pass)) 
            res.status(200).send("Success! Log in approved")
         else res.status(401).send("Incorrect password")
      })
   } catch{ res.status(500).send("Internal Error") }
})

/* PATCH route to update usernames
   For this route, JSON data would also include a newUsername parameter:
      {
         "newname": "new username here"
      }
*/
router.patch("/updateUser", (req,res) =>{
   try{
      const query = `Update floodwatch_prototype.usertable
               SET username = $1
               WHERE username = $2;`
      
      con.query(query, [req.body.newname, req.body.name], (err,result)=>{
         if(err){
            console.log("SQL Error: " + err)
            res.status(500).send("Could not update username on database")
         }
         else{ res.status(200).send("Username successfully changed") }
      })
   } catch{ res.status(500).send("Internal Error")}
})

// PATCH route to update user passwords
router.patch("/updatePass", async(req,res) =>{
   try{
      const salt = await bcrypt.genSalt()
      const hash = await bcrypt.hash(req.body.password, salt)

      const query = `Update floodwatch_prototype.usertable
               SET password = $1
               WHERE username = $2;`

      con.query(query, [hash, req.body.username], (err,result)=>{
         if(err){
            console.log("SQL Error: " + err)
            res.status(500).send("Could not update password on database")
         }
         else{ res.status(200).send("Password successfully changed") }
      })
   } catch{ res.status(500).send("Internal Error")}
})

router.delete('/delete', (req,res) => {
   try{
      const deleteQuery = "DELETE FROM floodwatch_prototype.usertable WHERE username = $1;";
      con.query(deleteQuery,[req.body.username], (err,result) =>{
         if(err){
            console.log("SQL Error: " + err)
            res.status(500).send("Could not delete profile");
         }
         else{res.status(200).send("Profile successfully deleted")}
      })
   }catch{ res.status(500).send("internal Error") }
})

//test route for verifying bcrypt functionality
router.post('/register/test', async (req,res)=> {
   try{
      const salt = await bcrypt.genSalt()
      const hash = await bcrypt.hash(req.body.password, 10)

      console.log(salt)
      console.log(hash)
      const createUserQuery = 'INSERT INTO floodwatch_prototype.usertable (username,password) VALUES ($1,$2)' // Insert query for storing user profile info

      con.query(createUserQuery, ["testUser4",hash], (err,result) =>{
         if(err){ 
            console.log("SQL Error: " + err)
            res.status(500).send("Error occurred while saving user profile")
         }
         else{
            console.log(result)
            res.status(201).send("User profile created and saved")
         }
      })
   } catch{
      res.status(500).send("Internal error")
   }

})

module.exports = router