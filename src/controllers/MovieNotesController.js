const AppError = require("../utils/AppError");
const knex = require("../database/knex");

class MovieNotesController {
  async index(request, response) {
    const { title } = request.query;
    const user_id = request.user.id;
    let movie_notes;

    try {
      if(title) {
        movie_notes = await knex("movie_notes")
          .where({ user_id })
          .whereLike("title", `%${title}%`)
          .orderBy("title")
      } else {
        movie_notes = await knex("movie_notes")
          .where({user_id})
          .orderBy("title");
      }
    } catch (error) {
      // ..
    }

    const userMovieNotesTags = await knex("movie_tags").where({ user_id })
    const movieNotesWithTags = movie_notes.map(note => {
      const filteredUserNotesWithTags = userMovieNotesTags.filter(tag => tag.note_id === note.id)

      return {
        ...note,
        tags: filteredUserNotesWithTags
      }
    })

    return response.json(movieNotesWithTags);    
  }

  async show(request, response) {
    const { id } = request.params;

    let movie_notes;
    let tags;

    try {
     if(id) {
      movie_notes = await knex("movie_notes")
      .select([
        "users.id as user_id",
        "users.name as user_name",
        "users.avatar as user_avatar",
        "movie_notes.id",
        "movie_notes.title",
        "movie_notes.rating",
        "movie_notes.description",
        "movie_notes.created_at",
      ])
      .where("movie_notes.id", id)
      .innerJoin("users", "users.id", "movie_notes.user_id")
      .orderBy("name").first();
    
      tags = await knex("movie_tags").where("note_id", id);
     } else {
      return e;
     }
    } catch(e) {
      throw new AppError("Informe o ID da nota por gentileza")
    }

    return response.json({
      ...movie_notes,
      tags
    })
  }

  async create(request, response) {
    const { title, description, rating, tags } = request.body;
    const user_id = request.user.id;

    const [movieNote] = await knex("movie_notes").insert({
      title,
      description,
      rating,
      user_id
    });   

    const tagsToInsert = tags.map(tag => {           
      return {
        note_id: movieNote,
        user_id,
        name: tag
      };
    });
    
    if(tagsToInsert.length > 0) {
      await knex("movie_tags").insert(tagsToInsert);
    }
    
    return response.status(201).json();
  }

  async update(request, response) {
    const { title, description, rating, tags } = request.body;
    const { id } = request.params;
    const user_id = request.user.id;
   
    try {
      await knex("movie_notes")
      .where({id})
      .update({
        title,
        description,
        rating
      });
    } catch (error) {
      //
    }

    if(tags.length > 0) { //verifica se há tags para adicionar
      try {
        await knex("movie_tags").delete().where({note_id: id})

        const tagsToInsert = tags.map(tag => {
          return {
            note_id: id,
            user_id,
            name: tag,
          };
        });
  
        await knex("movie_tags").insert(tagsToInsert);
      } catch (error) {
        //
      }
    } else {
      await knex("movie_tags").delete().where({note_id: id})
    }

    return response.json();
  }

  async delete(request, response) {
    const { id } = request.params;

    await knex("movie_notes").where({ id }).delete();

    return response.json();
  }
}

module.exports = MovieNotesController;