function Question(id, question, equation, image, answer)
{
  this.id = id;
  this.question = question;
  this.equation = equation;
  this.image = image;
  this.answer = answer;
}


exports.getCategories = function()
{
  var differnetialEquation = [];

  differnetialEquation.push(new Question(0, "How old are you?", "x^2+5 is your age", "", "42"));
  differnetialEquation.push(new Question(1, "How old are your mother?", "x^2^2^2*3000", "", "42"));
  differnetialEquation.push(new Question(2, "How fat is your mother?", "x^2^2^2*3000^2^2^2^300", "", "42"));


  var categories = ["differnetialEquation"];
  return categories;
}
