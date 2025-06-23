import { readDatabase, writeDatabase } from "../server/config/db";

export type User = {
  id: number;
  name: string;
  email: string;
};

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

const postUsers = (users: User[]) => {
  try {
    const usersData = readDatabase().users;
    if (!usersData || users.length === 0) {
      throw new Error("No users found in the database.");
    }
    const newUsers = [...usersData, ...users];
    writeDatabase({ users: newUsers });

    return newUsers;
  } catch (error) {
    throw new Error("Error writing users to database: " + error);
  }
};

const getUserById = (id: number) => {
  try {
    const usersData = readDatabase().users;
    if (!usersData) {
      throw new Error("No users found in the database.");
    }
    const user = usersData.find((user: User) => user.id === id);
    if (!user) {
      throw new Error(`User with ID ${id} not found.`);
    }
    return user;
  } catch (error) {
    return { error: `${error}` };
  }
};
const updateUserById = (id: number, updatedUser: Partial<User>) => {
  try {
    const usersData = readDatabase().users;
    if (!usersData) {
      throw new Error("No users found in the database.");
    }
    const userIndex = usersData.findIndex((user: User) => user.id === id);
    if (userIndex === -1) {
      throw new Error(`User with ID ${id} not found.`);
    }
    const allowedFields = ["id", "name", "email"];
    const updatedFields = Object.keys(updatedUser);
    const extraFields = updatedFields.filter(
      (field) => !allowedFields.includes(field)
    );
    if (extraFields.length > 0) {
      throw new Error(`Unexpected fields: ${extraFields.join(", ")}`);
    }
    usersData[userIndex] = { ...usersData[userIndex], ...updatedUser };
    writeDatabase({ users: usersData });

    return usersData[userIndex];
  } catch (error) {
    return { error: `${error}` };
  }
};

const deleteUserById = (id: number) => {
  try {
    const usersData = readDatabase().users;
    if (!usersData) {
      throw new Error("No users found in the database.");
    }
    const userIndex = usersData.findIndex((user: User) => user.id === id);
    if (userIndex === -1) {
      throw new Error(`User with ID ${id} not found.`);
    }
    usersData.splice(userIndex, 1);
    writeDatabase({ users: usersData });
    return { message: `User with ID ${id} deleted successfully.` };
  } catch (error) {
    return { error: `${error}` };
  }
};

export { getUsers, postUsers, getUserById, updateUserById, deleteUserById };
