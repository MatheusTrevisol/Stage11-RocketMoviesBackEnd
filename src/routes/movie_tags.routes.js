const { Router } = require("express");

const ensureAuthenticated = require("../middlewares/ensureAuthenticated");

const MovieTagsController = require("../controllers/MovieTagsController")

const movieTagsRouter = Router();

const movieTagsController = new MovieTagsController();

movieTagsRouter.use(ensureAuthenticated);

movieTagsRouter.get("/", movieTagsController.index);
movieTagsRouter.get("/:user_id", movieTagsController.show);
movieTagsRouter.post("/:note_id", movieTagsController.create);
movieTagsRouter.put("/:id", movieTagsController.update);
movieTagsRouter.delete("/:id", movieTagsController.delete);

module.exports = movieTagsRouter;