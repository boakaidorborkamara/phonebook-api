const mongoose = require('mongoose');


if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];


const url = `mongodb+srv://root:${password}@sandbox.pjn5u.mongodb.net/phonebook?appName=Sandbox`;


// connect to DB 
mongoose.connect(url)
.then(()=>{
  console.log("db connected successful");

  // create schema 
  const contactSchema = new mongoose.Schema({name:String, number:String});
  
  // create model 
  const Contact = mongoose.model("contact", contactSchema);

  // create new contact 
  if(name && number){
    // ADD TO DB 
    let contact = new Contact({name:name, number:number});

    contact.save().then(result=>{
      console.log(`added ${result.name} ${result.number}`);
      mongoose.connection.close();
    })
  }else{
    Contact.find({}).then(result=>{
      console.log(result);
      mongoose.connection.close();
    })
  }

  

 



})
.catch(error=> console.log("error", error));



