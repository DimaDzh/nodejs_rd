import { readDatabase, writeDatabase } from "../server/config/db.js";

const getUsers = () => {
  try {
    const usersData = readDatabase().users;
    if (!usersData) {
      throw new Error("No users found in the database.");
    }
    return usersData;
  } catch (error) {
    throw new Error("Error reading users from database: " + error);
  }
};

const postUsers = (users) => {
  try {
    if (!Array.isArray(users)) {
      return { error: "Input must be an array of users." };
    }

    const usersData = readDatabase().users;
    if (!usersData) {
      return { error: "No users found in the database." };
    }

    const newUsers = users.map((user) => ({ ...user, id: Date.now() }));
    const updatedUsers = [...usersData, ...newUsers];
    writeDatabase({ users: updatedUsers });

    return newUsers;
  } catch (error) {
    return { error: `Error writing users to database: ${error.message}` };
  }
};

const getUserByParam = (value) => {
  try {
    const users = readDatabase().users;
    if (!users) throw new Error("No users found");

    const user = users.find(
      (u) =>
        u.id == value ||
        u.email === value ||
        u.name.toLowerCase() === value.toLowerCase()
    );

    if (!user) throw new Error(`User with value '${value}' not found`);
    return user;
  } catch (error) {
    return { error: `${error}` };
  }
};
const updateUserByParam = (value, updatedUser) => {
  try {
    const users = readDatabase().users;
    if (!users) throw new Error("No users found");

    const index = users.findIndex(
      (u) =>
        u.id == value ||
        u.email === value ||
        u.name.toLowerCase() === value.toLowerCase()
    );
    if (index === -1) throw new Error(`User '${value}' not found`);

    const allowedFields = ["id", "name", "email"];
    const updatedFields = Object.keys(updatedUser);
    const extraFields = updatedFields.filter((f) => !allowedFields.includes(f));
    if (extraFields.length > 0) {
      throw new Error(`Unexpected fields: ${extraFields.join(", ")}`);
    }

    users[index] = { ...users[index], ...updatedUser };
    writeDatabase({ users });
    return users[index];
  } catch (error) {
    return { error: `${error}` };
  }
};

const deleteUserByParam = (value) => {
  try {
    const users = readDatabase().users;
    if (!users) throw new Error("No users found");

    const index = users.findIndex(
      (u) =>
        u.id == value ||
        u.email === value ||
        u.name.toLowerCase() === value.toLowerCase()
    );
    if (index === -1) throw new Error(`User '${value}' not found`);

    const deleted = users.splice(index, 1);
    writeDatabase({ users });
    return { message: `Deleted user ${deleted[0].id}` };
  } catch (error) {
    return { error: `${error}` };
  }
};
export {
  getUsers,
  postUsers,
  getUserByParam,
  updateUserByParam,
  deleteUserByParam,
};
