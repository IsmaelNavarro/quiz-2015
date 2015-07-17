var models = require("../models/models.js");

//Autoload - factoriza el código si ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
	models.Quiz.find(quizId).then(
		function(quiz) {
			if (quiz) {
				req.quiz = quiz;
				next();
			}
			else{
				next (new Error("No existe quizID=" + quizId));
			}
		}
	).catch(function(error) {next(error);});
};

//GET /quizes
exports.index = function(req, res) {
	//Recogemos la busqueda enviada en la petición
	var busqueda = req.query.busqueda || "";
	//Reemplazamos los espacios por el comidos
	busqueda = busqueda.replace(/ /g,"%");
	//Añadimos los comodines al inicio y final
	busqueda = "%"+busqueda+"%";

	models.Quiz.findAll({where: ["pregunta like ?", busqueda]}).then(function(quizes) {
		res.render("quizes/index", {quizes:quizes});
	}).catch(function(error) { next(error);});
};

//GET /quizes/:id
exports.show = function(req, res) {
	res.render("quizes/show", {quiz: req.quiz});
};

//GET /quizes/:id/answer
exports.answer = function(req, res) {
	var resultado = "Incorrecto";
	if(req.query.respuesta === req.quiz.respuesta)
		resultado = "Correcto"; 

	res.render("quizes/answer", {quiz: req.quiz, respuesta: resultado});
};

//GET /quizes/new
exports.new = function(req, res) {
	var quiz = models.Quiz.build(
			{pregunta: "", respuesta: ""}
		);

	res.render('quizes/new', {quiz: quiz});
};

//POST /quizes/create
exports.create = function(req, res) {
	var quiz = models.Quiz.build(req.body.quiz);

	//Guardar en BD los campos pregunta y respuesta de quiz
	quiz.save({fields: ["pregunta", "respuesta"]}).then(function() {
		res.redirect("/quizes");
	});
};