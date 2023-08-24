const AppError = require("../utils/AppError");
const knex = require("../database/knex");
const { hash, compare } = require("bcryptjs");

class UsersController {
  async index(request, response) {
    const users = await knex("users");

    return response.json(users);
  }

  async show(request, response) {
    const { id } = request.params;

    const user = await knex("users").where({ id }).first();

    return response.json(user);
  }

  async create(request, response) {
    const { name, password, email, avatar } = request.body;

    const checkEmailExists = await knex("users").where({ email }).first();

    if(!name) {
      throw new AppError("Por favor cadastre um nome.");
    }

    if(checkEmailExists) {
      throw new AppError("Email já existe em nosso cadastro.");
    }

    const hashedPassword = await hash(password, 8)

    let user;

    try {
      user = await knex("users").insert({
        name,
        password: hashedPassword,
        email,
        avatar
      });
    } catch(e) {
      throw new AppError(e.message)
    }
    
    return response.status(201).json();
  }

  async update(request, response) {
    const { name, email, password, old_password } = request.body;
    const user_id = request.user.id;

    const user = await knex("users").where({id: user_id}).first();
    const checkIfEmailExists = await knex("users").where({ email }).first();
    
    if(!user) {
      throw new AppError("Nenhum usuário encontrado.");
    }

    if(checkIfEmailExists && checkIfEmailExists.id !== user.id ) {
      throw new AppError("Este email já está sendo utilizado.");
    }

    if(password && !old_password) {
      throw new AppError("Você precisa informar a senha antiga para alterar a senha.")
    }

    if(password && old_password) {
      const comparePasswords = await compare(old_password, user.password);

      if(!comparePasswords) {
        throw new AppError("A senha antiga não confere")
      }
      user.password = await hash(password, 8);
    }
    
    user.name = name ?? user.name;
    user.email = email ?? user.email;

    await knex("users").update({
      name: user.name,
      password: user.password,
      email: user.email
    }).where({id: user_id});

    return response.json(user);
  }

  async delete(request, response) {
    const { id } = request.params;

    await knex("users").where({ id }).delete();

    return response.json();
  }
}

module.exports = UsersController;