const AppError = require("../utils/AppError");
const knex = require("../database/knex");

class MovieTagsController {
  async index(request, response) {
    const tags = await knex("movie_tags");
  
    return response.json(tags)
  }

  async show(request, response) {
    const { user_id  } = request.params;

    let userTags;

    try {
      if(user_id) {
        userTags = await knex("users")
          .select([
            "users.id as user_id",
            "users.name as user_name",
            "movie_tags.name as tag_name",
            "movie_notes.title as note_title"
          ])
          .where("movie_tags.user_id", user_id) 
          .where("movie_notes.user_id", user_id) 
          .innerJoin("movie_tags", "movie_tags.user_id", "users.id")
          .innerJoin("movie_notes", "movie_notes.user_id", "users.id")
          .orderBy("note_title");
      } else {
        return e
      }
    } catch(e) {
      throw new AppError("Por favor informe o ID do usuário");
    }
     
    return response.json(userTags)
  }

  async create(request, response) {
    const { tags } = request.body
    const user_id  = request.user.id;
    const { note_id  } = request.params;

    const newTags = tags.map(tag => {    
      return {
        note_id,
        user_id,
        name: tag
      };
    });

    await knex("movie_tags").insert(newTags);
     
    return response.json(newTags)
  }

  async update(request, response) {
    const { id } = request.params;
    const { name } = request.body;

    let updatedTag;
    updatedTag = await knex("movie_tags")
      .update({ name })
      .where({ id })
      
    return response.json(updatedTag);
  }

  async delete(request, response) {
    const { id } = request.params;

    await knex("movie_tags").where({ id }).delete();

    return response.json();
  }
}

module.exports = MovieTagsController;