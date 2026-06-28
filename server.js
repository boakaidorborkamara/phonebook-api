const express = require("express");
require('dotenv').config()
const mongoose = require("mongoose");
const app = express();

// DB CONFIG
const url = process.env.DB_CONNECTION_STRING;

// connect to db 
console.log("Connecting to database...");

mongoose.connect(url, {family: 4})
.then(()=>{
    console.log("DB connected successfully.")
})
.catch(err=>{
    console.log("error connecting to db!", err.message);
})


// create schema
const contactSchema = new mongoose.Schema({ 
    name: {
        type:String,
        minlength: 2,
        required: true
    },
    number: String 
});

contactSchema.set("toJSON", {transform:(doc, ret)=>{
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
}} )

// create model
const Contact = mongoose.model("contact", contactSchema);



// MIDDLEWARE
const requestLogger = (req, res, next) => {
  console.log("Method", req.method);
  console.log("Path", req.path);
  console.log("Body", req.body);

  next();
};

const unknownEndpoint = (req, res) => {
  res
    .status(404)
    .json({ status_code: 404, status: "Error", msg: "Unknown endpoint" });
};

app.use(express.json());
app.use(requestLogger);
// app.use(unknownEndpoint);




// ROUTES
// get all contacts
app.get("/api/persons", (req, res, next) => {

    console.log("getting all contacts...");

    Contact.find({})
    .then(persons=>{
         res.status(200).json({ status_code: 200, status: "successful", data: persons });
    });
 
});

// get info page
app.get("/api/info", (req, res, next) => {
    
    console.log("getting info...");

    Contact.find({}).then(persons =>{
        let total_persons = persons.length;
        let date = new Date().toString();

        res
        .send(
        `
            <p>Phone book has info for ${total_persons} ${total_persons > 1 ? "persons" : "person"}</p>
            <p>${date}</p>`,
        )
        .end();
    })
  

  
});

// get a person
app.get("/api/persons/:id", (req, res, next) => {
  let id = req.params.id;

  Contact.findById({_id:id})
  .then(person =>{
    // check if person exists 
    if(!person){
        return res
      .status(404)
      .json({
        status_code: 404,
        status: "Error",
        msg: "Person doesn't exists!",
      });
    }

    res
    .status(200)
    .json({ status_code: 200, status: "successful", data: person });
  })
  .catch(err =>{
    next(err);
  })

  
});

// delete a person
app.delete("/api/persons/:id", (req, res, next) => {
  let id = req.params.id;

  Contact.findByIdAndDelete(id)
  .then(result =>{
    
    if(!result){
        return res
      .status(404)
      .json({
        status_code: 404,
        status: "Error",
        msg: "Person doesn't exists!",
      });
    }

    res.status(204).end();
  })
  .catch(next(err))

});

// add a person
app.post("/api/persons", (req, res, next) => {
  let req_body = req.body;

  // check for required fields
  if (!req_body.name || !req_body.number) {
    return res
      .status(400)
      .json({
        status_code: 400,
        status: "Error",
        msg: "{name, number} are required!",
      });
  }

  // create and add new person
  let new_contact = new Contact({name:req_body.name, number:req_body.number});

  new_contact.save().then((result)=>{
      res
    .status(201)
    .json({ status_code: 201, status: "successful", data: result });
  })
  .catch(err=> next(err))

});

// handle all errors 
app.use((error, req, res, next)=>{
    console.log(error.type)

    if(error.name === "CastError"){
        return res.status(400).json({status:400, msg:"Improper ID format"});
    }
    else if(error.name === "ValidationError"){
        return res.status(400).json({status:400, msg:error.message});
    }
    
    res.status(500).json({status:500, msg:"Server Encounter an error"});
})

// 404 middleware 
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server is listening on PORT " + PORT);
});
