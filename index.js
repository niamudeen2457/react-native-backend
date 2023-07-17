const express = require("express");
const User = require("./models/User")
const TodoList = require("./models/TodoList")
const port = 7000;
const cors = require('cors');
const jwt = require("jsonwebtoken")
require('dotenv').config()
require("./db")



const app = express();
app.use(express.json())
app.use(cors());


console.log("Hello world")


app.get("/list", async (req, res) => {
  try {

    // let list = await TodoList.find()
    let list = await TodoList.findOne({ userId: req.query.userId });

    if(!list){
      await TodoList.create({ userId: req.query.userId });
    }


    res.send(
      list);
  } catch (error) {
    console.log(error, "error<<");
    res.send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
})
app.get("/user", async (req, res) => {
  try {
    let user = await User.findById(req.query.userId);
    res.send(user);
  } catch (error) {
    console.log(error, "error<<");
    res.send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
})

app.post("/user", async (req, res) => {
  try {
    let { name, email, password } = req.body;
    let existedUser = await User.findOne({ name, email, password });
    if (!existedUser) {
      let user = await User.create(req.body);
      res.send({
        success: true,
        message: "User created successfully",
        data: user,
      });
    } else {
      res.send("User Exist");
    }
  } catch (error) {
    console.log(error, "error<<");
    res.send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const signJWT = (payload, expires_in) => {
      let jwtToken = jwt.sign(payload, "testing", {
        expiresIn: expires_in || "300678678678678s",
        // expiresIn: expires_in || DEFAULT_EXP_TIME,
      });
      return jwtToken;
    };

    let { name, password } = req.body
    let user = await User.findOne({ name: name });
    if (!user) {
      res.send({
        statusCode: 200,
        success: false,
        message: "user not found"
      })
    } else if (user.password === password) {
      // } else if (await bcrypt.compare(req.body.password, user.password)) {
      res.send({
        success: true,
        message: "User login successfully",
        data: {
          email: user.email,
          name: user.name,
          myNetwork: user.myNetwork,
          _id: user._id,
          token: signJWT(
            {
              email: user.email,
              name: user.name,
              _id: user._id,
            },
            "30d"
            // TOKEN_EXP_TIME
          ),
        }
      })
    } else {
      res.send({
        success: false,
        message: "Wrong Password"
      })
    }
  } catch (error) {
    console.log(error, "error<<");
    res.send({
      success: false,
      message: "Something wrong",
      error
    })
  }

})

app.post("/add-to-list", async (req, res) => {
  try {
    // Check if a document exists, create one if it doesn't
    // let listDocument = await TodoList.findOne();
    let listDocument = await TodoList.findOne({ userId: req.query.userId });

    // if (!listDocument) {
    //   listDocument = new TodoList();
    // }

    listDocument.list.push(req.body); // Update the list array

    const updatedList = await listDocument.save(); // Save the document

    res.send({
      statusCode: 200,
      message: "Item Added",
      updatedList,
    });
  } catch (error) {
    console.log(error, "error<<");
    res.send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
});


app.patch("/edit-item", async (req, res) => {
  try {
    const listItemIdToUpdate = req.query.itemId;
    const newValue = req.body.value;

    console.log(req.query.userId,newValue,listItemIdToUpdate)

    let data = await TodoList.findOne({ userId: req.query.userId });


    if(req.query.itemId !== undefined){
      const updatedList = data?.list.map(item => {
        if(item._id == listItemIdToUpdate){
          item.value = newValue
          return item
        }
        return item;
      });
  
      console.log(updatedList,"updatedList")
      await TodoList.findOneAndUpdate(
        { userId: req.query.userId },
        { $set: { list: updatedList } }
      );
      res.send({
        success: true,
        message: "List updated successfully",
      });
  
    }

  } catch (error) {
    console.log(error, "error<<");
    res.send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
});


app.delete("/delete-item", async (req, res) => {
  try {
    const listItemIdToDelete = req.query.itemId;

    console.log(listItemIdToDelete, "listItemIdToDelete", req.query.userId);
    let data = await TodoList.findOne({ userId: req.query.userId });
    if (req.query.itemId !== undefined) {
      const updatedList = data?.list.filter(item => {
        return item._id !== listItemIdToDelete;
      });

      console.log(updatedList, "updatedList",updatedList.length);
      await TodoList.findOneAndUpdate(
        { userId: req.query.userId },
        { $set: { list: updatedList } }
      );
      res.send({
        success: true,
        message: "Item deleted successfully",
      });
    }
  } catch (error) {
    console.log(error, "error<<");
    res.send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
});


app.listen(port, () => {
  console.log(`App listening at ${port}`);
});
