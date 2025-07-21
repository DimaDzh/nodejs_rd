import { userRepository } from "./src/repos/users.repo";
import { pool } from "./src/database/pool.provider";

async function runDemo() {
  try {
    //1.Find by age
    const users = await userRepository.findUsers({ age: 28 });
    console.log("Found users by age:", users);
    // 2. Find one user by ID
    const user = await userRepository.findOneUser(10);
    console.log("Found user with id 10:", user);
    //3. Save a new user
    const newUser = await userRepository.createUser({
      name: "Villy Vonka",
      email: "chocalate@gmail.com",
      age: 25,
    });
    console.log("Created user:", newUser);
    if (!newUser) {
      throw new Error("Failed to create user");
    }
    if (newUser.id) {
      // 4. Update user
      const updatedUser = await userRepository.updateUser(newUser.id, {
        age: 26,
        name: "Villy Vonka Updated",
      });
      console.log("Updated user:", updatedUser);
      // 5. Delete user
      await userRepository.deleteUser(newUser.id);
      console.log(`User with id ${newUser.id} deleted successfully`);
    }
  } catch (error) {
  } finally {
    await pool.end();
    console.log("🔒 Database connection closed");
  }
}

// Run the demo
if (require.main === module) {
  runDemo().catch(console.error);
}

export { runDemo };
