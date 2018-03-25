// path til hvor spørgsmåls billeder er
const questionPath = "../img/questions/";


// Function finder originale billede størrelser udfra billede navn (med extension)
function GetPictureSize(imgname, callback)
{
  var img = new Image();
  img.onload = function()
  {
    // Sender billede dimensioner videre
    callback(this.width, this.height);
  }

  //Sætter billede path til det billede vi skal finde dimensioner på
  img.src = questionPath + imgname;
}

// Function tager imod billede dimensioner, og kan scalere det til max width eller height uden det bliver distortet
function ResizeImage(width, height, maxwidth, maxheight)
{
  if (width > height)
  {
    // Finder hvor mange procent større width er
    var scale = maxwidth / width;

    // Ganger op på scale af dimensionerne
    width = width * scale;
    height = height * scale;

    //Sender informationen videre
    return {width: width, height: height};
  }
  else if (width < height)
  {
    // Finder hvor mange procent større height er
    var scale = maxheight / height;

    // Ganger op på scale af dimensionerne
    width = width * scale;
    height = height * scale;

    //Sender informationen videre
    return {width: width, height: height};
  }
}

// Function Sender tilbage dimensioner på billedet der er skaleret, den henter også billede
function GetResizedImage(maxwidth, maxheight, imgPath)
{
  // Finder billede og originale dimensioner
  GetPictureSize(imgPath, function(width, height)
  {
    //Finder nye dimensioner når den har fundet originale
    var newSize = ResizeImage(width, height, maxwidth, maxheight);

    //Sender tilbage nye skaleret dimensioner
    return newSize;
  });
}
