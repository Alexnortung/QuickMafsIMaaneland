require("dotenv").config();
var mysql = require('mysql');

// Function KUN BRUGT UNDER DEVELOPMENT Sletter alle databaser
exports.SetupMySqldev = function(mysql, callback) {
  // Laver en connection
  var con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
  });

  //Sletter det hele
  con.connect(function(err) {
    if (err) {
      console.log("Couldnt connect: " + err);
    } else {
      console.log("Conntected To MySql Server!");
      DeleteDB(con, function() {
        con.query("CREATE DATABASE IF NOT EXISTS quickmafs;", function(err, result) {
          if (err) {
            console.log("Error: " + err);
          } else {
            console.log("Database quickmafs created");
            callback();
          }
        });
      });
    }
  });
}

// FUNCTION laver en connection til mysql serveren
exports.SetupMySql = function(mysql, callback) {
  var opts = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  }
  //console.log(process.env);
  //console.log(opts);
  var con = mysql.createConnection(opts);

  // Prøver at connecte
  con.connect(function(err)
  {
    if (err)
    {
      // Hvis der er en fejl skal den udskrive den
      console.log("Couldnt connect: " + err);
    }
    else
    {
      callback();
    }
  });
}

exports.CreateNewCon = function(mysql) {
  // Connecter til databasen
  var con = mysql.createConnection(
    {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME
  });

  return con;
}

exports.CreateUserTable = function(con) {
  var sqlQuery = "CREATE TABLE IF NOT EXISTS users (`id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY, username varchar(64) unique, password varchar(255), display_name varchar(64), skill_level int(10), Elo int(255), Email varchar(255) unique);";

  // Laver query til at lave user table
  con.query(sqlQuery, function(err, result)
  {
    if (err)
    {
      // Hvis fejl udskriv den
      console.log("Error: " + err);
    }
    else
    {
      console.log("Table users created");
    }
  });
}

exports.CreateMatchesTable = function(con) {

  // Laver query til at lave matches table
  con.query("CREATE TABLE IF NOT EXISTS matches (`id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY, player_one INT(255), player_two INT(255), player_one_wins INT(10), player_two_wins INT(10), elo_differense INT(255));", function(err, result)
  {
    if (err)
    {
      // udskriver fejl hvis der er nogen
      console.log("Error: " + err);
    }
    else
    {
      console.log("Table matches created");
    }
  });
}

function DeleteDB(con, callback)
{
  // Sletter databasen
  con.query("drop database IF EXISTS quickmafs;", function (err, result)
  {
    if (err)
    {

      console.log("Error: " + err);
      callback();
    } else {
      console.log("DB dropped");
      callback();
    }
  });
}

exports.CreateQuestions = function(con, callback) {
  con.query("CREATE TABLE IF NOT EXISTS questions (`id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY, `category` varchar(30), `title` varchar(255));", function(err, result) {
    if (err) {
      console.log("Error: " + err);
    } else {
      console.log("quesion table created");
      callback();
    }
  });
}

exports.CreateSubQuestions = function(con, callback) {
  con.query("CREATE TABLE IF NOT EXISTS subQuestions (`id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY, `questionId` INT(255), `imgPath` varchar(255), `answer` varchar(255));", function(err, result) {
    if (err) {
      console.log("Error: " + err);
    } else {
      console.log("subquestion table created");
      callback();
    }
  });
}

exports.CreateQuestionAndSubQuestions = function(con, callback) {
  con.query("INSERT INTO questions (category, title) VALUES ('Vector', 'Math examn 2015 marts')", function(err, result) {
      if (err) {
        console.log("Error: " + err);
      } else {
        con.query("INSERT INTO subQuestions (questionId, imgPath, answer) VALUES (1, 'img1.png', '42');", function(err, result) {
            if (err) {
              console.log("Error: " + err);
            } else {
              con.query("INSERT INTO subQuestions (questionId, imgPath, answer) VALUES (1, 'img2.png', '43');", function(err, result) {
                  if (err) {
                    console.log("Error: " + err);
                  } else {
                    con.query("INSERT INTO subQuestions (questionId, imgPath, answer) VALUES (1, 'img3.png', '44');", function(err, result) {
                      if (err) {
                        console.log("Error: " + err);
                      } else {
                        console.log("Question Added");
                        callback();
                      }
                    });
                  }
              });
          }
        });
    }
  });
}



exports.FindQuestion = function(callback)
{
  var con = createConnection(mysql, function ()
  {
    var QuestionPlusSub = [];
    con.query("SELECT id, category, title FROM questions", function(err, result) {
      var questionid = result[Math.floor(Math.random() * result.length)].id;
      QuestionPlusSub.push(result[questionid - 1]);
      con.query("SELECT * FROM subQuestions WHERE questionId = " + questionid, function(err, subResult) {
        QuestionPlusSub.push(subResult);
        var results = QuestionPlusSub;
        con.end();
        callback(results);
      });
    });
  });
}
