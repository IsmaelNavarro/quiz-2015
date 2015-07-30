var models = require("../models/models.js");

//Autoload - factoriza el código si ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
	models.Quiz.find({
		where: {id: Number(quizId)},
		include: [{model: models.Comment}]
	}).then(
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
		res.render("quizes/index", {quizes:quizes, errors: []});
	}).catch(function(error) { next(error);});
};

//GET /quizes/:id
exports.show = function(req, res) {
	res.render("quizes/show", {quiz: req.quiz, errors: []});
};

//GET /quizes/:id/answer
exports.answer = function(req, res) {
	var resultado = "Incorrecto";
	if(req.query.respuesta === req.quiz.respuesta)
		resultado = "Correcto"; 

	res.render("quizes/answer", {quiz: req.quiz, respuesta: resultado, errors: []});
};

//GET /quizes/new
exports.new = function(req, res) {
	var quiz = models.Quiz.build(
			{pregunta: "", respuesta: ""}
		);

	res.render('quizes/new', {quiz: quiz, errors: []});
};

//POST /quizes/create
exports.create = function(req, res) {
	var quiz = models.Quiz.build(req.body.quiz);

	quiz
	.validate()
	.then(
		function(err) {
			if(err)
				res.render("quizes/new", {quiz: quiz, errors: err.errors});
			else
				quiz.save({fields: ["pregunta", "respuesta", "tema"]}).then(function() {
					res.redirect("/quizes");
				});
			
		}
	);
};

//GET /quizes/:id/edit
exports.edit = function(req, res) {
	var quiz = req.quiz;
	res.render("quizes/edit", {quiz: quiz, errors: []});
};

//PUT /quizes/:id
exports.update = function(req, res) {
	req.quiz.pregunta = req.body.quiz.pregunta;
	req.quiz.respuesta = req.body.quiz.respuesta;
	req.quiz.tema = req.body.quiz.tema;

	req.quiz
		.validate()
		.then(
				function(err) {
					if (err) {
						res.render("quizes/edit", {quiz: req.quiz, errors: err.errors});
					} else{
						req.quiz
							.save({fields: ["pregunta", "respuesta", "tema"]})
							.then(function() { res.redirect("/quizes"); });
					}
				}
			);
};

//DELETE /quizes/:id
exports.destroy = function(req, res) {
	req.quiz.destroy().then(function() {
		res.redirect("/quizes");
	}).catch(function(error) {next(error)});
};

//GET /quizes/statistics
exports.statistics = function(req, res) {
	var cantidadPreguntas=0;
	var cantidadComentarios=0;
	var cantidadPreguntasSinComentarios=0;

	models.Quiz.findAll({include: [{model: models.Comment}]}).then(function(quizes) {
		var cantidadPreguntas = quizes.length;

		for(index in quizes){
			if(quizes[index].Comments.length == 0)
				cantidadPreguntasSinComentarios++;

			cantidadComentarios+=quizes[index].Comments.length;
		}

		res.render("quizes/statistics", {cantidadPreguntas: cantidadPreguntas, 
										 cantidadComentarios: cantidadComentarios, 
										 cantidadPreguntasSinComentarios: cantidadPreguntasSinComentarios,
										 errors: []});

	}).catch(function(error) {next(error);});;
};