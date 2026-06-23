const express = require("express");
const app = express();

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
];

// MIDDLEWARE 
app.use(express.json());


// ROUTES 
// get all contacts 
app.get("/api/persons", (req, res)=>{
    res.status(200).json({status_code:200, status:"successful", data:persons});
})

// get info page
app.get("/api/info", (req, res)=>{
    let total_persons = persons.length;
    let date = new Date().toString();
    
    res.send(`
        <p>Phone book has info for ${total_persons} ${total_persons>1?"persons":"person"}</p>
        <p>${date}</p>`).end();
})

// get a person 
app.get("/api/persons/:id", (req, res)=>{
    let id = req.params.id;
    
    // find person with provided id 
    let found_person = persons.find((person)=> person.id === id);

    // verify if person exists 
    if(!found_person){
        return res.status(404).json({status_code:404, status:"Error", msg:"Person doesn't exists!"});
    }

    res.status(200).json({status_code:200, status:"successful", data:found_person});
})

// delete a person 
app.delete("/api/persons/:id", (req, res)=>{
    let id = req.params.id;

      // find person with provided id 
    let found_person = persons.find((person)=> person.id === id);

    // verify if person exists 
    if(!found_person){
        return res.status(404).json({status_code:404, status:"Error", msg:"Person doesn't exists!"});
    }

    let new_persons = persons.filter((person)=>person.id !== id);
    persons = new_persons;

    res.status(204).end();
})

// add a person 
app.post("/api/persons", (req, res)=>{
    let req_body = req.body;

    // generates a new ID 
    function generateID(){
        let maxID = 0;

        for(let i = 0; i<persons.length; i++){
            if(parseInt(persons[i].id) > maxID){
                maxID = persons[i].id;
            }
        }

        let id =parseInt( maxID +=1);

        return id;
    }

    // check for required fields 
    if(!req_body.name || !req_body.number){
         return res.status(400).json({status_code:400, status:"Error", msg:"{name, number} are required!"});
    };

    // create and add new person 
    let new_person= {
            "id": generateID(),
            "name": req_body.name,
            "number": req_body.number
        }

    persons = [...persons, new_person];

    res.status(201).json({status_code:201, status:"successful", data:new_person});
})




const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
    console.log("Server is listening on PORT " + PORT);
})