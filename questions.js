function Question(id, question, equation, image, answer, category)
{
  this.id = id;
  this.question = question;
  this.equation = equation;
  this.image = image;
  this.answer = answer;
}


exports.getquestions = function()
{
  console.log("Hello WOrld");
  var questionsAmount = 5;
  var questions = [];

  questions.push(new Question(0, "How old are you?", "x^2+5 is your age", "", "42", "differnetialEquation"));
  questions.push(new Question(1, "How old are your mother?", "x^2^2^2*3000", "", "42", "differnetialEquation"));
  questions.push(new Question(2, "How fat is your mother?", "x^2^2^2*3000^2^2^2^300", "", "42", "differnetialEquation"));
  questions.push(new Question(3, "How old are you?", "x^2+5 is your age", "", "42", "trigiometri"));
  questions.push(new Question(4, "How old are your mother?", "x^2^2^2*3000", "", "42", "trigiometri"));
  questions.push(new Question(5, "How fat is your mother?", "x^2^2^2*3000^2^2^2^300", "", "42", "trigiometri"));

  var categories = ["differnetialEquation", "trigiometri"];

  var selectedQuestions = [];
  var i = 0;
  while (selectedQuestions.length < questionsAmount)
  {
    console.log("try: " + i);
      var questionAlreadyUsed = false;

      var question = questions[Math.floor(Math.random() * questions.length)];

      for (var j = 0; j < selectedQuestions.length; j++)
      {
        if (selectedQuestions[j].id == question.id)
        {
          questionAlreadyUsed = true;
        }
      }

      if (!questionAlreadyUsed)
      {
        selectedQuestions.push(question);
      }

      i++;


  }

  return selectedQuestions;
}
