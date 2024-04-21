const Sequelize = require('sequelize');
require('dotenv').config();

/*const setData = require("../data/setData");
const themeData = require("../data/themeData");

let sets = [];*/



let sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  port: 5432,

  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
});



//theme model
const Theme = sequelize.define('Theme', {
  id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
  },
  name: Sequelize.STRING
}

);
//set model
const Set = sequelize.define('Set', {
  set_num: {
      type: Sequelize.STRING,
      primaryKey: true
  },
  name: Sequelize.STRING,
  year: Sequelize.INTEGER,
  num_parts: Sequelize.INTEGER,
  theme_id: Sequelize.INTEGER,
  img_url: Sequelize.STRING
});
Set.belongsTo(Theme, { foreignKey: 'theme_id' });

// Function to initialize the sets array
function initialize() { 
  return new Promise(async (resolve, reject) => {
    try{
      await sequelize.sync();
      resolve();
    }catch(err){
      reject(err.message)
    }
  });

}


// Function to get all sets
function getAllSets() {

  return new Promise(async (resolve,reject)=>{
    let sets = await Set.findAll({include: [Theme]});
    resolve(sets);
  });
   
}


// Function to get a set by set number
function getSetByNum(setNum) {

  return new Promise(async (resolve, reject) => {
    let foundSet = await Set.findAll({include: [Theme], where: { set_num: setNum}});
 
    if (foundSet.length > 0) {
      resolve(foundSet[0]);
    } else {
      reject("Unable to find requested set");
    }

  });

}

// Function to get sets by theme
function getSetsByTheme(theme) {

  return new Promise(async (resolve, reject) => {
    let foundSets = await Set.findAll({include: [Theme], where: { 
      '$Theme.name$': {
        [Sequelize.Op.iLike]: `%${theme}%`
      }
    }});
 
    if (foundSets.length > 0) {
      resolve(foundSets);
    } else {
      reject("Unable to find requested sets");
    }

  });

}


function addSet(setData){
  return new Promise(async (resolve,reject)=>{
    try{
      await Set.create(setData);
      resolve();
    }catch(err){
      reject(err.errors[0].message)
    }
  });
}

function editSet(set_num, setData){
  return new Promise(async (resolve,reject)=>{
    try {
      await Set.update(setData,{where: {set_num: set_num}})
      resolve();
    }catch(err){
      reject(err.errors[0].message);
    }
  });
}


function getAllThemes() {

  return new Promise(async (resolve,reject)=>{
    let themes = await Theme.findAll();
    resolve(themes);
  });
   
}

function deleteSet(set_num){
  return new Promise(async (resolve,reject)=>{
    try{
      await Set.destroy({
        where: { set_num: set_num }
      });
      resolve();
    }catch(err){
      reject(err.errors[0].message);
    }
   
  });
  
}


// Exporting the functions as a module
module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, addSet,editSet, deleteSet, getAllThemes };

// Code Snippet to insert existing data from Set / Themes

/*sequelize
  .sync()
  .then( async () => {
    try{
      await Theme.bulkCreate(themeData);
      await Set.bulkCreate(setData); 
      console.log("-----");
      console.log("data inserted successfully");
    }catch(err){
      console.log("-----");
      console.log(err.message);

      // NOTE: If you receive the error:

      // insert or update on table "Sets" violates foreign key constraint "Sets_theme_id_fkey"

      // it is because you have a "set" in your collection that has a "theme_id" that does not exist in the "themeData".   

      // To fix this, use PgAdmin to delete the newly created "Themes" and "Sets" tables, fix the error in your .json files and re-run this code
    }

    process.exit();
  })
  .catch((err) => {
    console.log('Unable to connect to the database:', err);
  });*/
  