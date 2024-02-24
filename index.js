import express from "express";
import bodyParser from "body-parser";
import pg from 'pg';
import { config } from 'dotenv';
config();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));


const db = new pg.Client({
  connectionString: process.env.CONNECTION_STRING
});

// const db = new pg.Client({
//   user: "postgres",
//   host: "localhost",
//   database: "permalist",
//   password: "dbdbdb1234",
//   port: 5432
// });

db.connect();


let items = [{
    id: 1,
    title: "Buy milk"
  },
  {
    id: 2,
    title: "Finish homework"
  },
];

async function getItems() {
  const result = await db.query(
    `SELECT * FROM items ORDER BY id ASC`
  );
  items = result.rows;
}

app.get("/", async (req, res) => {
  // items = await getItems()
  await getItems();

  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  try {
    if(item){
      await db.query(
        `INSERT INTO items (title) VALUES ('${item}')`
      );
    }
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.post("/edit", async (req, res) => {
  const updatedItemId = parseInt(req.body.updatedItemId);
  const updatedItemTitle = req.body.updatedItemTitle;

  try {
    await db.query(
      `UPDATE items SET title = '${updatedItemTitle}' WHERE id = ${updatedItemId}`
    );
    res.redirect('/');
  } catch (error) {
    console.log(error);
  }
});

app.post("/delete", async (req, res) => {
  const deleteItemId = req.body.deleteItemId;
  try {
    await db.query(
      `DELETE FROM items WHERE id = ${deleteItemId}`
    );
    res.redirect('/')
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});