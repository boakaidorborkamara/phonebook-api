const express = require("express");
const mongoose = require("mongoose");
const app = express();

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];



// DB CONFIG

// extract passwork from cli 
if(process.argv.length < 3){
    console.log("provide db password");
    process.exit(1);
}

let password = process.argv[2];
console.log("password", password)


const url = `mongodb+srv://root:${password}@sandbox.pjn5u.mongodb.net/phonebook?appName=Sandbox`;

// connect to db 
console.log("Connecting to database...")
mongoose.connect(url, {family: 4})
.then(()=>{
    console.log("DB connected successfully.")
})
.catch(err=>{
    console.log("error connecting to db!", err.message);
})


// create schema
const contactSchema = new mongoose.Schema({ name: String, number: String });
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
app.get("/api/persons", (req, res) => {

    console.log("getting all contacts...");

    Contact.find({})
    .then(persons=>{
         res.status(200).json({ status_code: 200, status: "successful", data: persons });
    });
 
});

// get info page
app.get("/api/info", (req, res) => {
    
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
app.get("/api/persons/:id", (req, res) => {
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
    res.status(500).json({status:500, msg:"Server Encounter an error"});
  })

  
});

// delete a person
app.delete("/api/persons/:id", (req, res) => {
  let id = req.params.id;

  // find person with provided id
  let found_person = persons.find((person) => person.id === id);

  // verify if person exists
  if (!found_person) {
    return res
      .status(404)
      .json({
        status_code: 404,
        status: "Error",
        msg: "Person doesn't exists!",
      });
  }

  let new_persons = persons.filter((person) => person.id !== id);
  persons = new_persons;

  res.status(204).end();
});

// add a person
app.post("/api/persons", (req, res) => {
  let req_body = req.body;

  // generates a new ID
  function generateID() {
    let maxID = 0;

    for (let i = 0; i < persons.length; i++) {
      if (parseInt(persons[i].id) > maxID) {
        maxID = persons[i].id;
      }
    }

    let id = parseInt((maxID += 1));

    return id;
  }

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
  let new_person = {
    id: generateID(),
    name: req_body.name,
    number: req_body.number,
  };

  persons = [...persons, new_person];

  res
    .status(201)
    .json({ status_code: 201, status: "successful", data: new_person });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server is listening on PORT " + PORT);
});
