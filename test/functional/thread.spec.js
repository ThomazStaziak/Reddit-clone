"use strict";

const Factory = use("Factory");
const Thread = use("App/Models/Thread");

const { test, trait } = use("Test/Suite")("Thread");

trait("Test/ApiClient");
trait("Auth/Client");
trait("DatabaseTransactions");

test("authorized user can create threads", async ({ client }) => {
  const user = await Factory.model("App/Models/User").create();
  const response = await client
    .post("/threads")
    .loginVia(user)
    .send({
      title: "test title",
      body: "some text"
    })
    .end();

  console.log(response.error);

  response.assertStatus(200);

  const thread = await Thread.firstOrFail();
  response.assertJSON({ thread: thread.toJSON() });
  response.assertJSONSubset({ thread: { ...attributes, user_id: user.id } });
});

test("authorized user can delete threads", async ({ assert, client }) => {
  const thread = await Factory.model("App/Models/Thread").create();

  const response = await client
    .delete(`threads/${thread.id}`)
    .send()
    .loginVia(await thread.user().first())
    .end();

  console.log(response.error);
  response.assertStatus(204);

  assert.equal(await Thread.getCount(), 0);
});

test("authorized user can update title and body of threads", async ({
  assert,
  client
}) => {
  const thread = await Factory.model("App/Models/Thread").create();

  const attributes = { title: "new title", body: "new body" };

  const updatedThreadAttributes = { ...thread.toJSON(), ...attributes };

  const response = await client
    .put(thread.url())
    .loginVia(await thread.user().first())
    .send(attributes)
    .end();

  await thread.reload();

  response.assertStatus(200);
  response.assertJSON({ thread: thread.toJSON() });
  assert.deepEqual(thread.toJSON(), updatedThreadAttributes);
});

test("unauthenticated user cannot create threads", async ({ client }) => {
  const response = await client
    .post("/threads")
    .send({
      title: "test title",
      body: "test body"
    })
    .end();

  response.assertStatus(401);
});

test("unauthenticated user can not delete threads", async ({
  assert,
  client
}) => {
  const thread = await Factory.model("App/Models/Thread").create();
  const response = await client
    .delete(thread.url())
    .send()
    .end();
  response.assertStatus(401);
});

test("unauthenticated user cannot update threads", async ({
  assert,
  client
}) => {
  const thread = await Factory.model("App/Models/Thread").create();
  const response = await client
    .put(thread.url())
    .send()
    .end();
  response.assertStatus(401);
});

test("thread can not be deleted by a user who did not create it", async ({
  client
}) => {
  const thread = await Factory.model("App/Models/Thread").create();
  const notOwner = await Factory.model("App/Models/User").create();
  const response = await client
    .delete(thread.url())
    .send()
    .loginVia(notOwner)
    .end();

  response.assertStatus(403);
});

test("thread can not be updated by a user who did not create it", async ({
  client
}) => {
  const thread = await Factory.model("App/Models/Thread").create();
  const notOwner = await Factory.model("App/Models/User").create();
  const response = await client
    .put(thread.url())
    .send()
    .loginVia(notOwner)
    .end();
  response.assertStatus(403);
});
