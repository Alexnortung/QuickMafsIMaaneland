var c;
var ctx;
var socket;

$(function ()
{
    socket = io();

    var c = document.getElementById("gameCanvas");
    var ctx = c.getContext('2d');
    changeCanvasPosition();
});



function changeCanvasPosition()
{
  c.style.marginRight = ((window.width/2) - (c.width/2)) + "px";
  c.style.marginTop = ((window.height/2) - (c.height/2)) + "px";
}
