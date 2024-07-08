const pg = require("pg");
const uuid = require("uuid");
const bcrypt = require("bcrypt");

const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/acme_talent_agency_db"
);

const createTables = async () => {
  let SQL = `
  
          DROP TABLE IF EXISTS users CASCADE;
          DROP TABLE IF EXISTS skills CASCADE;
          DROP TABLE IF EXISTS user_skill CASCADE;
  
          CREATE TABLE IF NOT EXISTS users(
              id UUID PRIMARY KEY,
              username VARCHAR(64) NOT NULL UNIQUE,
              password VARCHAR(128) NOT NULL UNIQUE
          );
          CREATE TABLE IF NOT EXISTS skills(
              id UUID PRIMARY KEY,
              name VARCHAR(64) NOT NULL UNIQUE
          );
          CREATE TABLE IF NOT EXISTS user_skill(
              id UUID PRIMARY KEY,
              user_id UUID REFERENCES users(id) NOT NULL,
              skill_id UUID REFERENCES skills(id) NOT NULL,
              CONSTRAINT unique_user_id_skill_id UNIQUE (user_id, skill_id)
          );
      `;

  await client.query(SQL);
};

const createUser = async ({ username, password }) => {
  const hashPassword = await bcrypt.hash(password, 5);

  const SQL = `
        INSERT INTO users(id, username, password) VALUES($1, $2, $3) RETURNING *
      `;
  const response = await client.query(SQL, [uuid.v4(), username, hashPassword]);
  return response.rows[0];
};

const createSkill = async ({ name }) => {
  const SQL = `
        INSERT INTO skills(id, name) VALUES($1, $2) RETURNING *
      `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

const createUserSkill = async ({ user_id, skill_id }) => {
  const SQL = `
        INSERT INTO user_skill(id, user_id, skill_id) 
        VALUES($1, $2, $3) 
        RETURNING *
      `;
  const response = await client.query(SQL, [uuid.v4(), user_id, skill_id]);
  return response.rows[0];
};

const fetchUsers = async () => {
  const SQL = `
    SELECT *
    FROM users
      `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchSkills = async () => {
  const SQL = `
    SELECT *
    FROM skills
      `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchUserSkills = async ({ id }) => {

  const SQL = `
       SELECT users.username as user_name, 
         skills.name as skill_name,
         user_skill.id as user_skill_id,
         user_skill.user_id as user_id,
         user_skill.skill_id as skill_id
       FROM user_skill
       INNER JOIN 
         users on users.id = user_skill.user_id
       INNER JOIN
         skills on skills.id = user_skill.skill_id   
       WHERE 
         user_skill.user_id = $1;`;

  const response = await client.query(SQL, [id]);

  return response.rows[0];
};

const destroyUserSkill = async ({ user_skill_id, user_id }) => {
    const SQL = `
          DELETE FROM user_skill
          WHERE id = $1 AND user_id=$2
      `;
    await client.query(SQL, [user_skill_id, user_id]);
  };

module.exports = {
  client,
  createTables,
  createUser,
  createSkill,
  createUserSkill,
  fetchUsers,
  fetchSkills,
  fetchUserSkills,
  destroyUserSkill
};
