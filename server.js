const express = require("express");
const app = express();

const persons = [
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




const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
    console.log("Server is listening on PORT " + PORT);
})