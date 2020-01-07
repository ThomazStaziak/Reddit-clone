"use strict";

const Thread = use("App/Models/Thread");
// const { validate } = use("Validator");

class ThreadController {
  async index({ response }) {
    const threads = await Thread.all();

    return response.json({ threads });
  }

  async show({ response, params }) {
    const thread = await Thread.findOrFail(params.id);

    return response.json({ thread });
  }
  async store({ request, response, auth }) {
    // const rules = { title: "required", body: "required" };
    // const validation = await validate(request.all(), rules);

    // if (validation.fails()) {
    //   return response.badRequest();
    // }

    const thread = await auth.user
      .threads()
      .create(request.only(["title", "body"]));

    return response.json({ thread });
  }

  async destroy({ params }) {
    await Thread.query()
      .where("id", params.id)
      .delete();
  }

  async update({ request, response, params, auth }) {
    const thread = await Thread.findOrFail(params.id);

    thread.merge(request.only(["title", "body"]));
    await thread.save();
    return response.json({ thread });
  }
}

module.exports = ThreadController;
