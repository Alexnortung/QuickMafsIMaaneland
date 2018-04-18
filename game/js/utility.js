// path til hvor spørgsmåls billeder er
const questionPath = "";


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
  //width and height should be the width and height of the original image
  
  if (width >= height)
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
function GetResizedImage(maxwidth, maxheight, imgPath, callback)
{
  // Finder billede og originale dimensioner
  GetPictureSize(imgPath, function(width, height)
  {
    //Finder nye dimensioner når den har fundet originale
    var newSize = ResizeImage(width, height, maxwidth, maxheight);
    console.log(newSize);
    //Sender tilbage nye skaleret dimensioner
    callback(newSize);
  });
}
