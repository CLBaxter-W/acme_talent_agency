const {
  client,
  createTables,
  createUser,
  createSkill,
  createUserSkill,
  fetchUsers,
  fetchSkills,
  fetchUserSkills,
  destroyUserSkill,
} = require("./db");

const express = require("express");
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`I am listening on port number ${PORT}`);
});

const init = async () => {
  await client.connect();
  console.log("connected to database");

  const response = await createTables();
  console.log("Created Tables");

  const [Max, Gryphon, Kalu, Hero, Bg, Sh, Sit, Hf] = await Promise.all([
    createUser({ username: "Max", password: "oldDog" }),
    createUser({ username: "Gryphon", password: "youngDog" }),
    createUser({ username: "Kalu", password: "goodDog" }),
    createUser({ username: "Hero", password: "fastDog" }),

    createSkill({ name: "Begging" }),
    createSkill({ name: "Shaking" }),
    createSkill({ name: "Sitting" }),
    createSkill({ name: "High Five" }),
  ]);

  console.log(await fetchUsers());
  console.log(await fetchSkills());

  const [skills1, skills2, skills3, skills4, skills5, skills6, skills7] =
    await Promise.all([
      createUserSkill({
        user_id: Max.id,
        skill_id: Sit.id,
      }),
      createUserSkill({
        user_id: Gryphon.id,
        skill_id: Bg.id,
      }),
      createUserSkill({
        user_id: Gryphon.id,
        skill_id: Sh.id,
      }),
      createUserSkill({
        user_id: Gryphon.id,
        skill_id: Sit.id,
      }),
      createUserSkill({
        user_id: Kalu.id,
        skill_id: Bg.id,
      }),
      createUserSkill({
        user_id: Kalu.id,
        skill_id: Sh.id,
      }),
      createUserSkill({
        user_id: Kalu.id,
        skill_id: Sit.id,
      }),
    ]);

  console.log("Sending just named parameter");  
  console.log(await fetchUserSkills({ id: Max.id }));
  console.log("Testing sending Max");
  console.log(await fetchUserSkills(Max));

  console.log(await fetchUserSkills({ id: Gryphon.id }));
  console.log(await fetchUserSkills({ id: Kalu.id }));

  await destroyUserSkill({
    user_skill_id: skills7.id,
    user_id: skills7.user_id,
  });
};

init();

// Express API

app.get("/api/users", async (req, res, next) => {
  try {
    res.send(await fetchUsers());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/skills", async (req, res, next) => {
  try {
    res.send(await fetchSkills());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/users/:id/userskills", async (req, res, next) => {
  try {
    res.send(await fetchUserSkills({ id: req.params.id }));
  } catch (ex) {
    next(ex);
  }
});

app.post("/api/users/:user_id/userskills/:id", async (req, res, next) => {
  try {
    res.status(201).send(
      await createUserSkill({
        user_id: req.params.user_id,
        skill_id: req.params.id,
      })
    );
  } catch (ex) {
    next(ex);
  }
});

app.delete("/api/users/:user_id/userSkills/:id", async (req, res, next) => {
  try {
    await destroyUserSkill({
      user_id: req.params.user_id,
      user_skill_id: req.params.id,
    });
    res.sendStatus(204);
  } catch (ex) {
    next(ex);
  }
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).send({ error: err.message || err });
});
