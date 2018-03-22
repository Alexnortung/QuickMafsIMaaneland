$(function() {
  $("#login").click(function() {
    TurnOverLayOn();
    LoginScreen();
    console.log("Login");
  });

  $("#register").click(function() {
    TurnOverLayOn();
    RegisterScreen();
    console.log("Register");
  });

  $("#queButton").click(function() {
    QueueUp();
  });

  $("#registerButton").click(function() {
    Register();
  });
 ///BULLLLLLLLSHIIIIIIITTTTTTT
  $("#loginButton").click(function() {
    Login();
    console.log("Login initiated");
  });

  socket.on("registerResult", function(msg) {
    console.log("Register Status: " + msg);

  });

  socket.on("findMathGame1v1", function (msg)
  {
    console.log(msg);
  });

  socket.on("LoggedMenu", function(username)
  {
    console.log("Overlay Removal initiated");
    $("#overlay").remove();
    $("#login").remove();
    $("#register").remove();
    $("#header").append("<li id='logout'><a>Log out</a></li>");
    $("#header").append("<li><p style='color: white;'>Hello, " + username + "</li>");
    //Remove other
    //Place logout loginButton
    //Write "Hello, " + username
  });

  $(".CloseOverlay").click(function()
  {
    TurnOffOverlay();
  });
});

function TurnOffOverlay()
{
  $("#overlay").hide();
  $("#loginOverlay").hide();
  $("#registerOverlay").hide();
}

function TurnOverLayOn() {
  $("#overlay").show();
}

function LoginScreen() {
  $("#loginOverlay").show();
}

function RegisterScreen() {
  $("#registerOverlay").show();
}

function Register() {
  console.log("Register initiated");
  var registerObject = {
    username: $("#username").val(),
    password: $("#password").val(),
    displayname: $("#displayname").val(),
    email: $("#email").val()
  };
  socket.emit('register', registerObject);
}

function GetLoginCredentials() {
  var LoginObject = {
    username: $("#loginusername").val(),
    password: $("#loginpassword").val()
  };
  return LoginObject;
}

function Login() {
  socket.emit('login', GetLoginCredentials());
}

function QueueUp()
{
  socket.emit('findMathGame');
  console.log("Quing Up");
}
