$(function ()
{
  $( "#login" ).click(function()
  {
    TurnOverLayOn();
    console.log("Login");
  });

  $("#register").click(function()
  {
    TurnOverLayOn();
    console.log("Register");
  });

  $("#registerButton").click(function()
  {
    Register();
  });

  socket.on("registerResult", function(msg)
  {
    console.log("Register Status: " + msg);
  });
});

function TurnOverLayOn()
{
  $("#overlay").show();
}

function LoginScreen()
{
  $("#loginOverlay").show();
}

function RegisterScreen()
{
  $("#registerOverlay").show();
}

function Register()
{
  console.log("Register initiated");
  var registerObject =
  {
    username: $("#username").val(),
    passowrd: $("#password").val(),
    displayname: $("#displayname").val(),
    email: $("#email").val()
  };

  socket.emit('register', registerObject);
}
