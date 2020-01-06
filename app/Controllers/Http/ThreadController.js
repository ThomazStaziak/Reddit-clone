"use strict";

const Thread = use("App/Models/Thread");

class ThreadController {
  async store({ request, response, auth }) {
    const thread = await auth.user
      .threads()
      .create(request.only(["title", "body"]));

    return response.json({ thread });
  }

  async destroy({ params, auth, response }) {
    await Thread.findOrFail(params.id).delete();
  }

  async update({ request, response, params, auth }) {
    const thread = await Thread.findOrFail(params.id);

    thread.merge(request.only(["title", "body"]));
    await thread.save();
    return response.json({ thread });
  }
}

module.exports = ThreadController;
