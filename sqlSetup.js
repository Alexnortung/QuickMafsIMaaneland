exports.SetupMySqldev = function (mysql, callback)
{
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "klat9"
  });


  con.connect(function(err)
  {
    if (err)
    {
      console.log("Couldnt connect: " + err);
    }
    else
    {
      console.log("Conntected To MySql Server!");
      DeleteDB(con, function()
      {
        con.query("CREATE DATABASE IF NOT EXISTS quickmafs;", function (err, result)
        {
          if (err)
          {
            console.log("Error: " + err);
          }
          else
          {
            console.log("Database quickmafs created");
            callback();
          }
        });
      });
    }
  });
}

exports.SetupMySql = function (mysql, callback)
{
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "klat9"
  });


  con.connect(function(err)
  {
    if (err)
    {
      console.log("Couldnt connect: " + err);
    }
    else
    {
      console.log("Conntected To MySql Server!");
      con.query("CREATE DATABASE IF NOT EXISTS quickmafs;", function (err, result)
      {
        if (err)
        {
          console.log("Error: " + err);
        }
        else
        {
          console.log("Database quickmafs created");
          callback();
        }
      });
    }
  });
}

exports.CreateNewCon = function(mysql)
{
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "klat9",
    database: "quickmafs"
  });

  return con;
}

exports.CreateUserTable = function (con)
{
  var sqlQuery = "CREATE TABLE IF NOT EXISTS users (`id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY, username varchar(64) unique, password varchar(255), display_name varchar(64), skill_level int(10), Elo int(255), Email varchar(255) unique);";
  con.query(sqlQuery, function(err, result)
  {
    if (err)
    {
      console.log("Error: " + err);
    }
    else
    {
      console.log("Table users created");
    }
  });
}

exports.CreateMatchesTable = function (con)
{
  con.query("CREATE TABLE IF NOT EXISTS matches (`id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY, player_one INT(255), player_two INT(255), player_one_wins INT(10), player_two_wins INT(10), elo_differense INT(255));", function (err, result)
  {
    if (err)
    {
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
  con.query("drop database quickmafs;", function (err, result)
  {
    if (err)
    {
      console.log("Error: " + err);
      callback();
    }
    else
    {
      console.log("DB dropped");
      callback();
    }
  });
}

exports.CreateQuestions = function(con, callback)
{
    con.query("CREATE TABLE IF NOT EXISTS questions (`id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY, `category` varchar(30));", function (err, result)
    {
      if (err)
      {
        console.log("Error: " + err);
      }
      else
      {
        console.log("quesion table created");
        callback();
      }
    });
}

exports.CreateSubQuestions = function(con, callback)
{
  con.query("CREATE TABLE IF NOT EXISTS subQuestions (`id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY, `questionId` INT(255), `picturePath` varchar(255), `answer` varchar(255));", function (err, result)
  {
    if (err)
    {
      console.log("Error: " + err);
    }
    else
    {
      console.log("subquestion table created");
      callback();
    }
  });
}

exports.CreateQuestionAndSubQuestions = function(con)
{
  con.query("INSERT INTO questions (category) VALUES ('Vector')", function (err, result)
  {
    if (err)
    {
      console.log("Error: " + err);
    }
    else
    {
      console.log("Question Added");
    }
  });

  con.query("INSERT INTO subQuestions (questionId, picturePath, answer) VALUES (1, 'pictures/img1.png', '42');", function (err, result)
  {
    if (err)
    {
      console.log("Error: " + err);
    }
    else
    {
      console.log("Question Added");
    }
  });

  con.query("INSERT INTO subQuestions (questionId, picturePath, answer) VALUES (1, 'pictures/img2.png', '43');", function (err, result)
  {
    if (err)
    {
      console.log("Error: " + err);
    }
    else
    {
      console.log("Question Added");
    }
  });

  con.query("INSERT INTO subQuestions (questionId, picturePath, answer) VALUES (1, 'pictures/img3.png', '44');", function (err, result)
  {
    if (err)
    {
      console.log("Error: " + err);
    }
    else
    {
      console.log("Question Added");
    }
  });
}

exports.FindQuestion = function (con)
{
  con.query("SELECT id FROM questions", function (err, result)
  {
    var questionid = result[Math.floor(Math.random() * result.length)].id;
    console.log("Question id: " + questionid);
    con.query("SELECT * FROM subQuestions WHERE questionId = " + questionid, function (err, result)
    {
      return result;
    });
  });
}
