"use strict";

const Factory = use("Factory");
const Thread = use("App/Models/Thread");

const { test, trait } = use("Test/Suite")("Thread");

trait("Test/ApiClient");
trait("DatabaseTransactions");

test("can create threads", async ({ client }) => {
  const response = await client
    .post("/threads")
    .send({
      title: "test title",
      body: "some text"
    })
    .end();

  console.log(response.error);
  response.assertStatus(200);

  const thread = await Thread.firstOrFail();
  response.assertJSON({ thread: thread.toJSON() });
});

test("can delete threads", async ({ assert, client }) => {
  const thread = await Factory.model("App/Models/Thread").create();

  const response = await client
    .delete(`threads/${thread.id}`)
    .send()
    .end();

  console.log(response.error);
  response.assertStatus(204);

  assert.equal(await Thread.getCount(), 0);
});
